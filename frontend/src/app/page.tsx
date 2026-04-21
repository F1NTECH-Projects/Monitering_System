"use client";
import { useCallback, useState } from "react";
import { useAuth } from "@/stores/authStore";
import { clinicService, appointmentService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Users, Calendar, AlertTriangle, MessageSquare, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, Activity, Zap, ChevronRight,
  RefreshCw, Sparkles, LayoutDashboard, ArrowDownRight,
} from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import Link from "next/link";

// Lazy-load charts
const AppointmentChart = dynamic(() => import("@/components/charts/AppointmentChart"), {
  ssr: false,
  loading: () => <div className="shimmer h-full w-full rounded-xl min-h-[200px]" />,
});
const DeliveryChart = dynamic(() => import("@/components/charts/DeliveryChart"), {
  ssr: false,
  loading: () => <div className="shimmer h-full w-full rounded-xl min-h-[200px]" />,
});
const NoShowChart = dynamic(() => import("@/components/charts/NoShowChart"), {
  ssr: false,
  loading: () => <div className="shimmer w-[180px] h-[180px] rounded-full mx-auto" />,
});

interface Stats {
  total_patients: number;
  today_appointments: number;
  total_no_shows: number;
}

const RECENT_ACTIVITY = [
  { id: 1, type: "confirmed", patient: "Arjun Sharma",   time: "2m ago",  icon: CheckCircle2,  color: "#34d399",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.15)"  },
  { id: 2, type: "reminder",  patient: "Priya Patel",    time: "14m ago", icon: MessageSquare, color: "#818cf8",  bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.15)"  },
  { id: 3, type: "no-show",   patient: "Meera Reddy",    time: "1h ago",  icon: AlertTriangle, color: "#fbbf24",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.15)"  },
  { id: 4, type: "confirmed", patient: "Rahul Verma",    time: "2h ago",  icon: CheckCircle2,  color: "#34d399",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.15)"  },
  { id: 5, type: "reminder",  patient: "Sneha Gupta",    time: "3h ago",  icon: MessageSquare, color: "#a78bfa",  bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.15)" },
];

const QUICK_ACTIONS = [
  { label: "New Appointment",  icon: Calendar,     href: "/appointments", color: "#818cf8",  bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.20)"  },
  { label: "Add Patient",      icon: Users,        href: "/patients",     color: "#22d3ee",  bg: "rgba(6,182,212,0.10)",   border: "rgba(6,182,212,0.20)"   },
  { label: "Send Reminders",   icon: Zap,          href: "#",             color: "#a78bfa",  bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.20)" },
  { label: "View Logs",        icon: Activity,     href: "/logs",         color: "#fbbf24",  bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.20)"  },
];

function CountUp({ target, duration = 900 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [ran, setRan] = useState(false);
  if (!ran && target > 0) {
    setRan(true);
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
  }
  return <>{count || 0}</>;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.55 } },
};

export default function DashboardPage() {
  const clinic = useAuth((s) => s.clinic);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [error,     setError]     = useState("");
  const [lastSync,  setLastSync]  = useState<Date | null>(null);
  const [syncing,   setSyncing]   = useState(false);
  const [activity,  setActivity]  = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    if (!clinic?.id) return;
    setSyncing(true);
    try {
      const r = await clinicService.getStats(clinic.id);
      setStats(r.data);
      appointmentService.getLogs(clinic.id)
        .then((r2) => {
          const logs = r2.data?.logs ?? [];
          setActivity(logs.slice(0, 5).map((log: any, idx: number) => ({
            id: log.id ?? idx,
            type: log.message_type,
            patient: log.appointments?.patients?.name ?? "Patient",
            time: new Date(log.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            icon: log.message_type === "reminder" ? MessageSquare : CheckCircle2,
            color: log.success ? "#34d399" : "#f87171",
          })));
        })
        .catch(() => {});
      setLastSync(new Date());
      setError("");
    } catch {
      setError("Failed to load stats");
    } finally {
      setSyncing(false);
    }
  }, [clinic?.id]);

  useRealtime(fetchStats, { interval: 30_000 });

  const kpis = [
    {
      id: "total_patients",
      label: "Total Patients",
      icon: Users,
      value: stats?.total_patients ?? 0,
      trend: "+12%",
      trendUp: true,
      color: "#22d3ee",
      bg: "rgba(6,182,212,0.12)",
      border: "rgba(6,182,212,0.22)",
    },
    {
      id: "today_appointments",
      label: "Today's Appts",
      icon: Calendar,
      value: stats?.today_appointments ?? 0,
      trend: "+3",
      trendUp: true,
      color: "#818cf8",
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.22)",
    },
    {
      id: "no_shows",
      label: "No-Shows",
      icon: AlertTriangle,
      value: stats?.total_no_shows ?? 0,
      trend: "-8%",
      trendUp: false,
      color: "#fbbf24",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.22)",
    },
    {
      id: "messages_sent",
      label: "WhatsApp Sent",
      icon: MessageSquare,
      value: 94,
      trend: "94%",
      trendUp: true,
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.22)",
    },
    {
      id: "success_rate",
      label: "Success Rate",
      icon: TrendingUp,
      value: 87,
      trend: "+5%",
      trendUp: true,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.12)",
      border: "rgba(167,139,250,0.22)",
    },
  ];

  return (
    <motion.div
      className="space-y-6 pb-12"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ═══ HERO BANNER ═══ */}
      <motion.div
        variants={fadeUp}
        className="glass-card relative overflow-hidden"
        style={{ padding: "2rem 2.5rem" }}
      >
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(99,102,241,0.18) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[2px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)", transform: "translateX(-50%)" }} />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.4), rgba(34,211,238,0.3), transparent)" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
                style={{ boxShadow: "0 0 8px rgba(52,211,153,0.9)" }} />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em]">System Online</span>
              {lastSync && (
                <span className="text-[9px] text-emerald-500/60 ml-1 hidden sm:inline font-mono">
                  {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}>
              Welcome,{" "}
              <span className="text-gradient">{clinic?.name ?? "Clinic"}</span>
            </h1>
            <p className="text-[var(--fg-muted)] text-sm md:text-base max-w-lg leading-relaxed">
              Monitor real-time analytics, manage appointments, and engage seamlessly with your patients.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            {error && (
              <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                {error}
              </span>
            )}
            <motion.button
              className="btn btn-sm gap-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#22d3ee" }}
              onClick={fetchStats}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              <span className="text-xs font-semibold">{syncing ? "Syncing…" : "Sync"}</span>
            </motion.button>
            <motion.button
              className="btn btn-primary btn-sm gap-2"
              style={{ boxShadow: "0 0 24px rgba(99,102,241,0.35)" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles size={13} />
              <span className="text-xs font-semibold">Intelligence</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ═══ KPI GRID ═══ */}
      <motion.div variants={stagger}>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={14} style={{ color: "#818cf8" }} />
            <span className="text-xs font-black text-white uppercase tracking-widest">Core Metrics</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.id}
              variants={fadeUp}
              whileHover={{ y: -3, scale: 1.01 }}
              className="glass-card cursor-pointer group"
              style={{ padding: "1.25rem" }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${kpi.color}, transparent)` }} />

              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    background: kpi.trendUp ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${kpi.trendUp ? "rgba(52,211,153,0.18)" : "rgba(239,68,68,0.18)"}`,
                  }}>
                  {kpi.trendUp
                    ? <ArrowUpRight size={10} style={{ color: "#34d399" }} />
                    : <ArrowDownRight size={10} style={{ color: "#f87171" }} />
                  }
                  <span className="text-[9px] font-black" style={{ color: kpi.trendUp ? "#34d399" : "#f87171" }}>
                    {kpi.trend}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-1 leading-none"
                  style={{ fontFamily: "Outfit, sans-serif" }}>
                  {stats || kpi.id === "messages_sent" || kpi.id === "success_rate"
                    ? <CountUp target={kpi.value} />
                    : <div className="shimmer h-8 w-14 rounded-lg" />
                  }
                  {(kpi.id === "messages_sent" || kpi.id === "success_rate") && (
                    <span className="text-lg ml-0.5">%</span>
                  )}
                </h3>
                <p className="text-[11px] text-[var(--fg-muted)] font-semibold tracking-wide leading-tight">
                  {kpi.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ CHARTS ROW ═══ */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Appointment Trends — 2/3 width */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card flex flex-col" style={{ padding: "1.5rem" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                Appointment Trends
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">Weekly bookings vs completions</p>
            </div>
            <div className="flex gap-1 rounded-lg p-0.5"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(99,102,241,0.08)" }}>
              <button className="px-3 py-1.5 text-[11px] font-bold text-white rounded-md"
                style={{ background: "rgba(99,102,241,0.18)" }}>Week</button>
              <button className="px-3 py-1.5 text-[11px] font-medium text-[var(--fg-muted)] hover:text-white transition-colors">Month</button>
            </div>
          </div>
          <div className="flex-1 min-h-[240px]">
            <AppointmentChart />
          </div>
        </motion.div>

        {/* Completion Rate Donut — 1/3 width */}
        <motion.div variants={fadeUp} className="glass-card flex flex-col items-center justify-center relative overflow-hidden"
          style={{ padding: "1.5rem" }}>
          {/* Giant watermark icon */}
          <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
            <TrendingUp size={120} />
          </div>

          <div className="relative z-10 w-full text-center">
            <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              Completion Rate
            </h3>
            <p className="text-[11px] text-[var(--fg-muted)] mb-5">Patient attendance overview</p>

            {/* Ring chart with center label */}
            <div className="inline-block relative mx-auto">
              <NoShowChart rate={87} />
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-4xl font-black text-white leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>87%</span>
                <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mt-1">Excellent</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg, #6246ea, #22d3ee)" }} />
                <span className="text-[10px] text-[var(--fg-muted)] font-semibold">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(99,102,241,0.15)" }} />
                <span className="text-[10px] text-[var(--fg-muted)] font-semibold">No-Show</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Chart — full width */}
        <motion.div variants={fadeUp} className="glass-card lg:col-span-3 flex flex-col" style={{ padding: "1.5rem" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                WhatsApp Deliverability
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">Message delivery success rate over time</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">94.2% avg</span>
            </div>
          </div>
          <div className="h-[180px]">
            <DeliveryChart />
          </div>
        </motion.div>
      </motion.div>

      {/* ═══ BOTTOM ROW: Activity Feed + Quick Actions ═══ */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Live Activity Feed — 2/3 */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card" style={{ padding: "1.5rem" }}>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[rgba(99,102,241,0.08)]">
            <div>
              <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                Live Activity
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">Recent patient notifications</p>
            </div>
            <button className="flex items-center gap-1 text-[11px] font-bold text-[#818cf8] hover:text-[#a78bfa] transition-colors">
              View All <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-2.5">
            <AnimatePresence>
              {(activity.length > 0 ? activity : RECENT_ACTIVITY).map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer group transition-all hover:bg-[rgba(99,102,241,0.04)]"
                  style={{ background: item.bg || `rgba(99,102,241,0.08)`, border: `1px solid ${item.border || `rgba(99,102,241,0.15)`}` }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-[#a78bfa] transition-colors truncate">
                      {item.patient}
                    </h4>
                    <p className="text-[11px] text-[var(--fg-muted)] capitalize">{item.type} notification sent</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--fg-muted)] font-mono flex-shrink-0 px-2 py-1 rounded-md"
                    style={{ background: "rgba(0,0,0,0.25)" }}>
                    <Clock size={10} className="opacity-70" />
                    {item.time}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quick Actions — 1/3 */}
        <motion.div variants={fadeUp} className="glass-card flex flex-col" style={{ padding: "1.5rem" }}>
          <div className="mb-5 pb-4 border-b border-[rgba(99,102,241,0.08)]">
            <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              Command Center
            </h3>
            <p className="text-[11px] text-[var(--fg-muted)]">Fast access to vital operations</p>
          </div>
          <div className="flex-1 space-y-2.5">
            {QUICK_ACTIONS.map((action, idx) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <Link href={action.href}>
                  <div
                    className="flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer group transition-all"
                    style={{ background: action.bg, border: `1px solid ${action.border}` }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${action.color}18`, border: `1px solid ${action.color}28` }}>
                      <action.icon size={16} style={{ color: action.color }} />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform flex-1">
                      {action.label}
                    </span>
                    <ChevronRight size={14} className="text-[var(--fg-muted)] group-hover:text-white transition-colors flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
