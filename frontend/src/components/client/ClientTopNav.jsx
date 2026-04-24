import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";

import {
  clientPageQueryKeys,
  fetchPublishedHybridPagesForNav,
  fetchPublishedClientPagesForNav,
} from "../../api/clientPageApi";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
import TopLoadingBar from "../common/TopLoadingBar";

function ClientTopNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { user, logout } = useAuth();
  const { pulseLoading } = useLoading();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: clientPageQueryKeys.publishedNav,
    queryFn: fetchPublishedClientPagesForNav,
  });

  const { data: hybridItems = [] } = useQuery({
    queryKey: clientPageQueryKeys.publishedHybridNav,
    queryFn: fetchPublishedHybridPagesForNav,
  });

  const navItems = useMemo(
    () =>
      items.map((item) => ({
        key: item.id,
        label: item.title,
        path: item.path,
      })),
    [items]
  );

  const hybridNavItems = useMemo(
    () =>
      hybridItems.map((item) => ({
        key: item.key,
        label: item.title,
        path: item.client_path,
      })),
    [hybridItems]
  );

  const featuredPath = navItems[0]?.path || hybridNavItems[0]?.path || null;
  const hasActiveTablePage = navItems.some((item) => item.path === location.pathname);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  const goTo = (path) => {
    if (!path || location.pathname === path) return;
    setMenuOpen(false);
    pulseLoading(300);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <TopLoadingBar />

      <div className="px-3 py-2 sm:px-5">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => goTo(featuredPath)}
              className="flex min-w-0 items-center gap-2 text-slate-900 transition hover:text-sky-700"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-400 text-white shadow-sm">
                <LayoutDashboard size={14} />
              </div>

              <div className="hidden min-w-0 sm:flex flex-col leading-tight">
                <span className="truncate text-sm font-semibold">Network Monitoring</span>
                <span className="truncate text-[11px] text-sky-700">
                  Client Workspace
                </span>
              </div>
            </button>

            <nav className="hidden min-w-0 items-center gap-3 md:flex">
              {hybridNavItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => goTo(item.path)}
                    className={[
                      "relative inline-flex h-8 items-center text-sm font-medium transition",
                      isActive
                        ? "text-sky-800"
                        : "text-slate-600 hover:text-sky-800",
                    ].join(" ")}
                  >
                    <span className="truncate">{item.label}</span>
                    <span
                      className={[
                        "absolute inset-x-0 -bottom-2 h-0.5 rounded-full transition",
                        isActive ? "bg-sky-600" : "bg-transparent",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </nav>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={[
                  "group relative inline-flex h-8 items-center gap-1.5 text-sm font-medium transition",
                  hasActiveTablePage || menuOpen
                    ? "text-sky-800"
                    : "text-slate-600 hover:text-sky-800",
                ].join(" ")}
              >
                <span>Tables</span>
                <ChevronDown
                  size={14}
                  className={`transition ${menuOpen ? "rotate-180" : ""}`}
                />
                <span
                  className={[
                    "absolute inset-x-0 -bottom-2 h-0.5 rounded-full transition",
                    hasActiveTablePage || menuOpen ? "bg-sky-600" : "bg-transparent",
                  ].join(" ")}
                />
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-full z-50 mt-3 min-w-[240px] border border-slate-200 bg-white py-2 shadow-xl">
                  {loading ? (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      Loading pages...
                    </div>
                  ) : navItems.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      No published pages
                    </div>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto">
                      {navItems.length > 0 && (
                        <div className="px-3 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Tables
                        </div>
                      )}

                      {navItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => goTo(item.path)}
                            className={[
                              "relative flex w-full items-center px-3 py-2 text-left text-sm transition",
                              isActive
                                ? "bg-sky-50 text-sky-800"
                                : "text-slate-700 hover:bg-slate-50 hover:text-sky-800",
                            ].join(" ")}
                          >
                            <span className="truncate">{item.label}</span>
                            {isActive && (
                              <span className="absolute inset-y-1 left-0 w-0.5 bg-sky-600" />
                            )}
                          </button>
                        );
                      })}

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-slate-800">
                {user?.username || "User"}
              </span>
              <span className="text-[11px] capitalize text-sky-700">
                {user?.role || ""}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ClientTopNav;
