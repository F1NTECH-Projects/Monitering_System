"use client";
import { useAuth } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Search, PlusCircle, Command, Wifi,
  Menu, Zap, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import MobileMenu from "@/components/ui/MobileMenu";
import { appointmentService } from "@/services/api";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/":             { title: "Dashboard",         subtitle: "Overview & analytics"          },
  "/patients":     { title: "Patient Directory", subtitle: "Manage patient records"        },
  "/appointments": { title: "Appointments",       subtitle: "Daily schedule & calendar"    },
  "/logs":         { title: "Message Logs",       subtitle: "WhatsApp delivery tracking"   },
  "/settings":     { title: "Settings",           subtitle: "Clinic profile & preferences" },
};

export default function Navbar() {
  const clinic          = useAuth((s) => s.clinic);
  const pathname        = usePathname();
  const router          = useRouter();
  const [searchFocused, setSearchFocused]   = useState(false);
  const [mobileOpen,   setMobileOpen]       = useState(false);
  const [sending,      setSending]          = useState(false);
  const [sent,         setSent]             = useState(false);

  const page = PAGE_META[pathname] ?? { title: "ClinicFlow", subtitle: "Healthcare OS" };

  const handleBulkReminder = async () => {
    if (!clinic?.id || sending) return;
    setSending(true);
    try {
      await appointmentService.triggerReminders();
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      // silently fail — backend may not be connected yet
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <header
        className="flex items-center justify-between px-4 lg:px-8 flex-shrink-0"
        style={{
          height: "var(--navbar-height)",
          background: "rgba(8,12,26,0.88)",
          borderBottom: "1px solid rgba(99,102,241,0.12)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <motion.button
            className="btn btn-ghost btn-icon lg:hidden"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </motion.button>

          <div>
            <h1
              className="text-base lg:text-lg font-bold tracking-tight text-white leading-none"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {page.title}
            </h1>
            <p className="text-[10px] text-[--foreground-muted] mt-0.5 hidden sm:block">{page.subtitle}</p>
          </div>

          {/* Live badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <Wifi size={10} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Live</span>
          </div>
        </div>

        {/* Center — Search */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-8">
          <motion.div className="relative w-full" animate={{ scale: searchFocused ? 1.02 : 1 }} transition={{ duration: 0.2 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--foreground-muted] pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="input-field pl-9 pr-16 h-9 text-sm"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-[--foreground-muted]"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Command size={9} /><span>K</span>
            </div>
          </motion.div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 lg:gap-2">
          {/* Bulk Reminder */}
          <motion.button
            id="bulk-reminder-btn"
            className="btn btn-sm hidden sm:flex gap-1.5"
            style={
              sent
                ? { background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.35)", color: "#34d399" }
                : { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }
            }
            whileHover={{ scale: sending ? 1 : 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBulkReminder}
            disabled={sending}
            title="Trigger all upcoming WhatsApp reminders"
          >
            {sending
              ? <Loader2 size={13} className="animate-spin" />
              : <Zap size={13} />
            }
            <span className="text-xs font-semibold">
              {sent ? "Sent!" : "Remind All"}
            </span>
          </motion.button>

          {/* New Appointment */}
          <motion.button
            className="btn btn-primary btn-sm hidden md:flex gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/appointments")}
          >
            <PlusCircle size={14} />
            <span className="hidden lg:inline">New Appointment</span>
            <span className="lg:hidden">New</span>
          </motion.button>

          <div className="w-px h-6 bg-[rgba(99,102,241,0.2)] mx-0.5 hidden sm:block" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <motion.button className="btn btn-ghost btn-icon relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
              style={{ background: "#818cf8", borderColor: "var(--background)" }} />
          </motion.button>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-1.5 ml-0.5 border-l border-[rgba(99,102,241,0.2)]">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-white leading-none">{clinic?.name ?? "Clinic"}</p>
              <p className="text-[10px] text-[--foreground-muted] mt-0.5">Premium</p>
            </div>
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold cursor-pointer flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6246ea,#22d3ee)", boxShadow: "0 4px 16px rgba(98,70,234,0.4)" }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {clinic?.name?.charAt(0) ?? "C"}
            </motion.div>
          </div>
        </div>
      </header>
    </>
  );
}
