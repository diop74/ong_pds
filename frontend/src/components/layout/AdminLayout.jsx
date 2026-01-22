import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Newspaper,
  Users,
  FileText,
  Mail,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
  { name: "Projets", path: "/admin/projets", icon: FolderKanban },
  { name: "Articles", path: "/admin/articles", icon: Newspaper },
  { name: "Membres", path: "/admin/membres", icon: Users },
  { name: "Documents", path: "/admin/documents", icon: FileText },
  { name: "Messages", path: "/admin/messages", icon: Mail },
  { name: "Paramètres", path: "/admin/parametres", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="admin-layout" data-testid="admin-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar-container fixed lg:sticky top-0 left-0 h-screen z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        data-testid="admin-sidebar"
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <h1 className="font-bold text-sm">Porte du Savoir</h1>
              <p className="text-xs text-white/60">Administration</p>
            </div>
            <button
              className="lg:hidden ml-auto p-1 rounded hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`admin-nav-item flex items-center gap-3 ${isActive ? "active" : ""}`}
                  data-testid={`admin-nav-${item.name.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="px-2 mb-4">
              <p className="text-white font-medium text-sm">{user.name || "Admin"}</p>
              <p className="text-white/60 text-xs">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
            data-testid="mobile-sidebar-toggle"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {navItems.find((item) => item.path === location.pathname)?.name || "Admin"}
            </h2>
          </div>
          <Link to="/" className="text-sm text-sky-600 hover:text-sky-700">
            Voir le site
          </Link>
        </header>

        {/* Page Content */}
        <main className="admin-content flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
