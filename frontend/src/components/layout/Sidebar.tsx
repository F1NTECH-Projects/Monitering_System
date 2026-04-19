"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Calendar, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/hooks/useSidebar";

const menuItems = [
  { name: "Dashboard",    icon: LayoutDashboard, href: "/",             color: "#818cf8", gradient: "from-indigo-500/20 to-indigo-400/5" },
  { name: "Patients",     icon: Users,           href: "/patients",     color: "#22d3ee", gradient: "from-cyan-500/20 to-cyan-400/5" },
  { name: "Appointments", icon: Calendar,        href: "/appointments", color: "#a78bfa", gradient: "from-violet-500/20 to-violet-400/5" },
  { name: "Message Logs", icon: MessageSquare,   href: "/logs",         color: "#34d399", gradient: "from-emerald-500/20 to-emerald-400/5" },
  { name: "Settings",     icon: Settings,        href: "/settings",     color: "#fbbf24", gradient: "from-amber-500/20 to-amber-400/5" },
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
      {/* Subtle top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.3)] to-transparent" />

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[rgba(99,102,241,0.10)]" style={{ minHeight: "68px" }}>
        <motion.div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #6246ea, #7c3aed)",
            boxShadow: "0 4px 16px rgba(98,70,234,0.5)",
          }}
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Activity size={18} className="text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span
                className="font-black text-lg tracking-tight text-white block whitespace-nowrap"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Clinic<span style={{ color: "#22d3ee" }}>Flow</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--fg-muted)] leading-none mt-0.5 whitespace-nowrap">
                Healthcare OS
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
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
                    !isActive && "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[rgba(99,102,241,0.06)]"
                  )}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${item.color}22, ${item.color}0d)`,
                          border: `1px solid ${item.color}30`,
                          color: item.color,
                        }
                      : {}
                  }
                >
                  {/* Active left accent */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                      style={{ background: item.color }}
                    />
                  )}

                  <item.icon
                    size={18}
                    style={{ color: isActive ? item.color : undefined, flexShrink: 0 }}
                    className={cn(
                      "transition-all duration-200",
                      !isActive && "group-hover:scale-110",
                      !isActive && "group-hover:text-[var(--fg)]"
                    )}
                  />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18 }}
                        className="font-semibold text-sm overflow-hidden whitespace-nowrap flex-1"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="active-dot"
                      className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0"
                      style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-2.5 border-t border-[rgba(99,102,241,0.10)] space-y-1">
        {/* Clinic Info */}
        <AnimatePresence>
          {!collapsed && clinic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-3 mb-1 rounded-xl overflow-hidden"
              style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.10)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #6246ea, #22d3ee)", boxShadow: "0 2px 8px rgba(98,70,234,0.4)" }}
                >
                  {clinic.name?.charAt(0) ?? "C"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[var(--fg)] truncate">{clinic.name ?? "Clinic"}</p>
                  <p className="text-[10px] text-[var(--fg-muted)] font-medium">Premium Plan</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="btn btn-ghost btn-sm w-full justify-start gap-2.5 text-[var(--fg-muted)] hover:text-[var(--fg)]"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-danger btn-sm w-full justify-start gap-2.5"
        >
          <LogOut size={15} />
          {!collapsed && <span className="text-xs">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
