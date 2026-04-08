"use client";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/hooks/useSidebar";

const menuItems = [
  { name: "Dashboard",   icon: LayoutDashboard, href: "/",            color: "#818cf8" },
  { name: "Patients",    icon: Users,           href: "/patients",    color: "#22d3ee" },
  { name: "Appointments",icon: Calendar,        href: "/appointments",color: "#a78bfa" },
  { name: "Message Logs",icon: MessageSquare,   href: "/logs",        color: "#34d399" },
  { name: "Settings",    icon: Settings,        href: "/settings",    color: "#fbbf24" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed: collapsed, toggle } = useSidebar();
  const logout = useAuth((s) => s.logout);
  const clinic = useAuth((s) => s.clinic);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className="sidebar hidden lg:flex flex-col"
      style={{ width: collapsed ? "72px" : "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[rgba(99,102,241,0.12)]">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6246ea, #7c3aed)",
            boxShadow: "0 4px 16px rgba(98,70,234,0.5)",
          }}
        >
          <Activity size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span
                className="font-black text-lg tracking-tight text-gradient"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Clinic<span style={{ color: "#22d3ee" }}>Flow</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[--foreground-muted] leading-none mt-0.5">
                Healthcare OS
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
            >
              <Link href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
                    isActive
                      ? "nav-active"
                      : "text-[--foreground-muted] hover:text-[--foreground] hover:bg-[rgba(99,102,241,0.08)]"
                  )}
                >
                  {/* Active left accent */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                      style={{ background: item.color }}
                    />
                  )}

                  <item.icon
                    size={18}
                    style={{ color: isActive ? item.color : undefined, flexShrink: 0 }}
                    className={cn(
                      "transition-all duration-200",
                      !isActive && "group-hover:scale-110"
                    )}
                  />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm overflow-hidden whitespace-nowrap"
                        style={{ color: isActive ? item.color : undefined }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

        <div className="space-y-3">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="font-medium text-sm">Collapse</span>}
          </button>
          
          <div className={cn("pt-4 border-t border-slate-200 dark:border-slate-800", collapsed ? "px-1" : "px-2")}>
            <MotionButton 
              variant="ghost" 
              className={cn("w-full justify-start text-danger-500 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 px-2")}
              whileHover={{ x: 5 }}
            >
              <LogOut size={20} onClick={handleLogout} style={{cursor:"pointer"}} />
              {!collapsed && <span className="ml-3 font-medium">Log out</span>}
            </MotionButton>
          </div>
        )}

        {/* Collapse button */}
        <button
          onClick={toggle}
          className="btn btn-ghost btn-sm w-full justify-start gap-2.5"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-sm w-full justify-start gap-2.5"
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-xs">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
