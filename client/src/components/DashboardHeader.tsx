/**
 * DashboardHeader.tsx
 *
 * Sticky header rendered on every dashboard page.
 * Uses useAuth().logout instead of trpc.auth.logout directly
 * so it works in both DEMO mode and production mode.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import {
  LogOut, User, Home, ShoppingBag, LayoutDashboard,
  Package, ShoppingCart, ClipboardList, Link2, BarChart2,
  Users, Truck, Tag, Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface DashboardHeaderProps { title: string; subtitle?: string; role?: string; }

const roleNav: Record<string, { label: string; path: string; icon: any }[]> = {
  buyer: [
    { label: "Dashboard",       path: "/buyer",    icon: LayoutDashboard },
    { label: "Browse Products", path: "/mall",     icon: Package },
    { label: "My Cart",         path: "/cart",     icon: ShoppingCart },
    { label: "My Orders",       path: "/orders",   icon: ClipboardList },
    { label: "Profile",         path: "/profile",  icon: User },
  ],
  admin: [
    { label: "Dashboard",  path: "/admin",            icon: LayoutDashboard },
    { label: "Users",      path: "/admin/users",      icon: Users },
    { label: "Analytics",  path: "/admin/analytics",  icon: BarChart2 },
    { label: "Affiliates", path: "/admin/affiliates", icon: Link2 },
  ],
  manager: [
    { label: "Dashboard",  path: "/manager",            icon: LayoutDashboard },
    { label: "Products",   path: "/manager/products",   icon: Package },
    { label: "Inventory",  path: "/manager/inventory",  icon: Warehouse },
    { label: "Categories", path: "/manager/categories", icon: Tag },
  ],
  delivery: [
    { label: "Dashboard", path: "/delivery",        icon: LayoutDashboard },
    { label: "My Orders", path: "/delivery/orders", icon: Truck },
  ],
  reader: [
    { label: "Dashboard", path: "/affiliate",           icon: LayoutDashboard },
    { label: "Referrals", path: "/affiliate/referrals", icon: Link2 },
    { label: "Earnings",  path: "/affiliate/earnings",  icon: BarChart2 },
  ],
  developer: [
    { label: "Dashboard", path: "/developer",           icon: LayoutDashboard },
    { label: "Analytics", path: "/developer/analytics", icon: BarChart2 },
  ],
  stock_manager: [
    { label: "Dashboard",    path: "/stock-manager",           icon: LayoutDashboard },
    { label: "Adjust Stock", path: "/stock-manager/adjust",    icon: Warehouse },
    { label: "Low Stock",    path: "/stock-manager/low-stock", icon: Package },
    { label: "History",      path: "/stock-manager/history",   icon: ClipboardList },
  ],
};

const roleBadge: Record<string, string> = {
  admin:         "bg-red-100 text-red-800",
  manager:       "bg-blue-100 text-blue-800",
  stock_manager: "bg-teal-100 text-teal-800",
  delivery:      "bg-amber-100 text-amber-800",
  reader:        "bg-purple-100 text-purple-800",
  developer:     "bg-green-100 text-green-800",
  buyer:         "bg-slate-100 text-slate-700",
};

const roleLabel: Record<string, string> = {
  admin:         "Admin",
  manager:       "Manager",
  stock_manager: "Stock Manager",
  delivery:      "Delivery",
  reader:        "Affiliate",
  developer:     "Developer",
  buyer:         "Buyer",
};

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out");
      setTimeout(() => navigate("/"), 300);
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  };

  const role = (user as any)?.role ?? "buyer";
  const navItems = roleNav[role] ?? [];

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 leading-tight">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role badge — desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                {(user as any)?.name || "User"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[role]}`}>
                {roleLabel[role]}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 hover:opacity-90 text-white font-bold text-sm"
                >
                  {((user as any)?.name?.charAt(0) ?? "U").toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-semibold">{(user as any)?.name || "User"}</span>
                  <span className="text-xs text-slate-500 font-normal">{(user as any)?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")} className="gap-2 cursor-pointer">
                  <Home className="w-4 h-4" /> Home
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="gap-2 cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Logging out…" : "Log Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Role nav tabs */}
        {navItems.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {navItems.map(({ label, path, icon: Icon }) => {
              const active = location === path || (path !== "/" && location.startsWith(path + "/"));
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
