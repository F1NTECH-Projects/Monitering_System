"use client";
import { useCallback, useState } from "react";
import { useAuth } from "@/stores/authStore";
import { clinicService, appointmentService } from "@/services/api";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Users, Calendar, AlertTriangle, MessageSquare, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, Activity, Zap, ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";

// Lazy-load charts (they're client-only and large)
const AppointmentChart = dynamic(() => import("@/components/charts/AppointmentChart"), { ssr: false, loading: () => <div className="shimmer h-[200px] rounded-xl" /> });
const DeliveryChart    = dynamic(() => import("@/components/charts/DeliveryChart"),    { ssr: false, loading: () => <div className="shimmer h-[200px] rounded-xl" /> });
const NoShowChart      = dynamic(() => import("@/components/charts/NoShowChart"),      { ssr: false, loading: () => <div className="shimmer h-[200px] rounded-xl" /> });

interface Stats {
  total_patients: number;
  today_appointments: number;
  total_no_shows: number;
}



const QUICK_ACTIONS = [
  { label: "New Appointment",  icon: Calendar,  href: "/appointments", color: "#818cf8" },
  { label: "Add Patient",      icon: Users,     href: "/patients",     color: "#22d3ee" },
  { label: "Send All Reminders", icon: Zap,     href: "#",             color: "#34d399" },
  { label: "View Logs",        icon: Activity,  href: "/logs",         color: "#fbbf24" },
];

function CountUp({ target, duration = 900 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  // Run once on first render
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

  // 30-second real-time polling
  useRealtime(fetchStats, { interval: 30_000 });

  const kpis = [
    { id: "total_patients",     label: "Total Patients",         icon: Users,        color: "#22d3ee", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.2)",   value: stats?.total_patients ?? 0,       trend: "+12%", desc: "vs last month"  },
    { id: "today_appointments", label: "Today's Appointments",   icon: Calendar,     color: "#818cf8", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)",  value: stats?.today_appointments ?? 0,   trend: "+3",   desc: "scheduled today" },
    { id: "no_shows",           label: "Total No-Shows",         icon: AlertTriangle,color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  value: stats?.total_no_shows ?? 0,       trend: "-8%",  desc: "all time"        },
    { id: "messages_sent",      label: "WhatsApp Sent",          icon: MessageSquare,color: "#34d399", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  value: 94,                               trend: "94%",  desc: "delivery rate"   },
    { id: "success_rate",       label: "Appointment Rate",       icon: TrendingUp,   color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", value: 87,                               trend: "+5%",  desc: "completion rate" },
  ];

  return (
    <div className="page-enter space-y-8">
      {/* Hero Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
        style={{ background: "linear-gradient(135deg, rgba(98,70,234,0.18) 0%, rgba(6,182,212,0.08) 100%)", border: "1px solid rgba(98,70,234,0.25)" }}
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      >
        <div className="absolute right-0 top-0 w-64 h-64 opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 20%, rgba(98,70,234,0.8), transparent 60%)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Dashboard</span>
              {lastSync && (
                <span className="text-[10px] text-[--foreground-muted] hidden sm:inline">
                  · Last synced {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Good morning, <span className="text-gradient">{clinic?.name ?? "Clinic"}</span> 👋
            </h2>
            <p className="text-[--foreground-muted] text-sm">Here&apos;s what&apos;s happening with your clinic today.</p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Manual refresh */}
            <motion.button
              className="btn btn-ghost btn-sm gap-2"
              onClick={fetchStats}
              whileTap={{ scale: 0.9 }}
              style={{ color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
              title="Refresh stats"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              <span className="text-xs hidden sm:inline">{syncing ? "Syncing…" : "Refresh"}</span>
            </motion.button>

            <div className="text-center px-4 py-3 rounded-xl" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="text-2xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </div>
              <div className="text-[10px] font-bold text-[--foreground-muted] uppercase tracking-widest mt-0.5">
                {new Date().toLocaleDateString("en-IN", { weekday: "short" })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-[--foreground-muted] uppercase tracking-wider">Key Metrics</h3>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div key={kpi.id} className="kpi-card cursor-pointer"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}>
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                {stats || kpi.id === "messages_sent" || kpi.id === "success_rate"
                  ? <CountUp target={kpi.value} />
                  : <div className="shimmer h-7 w-12 rounded-lg mt-1" />
                }
              </div>
              <p className="text-[11px] text-[--foreground-muted] font-medium leading-tight mb-2">{kpi.label}</p>
              <div className="flex items-center gap-1">
                <ArrowUpRight size={10} style={{ color: kpi.color }} />
                <span className="text-[10px] font-bold" style={{ color: kpi.color }}>{kpi.trend}</span>
                <span className="text-[10px] text-[--foreground-muted] hidden xl:inline">{kpi.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div>
        <h3 className="text-xs font-bold text-[--foreground-muted] uppercase tracking-wider mb-4">Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Appointment Trend */}
          <motion.div className="lg:col-span-2 glass-card p-5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Weekly Appointments</h4>
                <p className="text-[10px] text-[--foreground-muted] mt-0.5">Scheduled · Completed · No-Show</p>
              </div>
              <div className="flex items-center gap-3">
                {[{ label: "Scheduled", c: "#818cf8" }, { label: "Done", c: "#34d399" }, { label: "No-Show", c: "#fbbf24" }].map(l => (
                  <div key={l.label} className="hidden sm:flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: l.c }} />
                    <span className="text-[10px] text-[--foreground-muted]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <AppointmentChart />
          </motion.div>

          {/* Completion Rate */}
          <motion.div className="glass-card p-5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
            <h4 className="font-bold text-white text-sm mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Completion Rate</h4>
            <p className="text-[10px] text-[--foreground-muted] mb-2">Appointments attended vs booked</p>
            <NoShowChart rate={87} />
          </motion.div>

          {/* Delivery Chart */}
          <motion.div className="glass-card p-5 lg:col-span-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>WhatsApp Delivery</h4>
                <p className="text-[10px] text-[--foreground-muted] mt-0.5">Messages sent vs delivered by week</p>
              </div>
              <div className="flex items-center gap-3">
                {[{ label: "Delivered", c: "#34d399" }, { label: "Failed", c: "#f87171" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: l.c }} />
                    <span className="text-[10px] text-[--foreground-muted]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <DeliveryChart />
          </motion.div>
        </div>
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity Feed */}
        <motion.div className="lg:col-span-2 glass-card p-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Recent Activity</h3>
              <p className="text-[10px] text-[--foreground-muted] mt-0.5">Latest patient interactions</p>
            </div>
            <button className="btn btn-ghost btn-sm gap-1 text-[color:#818cf8] text-xs">
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-1">
            {activity.map((item, idx) => (
              <motion.div key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[rgba(99,102,241,0.05)] cursor-pointer"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + idx * 0.07 }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}18`, border: `1px solid ${item.color}28` }}>
                  <item.icon size={15} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.patient}</p>
                  <p className="text-[11px] text-[--foreground-muted] capitalize">{item.type} notification</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[--foreground-muted] flex-shrink-0">
                  <Clock size={10} />{item.time}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions + System Status */}
        <motion.div className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 }}>
          <div className="mb-4">
            <h3 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Quick Actions</h3>
            <p className="text-[10px] text-[--foreground-muted] mt-0.5">Common tasks at a glance</p>
          </div>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((action, idx) => (
              <motion.a key={action.label} href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all group"
                style={{ background: `${action.color}0d`, border: `1px solid ${action.color}20` }}
                whileHover={{ x: 4, background: `${action.color}18` }}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.62 + idx * 0.07 }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${action.color}1a` }}>
                  <action.icon size={14} style={{ color: action.color }} />
                </div>
                <span className="text-sm font-semibold text-white">{action.label}</span>
                <ChevronRight size={13} className="ml-auto text-[--foreground-muted] transition-transform group-hover:translate-x-1" />
              </motion.a>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[rgba(99,102,241,0.1)]">
            <p className="text-[10px] font-bold text-[--foreground-muted] uppercase tracking-wider mb-3">System Status</p>
            <div className="space-y-2">
              {[
                { label: "API Backend",  ok: true  },
                { label: "WhatsApp API", ok: true  },
                { label: "Scheduler",    ok: true  },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-[--foreground-muted]">{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                    <span className={`text-[10px] font-bold ${s.ok ? "text-emerald-400" : "text-red-400"}`}>
                      {s.ok ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
