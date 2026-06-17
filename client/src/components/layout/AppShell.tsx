import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { useNotifications } from "@/lib/queries/activity";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, FileText, MessageSquareQuote,
  CheckSquare, ShoppingCart, Receipt, Activity, Bell, BarChart3, User, LogOut,
  Menu, Search, ChevronsLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NavItem { label: string; icon: React.ReactNode; to: string; roles: string[] }

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={17} />, to: "/app/dashboard", roles: ["ADMIN","PROCUREMENT_OFFICER","MANAGER","VENDOR"] },
  { label: "Vendors", icon: <Building2 size={17} />, to: "/app/vendors", roles: ["ADMIN","PROCUREMENT_OFFICER"] },
  { label: "RFQs", icon: <FileText size={17} />, to: "/app/rfqs", roles: ["ADMIN","PROCUREMENT_OFFICER","MANAGER","VENDOR"] },
  { label: "Quotations", icon: <MessageSquareQuote size={17} />, to: "/app/quotations", roles: ["ADMIN","PROCUREMENT_OFFICER","MANAGER","VENDOR"] },
  { label: "Approvals", icon: <CheckSquare size={17} />, to: "/app/approvals", roles: ["MANAGER","ADMIN"] },
  { label: "Purchase Orders", icon: <ShoppingCart size={17} />, to: "/app/purchase-orders", roles: ["ADMIN","PROCUREMENT_OFFICER","MANAGER","VENDOR"] },
  { label: "Invoices", icon: <Receipt size={17} />, to: "/app/invoices", roles: ["ADMIN","PROCUREMENT_OFFICER","MANAGER","VENDOR"] },
  { label: "Activity", icon: <Activity size={17} />, to: "/app/activity", roles: ["ADMIN","PROCUREMENT_OFFICER","MANAGER"] },
  { label: "Reports", icon: <BarChart3 size={17} />, to: "/app/reports", roles: ["ADMIN","PROCUREMENT_OFFICER","MANAGER"] },
];

export function AppShell() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: { readAt: string | null }) => !n.readAt).length;

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => {});
    logout();
    navigate("/login");
    toast.success("Logged out");
  };

  const filteredNav = navItems.filter(n => n.roles.includes(user?.role || ""));

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "relative flex h-full flex-col bg-odoo-700 text-white/95 shrink-0 transition-[width] duration-300",
        collapsed && !mobile ? "w-[72px]" : "w-64"
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] noise" />
      <div className="relative flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur grid place-items-center text-white font-bold text-sm shadow-md shrink-0">
            VB
          </div>
          {!collapsed && <span className="font-bold text-base tracking-tight truncate">VendorBridge</span>}
        </div>
        {!mobile && (
          <button
            className="hidden lg:block text-white/60 hover:text-white transition-colors"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <ChevronsLeft size={16} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
        )}
      </div>

      <nav className="relative flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {filteredNav.map(item => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            end={item.to === "/app/dashboard"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-white text-odoo-700 font-medium shadow-md"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="rounded-xl bg-white/10 backdrop-blur p-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-white/20 grid place-items-center text-white text-xs font-bold shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-white/60 truncate uppercase tracking-wider">
                  {user?.role?.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="h-9 w-9 rounded-full bg-white/20 grid place-items-center text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        )}
        <div className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
          <button
            className={cn(
              "flex items-center gap-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-md py-1.5 transition-colors",
              collapsed ? "w-9 h-9 justify-center" : "w-full px-2.5"
            )}
            onClick={() => navigate("/app/settings/profile")}
            title="Profile"
          >
            <User size={14} />
            {!collapsed && <span>Profile</span>}
          </button>
          <button
            className={cn(
              "flex items-center gap-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-md py-1.5 transition-colors",
              collapsed ? "w-9 h-9 justify-center" : "w-full px-2.5"
            )}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={14} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <div className="hidden md:flex"><Sidebar /></div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b bg-card/80 backdrop-blur-xl px-4 py-3 md:px-6 z-10">
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-secondary"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search vendors, RFQs, POs..."
                className="pl-9 h-9 bg-secondary/40 border-transparent focus-visible:bg-card focus-visible:border-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => navigate("/app/notifications")}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-white text-[10px] font-bold grid place-items-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-md hover:bg-secondary transition-colors"
              onClick={() => navigate("/app/settings/profile")}
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-odoo-500 to-odoo-700 grid place-items-center text-white text-[11px] font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="hidden md:inline text-sm font-medium">{user?.firstName}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
