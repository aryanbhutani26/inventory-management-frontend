import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Truck,
  BarChart3,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "../lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "staff"],
  },
  {
    name: "Transportation",
    href: "/transportation",
    icon: Truck,
    roles: ["admin", "staff"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "staff"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "staff"],
  },
  { name: "User Management", href: "/users", icon: Users, roles: ["admin"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden",
        )}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full w-64 bg-sidebar-background">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                TransportPro
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "nav-link",
                      location.pathname === item.href && "active",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-64 lg:flex lg:flex-col">
        <div className="bg-sidebar-background border-r border-sidebar-border flex flex-col flex-1">
          {/* Logo */}
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                TransportPro
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-4 flex-1">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "nav-link",
                      location.pathname === item.href && "active",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">
                  {user?.username}
                </p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">
                  {user?.role}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-card border-b border-border">
          <div className="flex h-16 items-center justify-between px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">TransportPro</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
