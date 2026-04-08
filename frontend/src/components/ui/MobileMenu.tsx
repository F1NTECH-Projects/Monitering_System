"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import {
  X, LayoutDashboard, Users, Calendar,
  MessageSquare, Settings, LogOut, Activity,
} from "lucide-react";

const NAV = [
  { name: "Dashboard",    icon: LayoutDashboard, href: "/",             color: "#818cf8" },
  { name: "Patients",     icon: Users,           href: "/patients",     color: "#22d3ee" },
  { name: "Appointments", icon: Calendar,        href: "/appointments", color: "#a78bfa" },
  { name: "Message Logs", icon: MessageSquare,   href: "/logs",         color: "#34d399" },
  { name: "Settings",     icon: Settings,        href: "/settings",     color: "#fbbf24" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: Props) {
  const pathname = usePathname();
  const logout   = useAuth((s) => s.logout);
  const clinic   = useAuth((s) => s.clinic);
  const router   = useRouter();

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
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col"
            style={{
              background: "rgba(8,12,26,0.97)",
              borderRight: "1px solid rgba(99,102,241,0.2)",
              backdropFilter: "blur(24px)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-[rgba(99,102,241,0.12)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#6246ea,#7c3aed)", boxShadow: "0 4px 16px rgba(98,70,234,0.5)" }}
                >
                  <Activity size={18} className="text-white" />
                </div>
                <span className="font-black text-lg text-white tracking-tight">
                  Clinic<span style={{ color: "#22d3ee" }}>Flow</span>
                </span>
              </div>
              <button onClick={onClose} className="btn btn-ghost btn-icon">
                <X size={20} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV.map((item, idx) => {
                const active = pathname === item.href;
                return (
                  <motion.div key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <div
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                        style={
                          active
                            ? {
                                background: `${item.color}18`,
                                border: `1px solid ${item.color}35`,
                                color: item.color,
                              }
                            : { color: "var(--foreground-muted)" }
                        }
                      >
                        <item.icon size={18} style={{ color: active ? item.color : undefined, flexShrink: 0 }} />
                        <span className="font-medium text-sm">{item.name}</span>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: item.color }} />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[rgba(99,102,241,0.12)] space-y-2">
              {clinic && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2"
                  style={{ background: "rgba(99,102,241,0.07)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#6246ea,#22d3ee)" }}>
                    {clinic.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{clinic.name}</p>
                    <p className="text-[10px] text-[--foreground-muted]">Premium Plan</p>
                  </div>
                </div>
              )}
              <button onClick={handleLogout} className="btn btn-danger btn-sm w-full justify-start gap-2.5">
                <LogOut size={15} />
                Log Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
