import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
import TopLoadingBar from "../common/TopLoadingBar";
import {
  LayoutDashboard,
  RadioTower,
  Activity,
  LogOut,
} from "lucide-react";

function TopNavbar() {
  const { user, logout } = useAuth();
  const { pulseLoading } = useLoading();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Sites", path: "/client", icon: RadioTower },
    { label: "Link Status", path: "/client/link-status", icon: Activity },
  ];

  const goTo = (path) => {
    if (location.pathname === path) return;
    pulseLoading(350);
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
            onClick={() => goTo("/client")}
            className="flex items-center gap-2 transition hover:text-sky-700"
          >
            <div className="flex h-8 w-8 items-center justify-center bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-sm">
              <LayoutDashboard size={15} />
            </div>

            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-semibold text-sky-950">
                Network Monitoring
              </span>
              <span className="text-[11px] text-sky-600">
                Client Workspace
              </span>
            </div>
          </button>

          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className={[
                    "inline-flex h-8 items-center gap-1.5 border px-2.5 text-xs font-medium transition",
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-sky-200 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-800",
                  ].join(" ")}
                >
                  <Icon size={14} />
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
            <span className="text-[11px] capitalize text-sky-600">
              {user?.role || ""}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex h-8 items-center gap-1.5 border border-sky-200 bg-white px-2.5 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
