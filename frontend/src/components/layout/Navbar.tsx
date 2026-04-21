"use client";
import { useAuth } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Search, PlusCircle, Command, Wifi,
  Menu, Zap, Loader2, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import MobileMenu from "@/components/ui/MobileMenu";
import { appointmentService } from "@/services/api";

const PAGE_META: Record<string, { title: string; subtitle: string; emoji: string }> = {
  "/":             { title: "Dashboard",         subtitle: "Overview & real-time analytics",    emoji: "⚡" },
  "/patients":     { title: "Patient Directory",  subtitle: "Manage and monitor your patients",  emoji: "👤" },
  "/appointments": { title: "Appointments",       subtitle: "Daily schedule & calendar view",    emoji: "📅" },
  "/logs":         { title: "Message Logs",       subtitle: "WhatsApp & SMS delivery tracking",  emoji: "💬" },
  "/settings":     { title: "Settings",           subtitle: "Clinic profile & preferences",      emoji: "⚙️" },
};

export default function Navbar() {
  const clinic = useAuth((s) => s.clinic);
  const pathname        = usePathname();
  const router          = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [sending,       setSending]       = useState(false);
  const [sent,          setSent]          = useState(false);
  const [query,         setQuery]         = useState("");

  const page = PAGE_META[pathname] ?? { title: "ClinicFlow", subtitle: "Healthcare OS", emoji: "🏥" };

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
        className="flex items-center justify-between px-4 lg:px-6 flex-shrink-0 relative z-40"
        style={{
          height: "var(--navbar-height)",
          background: "rgba(4,7,18,0.90)",
          borderBottom: "1px solid rgba(99,102,241,0.10)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        {/* Top shimmer border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.25)] to-transparent" />

        {/* Left — Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger */}
          <motion.button
            className="btn btn-ghost btn-icon lg:hidden flex-shrink-0"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </motion.button>

          {/* Page info */}
          <div className="min-w-0">
            <h1
              className="text-base lg:text-[17px] font-black tracking-tight text-white leading-none truncate"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {page.title}
            </h1>
            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5 hidden sm:block truncate">
              {page.subtitle}
            </p>
          </div>

          {/* Live indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.18)",
            }}
          >
            <Wifi size={9} className="text-emerald-400" />
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Live</span>
          </div>
        </div>

        {/* Center — Search (desktop) */}
        <div className="hidden lg:flex flex-1 max-w-xs mx-6">
          <motion.div
            className="relative w-full"
            animate={{ scale: searchFocused ? 1.02 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients, appointments..."
              className="input-premium pl-8 pr-14 h-9 text-sm"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {query ? (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-white transition-colors"
                onClick={() => setQuery("")}
              >
                <X size={13} />
              </button>
            ) : (
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-[var(--fg-muted)]"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}
              >
                <Command size={9} /><span>K</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">

          {/* Bulk WhatsApp Reminder */}
          <AnimatePresence mode="wait">
            <motion.button
              id="bulk-reminder-btn"
              key={sent ? "sent" : "idle"}
              className="btn btn-sm hidden sm:flex gap-1.5"
              style={
                sent
                  ? { background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.30)", color: "#34d399" }
                  : { background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.22)", color: "#818cf8" }
              }
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: sending ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleBulkReminder}
              disabled={sending}
              title="Trigger all upcoming WhatsApp reminders"
            >
              {sending
                ? <Loader2 size={12} className="animate-spin" />
                : <Zap size={12} />
              }
              <span className="text-[11px] font-bold">
                {sent ? "Sent!" : "Remind All"}
              </span>
            </motion.button>
          </AnimatePresence>

          {/* New Appointment */}
          <motion.button
            className="btn btn-primary btn-sm hidden md:flex gap-1.5"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/appointments")}
          >
            <PlusCircle size={13} />
            <span className="hidden lg:inline text-[12px]">New Appointment</span>
            <span className="lg:hidden text-[12px]">New</span>
          </motion.button>

          <div className="w-px h-5 bg-[rgba(99,102,241,0.18)] mx-0.5 hidden sm:block" />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications bell */}
          <motion.button
            className="btn btn-ghost btn-icon relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Notifications"
          >
            <Bell size={16} className="text-[var(--fg-muted)]" />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 animate-pulse"
              style={{ background: "#818cf8", borderColor: "var(--bg)" }}
            />
          </motion.button>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-1.5 ml-0.5 border-l border-[rgba(99,102,241,0.18)]">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white leading-none">{clinic?.name ?? "Clinic"}</p>
              <p className="text-[9px] text-[var(--fg-muted)] mt-0.5 font-medium">Premium</p>
            </div>
            <motion.div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black cursor-pointer flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6246ea, #22d3ee)",
                boxShadow: "0 4px 14px rgba(98,70,234,0.45)",
              }}
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
