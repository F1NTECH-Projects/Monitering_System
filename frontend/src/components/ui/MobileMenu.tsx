"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Calendar, MessageSquare,
  Settings, LogOut, Activity, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Dashboard",    icon: LayoutDashboard, href: "/",             color: "#818cf8" },
  { name: "Patients",     icon: Users,           href: "/patients",     color: "#22d3ee" },
  { name: "Appointments", icon: Calendar,        href: "/appointments", color: "#a78bfa" },
  { name: "Message Logs", icon: MessageSquare,   href: "/logs",         color: "#34d399" },
  { name: "Settings",     icon: Settings,        href: "/settings",     color: "#fbbf24" },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const logout = useAuth((s) => s.logout);
  const clinic = useAuth((s) => s.clinic);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            style={{ background: "rgba(2,4,12,0.8)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden flex flex-col"
            style={{
              background: "rgba(5,8,18,0.98)",
              borderRight: "1px solid rgba(99,102,241,0.15)",
              backdropFilter: "blur(24px)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-[rgba(99,102,241,0.12)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #6246ea, #7c3aed)",
                    boxShadow: "0 4px 16px rgba(98,70,234,0.5)",
                  }}
                >
                  <Activity size={18} className="text-white" />
                </div>
                <span
                  className="font-black text-lg text-white"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Clinic<span style={{ color: "#22d3ee" }}>Flow</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-icon"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
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
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <div
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all relative ${
                          isActive
                            ? "text-white"
                            : "text-[var(--fg-muted)] hover:text-white hover:bg-[rgba(99,102,241,0.08)]"
                        }`}
                        style={
                          isActive
                            ? {
                                background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                                border: `1px solid ${item.color}35`,
                              }
                            : {}
                        }
                      >
                        {isActive && (
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                            style={{ background: item.color }}
                          />
                        )}
                        <item.icon size={18} style={{ color: isActive ? item.color : undefined }} />
                        <span
                          className="font-semibold text-sm"
                          style={{ color: isActive ? item.color : undefined }}
                        >
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-[rgba(99,102,241,0.12)] space-y-2">
              {clinic && (
                <div
                  className="px-3 py-3 rounded-xl mb-1"
                  style={{ background: "rgba(99,102,241,0.07)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #6246ea, #22d3ee)" }}
                    >
                      {clinic.name?.charAt(0) ?? "C"}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white truncate">{clinic.name}</p>
                      <p className="text-[10px] text-[var(--fg-muted)]">Premium Plan</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm w-full justify-start gap-2.5"
              >
                <LogOut size={16} />
                <span className="text-xs">Log Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
