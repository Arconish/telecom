import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";

import LoginPage from "../pages/LoginPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminSitesPage from "../pages/admin/AdminSitesPage";
import AdminLinksPage from "../pages/admin/AdminLinksPage";
import AdminTopologyPage from "../pages/admin/AdminTopologyPage";
import AdminLinkBudgetPage from "../pages/admin/AdminLinkBudgetPage";
import AdminMicrowaveLinkBudgetPage from "../pages/admin/AdminMicrowaveLinkBudgetPage";
import AdminLinkStatusPage from "../pages/admin/AdminLinkStatusPage";
import AdminPingPage from "../pages/admin/AdminPingPage";
import AdminImportCenterPage from "../pages/admin/AdminImportCenterPage";
import AdminTemplatesPage from "../pages/admin/AdminTemplatesPage";
import AdminPagesPage from "../pages/admin/AdminPagesPage";
import AdminNavigationPage from "../pages/admin/AdminNavigationPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminAuditLogsPage from "../pages/admin/AdminAuditLogsPage";
import AdminClientPageBuilder from "../pages/admin/AdminClientPageBuilder";

import ClientDynamicPage from "../pages/client/ClientDynamicPage";
import ClientLayout from "../components/layout/ClientLayout";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "sites", element: <AdminSitesPage /> },
      { path: "links", element: <AdminLinksPage /> },
      { path: "topology", element: <AdminTopologyPage /> },
      { path: "link-budget", element: <AdminLinkBudgetPage /> },
      { path: "microwave-link-budgets", element: <AdminMicrowaveLinkBudgetPage /> },
      { path: "client-pages", element: <AdminClientPageBuilder /> },
      { path: "link-status", element: <AdminLinkStatusPage /> },
      { path: "ping", element: <AdminPingPage /> },
      { path: "imports", element: <AdminImportCenterPage /> },
      { path: "templates", element: <AdminTemplatesPage /> },
      { path: "pages", element: <AdminPagesPage /> },
      { path: "navigation", element: <AdminNavigationPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "audit-logs", element: <AdminAuditLogsPage /> },
    ],
  },

  {
    path: "/client",
    element: (
      <ProtectedRoute allowedRoles={["admin", "client"]}>
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [{ path: "pages/:slug", element: <ClientDynamicPage /> }],
  },

  {
    path: "/client/pages/:slug",
    element: (
      <ProtectedRoute allowedRoles={["admin", "client"]}>
        <ClientDynamicPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "*",
    element: <LoginPage />,
  },
]);

export default router;
