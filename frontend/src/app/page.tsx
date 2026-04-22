"use client";
import { useCallback, useState } from "react";
import { useAuth } from "@/stores/authStore";
import { clinicService, appointmentService } from "@/services/api";
import axios from "axios";
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

interface ClinicStats {
  total_patients: number;
  today_appointments: number;
  total_no_shows: number;
}

interface AnalyticsOverview {
  total_patients: number;
  today_appointments: number;
  month_appointments: number;
  completion_rate: number;
  total_no_shows: number;
  messages_sent: number;
  delivery_rate: number;
}

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
  const token  = useAuth((s) => s.token);

  const [stats,     setStats]     = useState<ClinicStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [error,     setError]     = useState("");
  const [lastSync,  setLastSync]  = useState<Date | null>(null);
  const [syncing,   setSyncing]   = useState(false);
  const [activity,  setActivity]  = useState<any[]>([]);

  const fetchStats = useCallback(async () => {
    if (!clinic?.id || !token) return;
    setSyncing(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      // Fetch clinic stats (today's appointments, total patients, no-shows)
      const statsRes = await clinicService.getStats(clinic.id);
      setStats(statsRes.data);

      // Fetch analytics overview (messages sent, delivery rate, completion rate)
      const analyticsRes = await axios.get(
        `${url}/analytics/clinic/${clinic.id}/overview`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(analyticsRes.data);

      // Fetch recent message logs for activity feed
      try {
        const logsRes = await appointmentService.getLogs(clinic.id);
        const logs = logsRes.data?.logs ?? [];
        setActivity(
          logs.slice(0, 5).map((log: any, idx: number) => ({
            id: log.id ?? idx,
            type: log.message_type ?? "reminder",
            patient: log.patient_phone ?? "Patient",
            time: log.sent_at
              ? new Date(log.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "—",
            icon: log.message_type === "reminder" ? MessageSquare : CheckCircle2,
            color: log.success ? "#34d399" : "#f87171",
            bg: log.success ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
            border: log.success ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
          }))
        );
      } catch {
        // logs fetch is non-critical
      }

      setLastSync(new Date());
      setError("");
    } catch {
      setError("Failed to load stats");
    } finally {
      setSyncing(false);
    }
  }, [clinic?.id, token]);

  useRealtime(fetchStats, { interval: 30_000 });

  // Build KPIs from real data
  const kpis = [
    {
      id: "total_patients",
      label: "Total Patients",
      icon: Users,
      value: analytics?.total_patients ?? stats?.total_patients ?? 0,
      color: "#22d3ee",
      bg: "rgba(6,182,212,0.12)",
      border: "rgba(6,182,212,0.22)",
      isLoaded: !!(analytics || stats),
    },
    {
      id: "today_appointments",
      label: "Today's Appts",
      icon: Calendar,
      value: analytics?.today_appointments ?? stats?.today_appointments ?? 0,
      color: "#818cf8",
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.22)",
      isLoaded: !!(analytics || stats),
    },
    {
      id: "no_shows",
      label: "No-Shows",
      icon: AlertTriangle,
      value: analytics?.total_no_shows ?? stats?.total_no_shows ?? 0,
      color: "#fbbf24",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.22)",
      isLoaded: !!(analytics || stats),
    },
    {
      id: "messages_sent",
      label: "Messages Sent",
      icon: MessageSquare,
      value: analytics?.messages_sent ?? 0,
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.22)",
      isLoaded: !!analytics,
    },
    {
      id: "delivery_rate",
      label: "Delivery Rate",
      icon: TrendingUp,
      value: analytics?.delivery_rate ?? 0,
      suffix: "%",
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.12)",
      border: "rgba(167,139,250,0.22)",
      isLoaded: !!analytics,
    },
  ];

  // Completion rate for the donut chart — from real analytics
  const completionRate = analytics?.completion_rate ?? 0;

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
        <div className="absolute top-0 right-0 w-[400px] h-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(99,102,241,0.18) 0%, transparent 65%)" }} />
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.4), rgba(34,211,238,0.3), transparent)" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
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
              <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${kpi.color}, transparent)` }} />

              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}>
                  <kpi.icon size={16} style={{ color: kpi.color }} />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white mb-1 leading-none"
                  style={{ fontFamily: "Outfit, sans-serif" }}>
                  {kpi.isLoaded ? (
                    <>
                      <CountUp target={kpi.value} />
                      {(kpi as any).suffix && <span className="text-lg ml-0.5">{(kpi as any).suffix}</span>}
                    </>
                  ) : (
                    <div className="shimmer h-8 w-14 rounded-lg" />
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

        {/* Appointment Trends */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card flex flex-col" style={{ padding: "1.5rem" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                Appointment Trends
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">Last 7 days from MongoDB</p>
            </div>
          </div>
          <div className="flex-1 min-h-[240px]">
            <AppointmentChart />
          </div>
        </motion.div>

        {/* Completion Rate Donut — real data */}
        <motion.div variants={fadeUp} className="glass-card flex flex-col items-center justify-center relative overflow-hidden"
          style={{ padding: "1.5rem" }}>
          <div className="relative z-10 w-full text-center">
            <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
              Completion Rate
            </h3>
            <p className="text-[11px] text-[var(--fg-muted)] mb-5">This month's attendance</p>

            <div className="inline-block relative mx-auto">
              <NoShowChart rate={completionRate} />
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                {analytics ? (
                  <>
                    <span className="text-4xl font-black text-white leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {completionRate}%
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1"
                      style={{ color: completionRate >= 80 ? "#34d399" : completionRate >= 60 ? "#fbbf24" : "#f87171" }}>
                      {completionRate >= 80 ? "Excellent" : completionRate >= 60 ? "Good" : "Needs Work"}
                    </span>
                  </>
                ) : (
                  <div className="shimmer h-10 w-16 rounded-lg" />
                )}
              </div>
            </div>

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

        {/* Delivery Chart */}
        <motion.div variants={fadeUp} className="glass-card lg:col-span-3 flex flex-col" style={{ padding: "1.5rem" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                WhatsApp Deliverability
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">Weekly delivery success from MongoDB</p>
            </div>
            {analytics && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  {analytics.delivery_rate}% avg
                </span>
              </div>
            )}
          </div>
          <div className="h-[180px]">
            <DeliveryChart />
          </div>
        </motion.div>
      </motion.div>

      {/* ═══ BOTTOM ROW: Activity Feed + Quick Actions ═══ */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Live Activity Feed */}
        <motion.div variants={fadeUp} className="lg:col-span-2 glass-card" style={{ padding: "1.5rem" }}>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[rgba(99,102,241,0.08)]">
            <div>
              <h3 className="font-black text-base text-white mb-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                Recent Messages
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">Latest notifications sent to patients</p>
            </div>
            <Link href="/logs" className="flex items-center gap-1 text-[11px] font-bold text-[#818cf8] hover:text-[#a78bfa] transition-colors">
              View All <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {activity.length === 0 ? (
              <div className="text-center py-8 text-[var(--fg-muted)] text-sm">
                {syncing ? "Loading..." : "No messages sent yet. Trigger a reminder to see activity here."}
              </div>
            ) : (
              <AnimatePresence>
                {activity.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl group transition-all"
                    style={{ background: item.bg, border: `1px solid ${item.border}` }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <item.icon size={16} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate font-mono">{item.patient}</h4>
                      <p className="text-[11px] text-[var(--fg-muted)] capitalize">
                        {item.type?.replace(/_/g, " ")} sent
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--fg-muted)] font-mono flex-shrink-0 px-2 py-1 rounded-md"
                      style={{ background: "rgba(0,0,0,0.25)" }}>
                      <Clock size={10} className="opacity-70" />
                      {item.time}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
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
