import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileStack, LogOut } from "lucide-react";

import { getPublishedClientPagesForNavApi } from "../../api/clientPageApi";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
import TopLoadingBar from "../common/TopLoadingBar";

function ClientTopNav() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();
  const { pulseLoading } = useLoading();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        setLoading(true);
        const data = await getPublishedClientPagesForNavApi();
        setItems(data || []);
      } catch (error) {
        console.error("Failed to load client nav items", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNavItems();
  }, []);

  const navItems = useMemo(
    () =>
      items.map((item) => ({
        key: item.id,
        label: item.title,
        path: item.path,
      })),
    [items]
  );

  const goTo = (path) => {
    if (!path || location.pathname === path) return;
    pulseLoading(300);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/90 backdrop-blur-md">
      <TopLoadingBar />

      <div className="flex min-h-12 items-center justify-between gap-3 px-3 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => goTo(navItems[0]?.path)}
            className="flex items-center gap-2 transition hover:text-sky-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-sm">
              <LayoutDashboard size={15} />
            </div>

            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-sky-950">Network Ops</span>
              <span className="text-[11px] text-sky-600">Client Workspace</span>
            </div>
          </button>

          <nav className="flex flex-wrap items-center gap-1">
            {loading && (
              <div className="px-2 text-xs text-slate-400">Loading pages...</div>
            )}

            {!loading && navItems.length === 0 && (
              <div className="px-2 text-xs text-slate-400">No published pages</div>
            )}

            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.key}
                  onClick={() => goTo(item.path)}
                  className={[
                    "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition",
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-sky-200 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-800",
                  ].join(" ")}
                >
                  <FileStack size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs font-semibold text-slate-800">
              {user?.username || "User"}
            </span>
            <span className="text-[11px] capitalize text-sky-600">{user?.role || ""}</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-sky-200 bg-white px-2.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
    <div className="border-b border-slate-200 bg-white">
      <div className="flex w-full items-center gap-2 overflow-x-auto px-3 py-2">
        {loading && (
          <div className="px-2 text-xs text-slate-400">Loading pages...</div>
        )}

        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              [
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")
            }
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default ClientTopNav;
