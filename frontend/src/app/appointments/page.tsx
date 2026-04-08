"use client";

import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock,
  CheckCircle2, XCircle, AlertCircle, MoreVertical,
  Phone, MessageSquare, Search, Filter, TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const APPOINTMENTS = [
  { id: 1, patient: "Arjun Sharma",     time: "09:00 AM", status: "completed", type: "First Visit",   duration: "30 min" },
  { id: 2, patient: "Priya Patel",      time: "10:15 AM", status: "completed", type: "Consultation",  duration: "45 min" },
  { id: 3, patient: "Rahul Verma",      time: "11:30 AM", status: "scheduled", type: "Follow-up",     duration: "15 min" },
  { id: 4, patient: "Sneha Gupta",      time: "12:45 PM", status: "scheduled", type: "Check-up",      duration: "30 min" },
  { id: 5, patient: "Amit Singh",       time: "02:00 PM", status: "scheduled", type: "Procedure",     duration: "60 min" },
  { id: 6, patient: "Meera Reddy",      time: "03:30 PM", status: "no-show",   type: "Follow-up",     duration: "15 min" },
  { id: 7, patient: "Vikram Malhotra",  time: "04:15 PM", status: "cancelled", type: "Consultation",  duration: "30 min" },
];

const STATUS = {
  scheduled: { label: "Scheduled", icon: Clock,         cls: "badge-scheduled" },
  completed:  { label: "Completed", icon: CheckCircle2,  cls: "badge-completed" },
  "no-show":  { label: "No-Show",   icon: AlertCircle,   cls: "badge-noshow"    },
  cancelled:  { label: "Cancelled", icon: XCircle,       cls: "badge-cancelled" },
};

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export default function AppointmentsPage() {
  const [baseDate, setBaseDate] = useState(new Date());

  const dateStr = baseDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const dayStr  = baseDate.toLocaleDateString("en-IN", { weekday: "long" });

  const scheduled  = APPOINTMENTS.filter((a) => a.status === "scheduled").length;
  const completed  = APPOINTMENTS.filter((a) => a.status === "completed").length;
  const noShows    = APPOINTMENTS.filter((a) => a.status === "no-show").length;
  const cancelled  = APPOINTMENTS.filter((a) => a.status === "cancelled").length;

  return (
    <div className="page-enter space-y-7 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} style={{ color: "#818cf8" }} />
            <span className="text-xs font-bold uppercase tracking-widest text-[--foreground-muted]">
              Daily Schedule
            </span>
          </div>
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            Appointments
          </h2>
          <p className="text-[--foreground-muted] text-sm mt-1">
            Track, manage and update patient visits.
          </p>
        </div>

        <motion.button
          className="btn btn-primary gap-2 flex-shrink-0"
          whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(98,70,234,0.55)" }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={16} />
          Schedule Appointment
        </motion.button>
      </div>

      {/* Date Navigator + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Date selector */}
        <div
          className="lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-3">
            <motion.button
              className="btn btn-outline btn-icon flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setBaseDate(addDays(baseDate, -1))}
            >
              <ChevronLeft size={16} />
            </motion.button>
            <div className="text-center min-w-[180px]">
              <div className="font-bold text-white text-base" style={{ fontFamily: "Outfit, sans-serif" }}>
                {dateStr}
              </div>
              <div className="text-xs text-[--foreground-muted]">{dayStr}</div>
            </div>
            <motion.button
              className="btn btn-outline btn-icon flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setBaseDate(addDays(baseDate, 1))}
            >
              <ChevronRight size={16} />
            </motion.button>
            <button
              className="btn btn-ghost btn-sm text-xs"
              style={{ color: "#818cf8" }}
              onClick={() => setBaseDate(new Date())}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--foreground-muted] pointer-events-none" />
              <input placeholder="Patient name..." className="input-field pl-8 h-9 text-xs w-44" />
            </div>
            <button className="btn btn-outline btn-sm gap-1.5">
              <Filter size={13} />
              Filter
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div
          className="flex flex-col justify-center p-4 rounded-2xl text-center"
          style={{ background: "linear-gradient(135deg, rgba(98,70,234,0.2), rgba(124,58,237,0.15))", border: "1px solid rgba(98,70,234,0.3)" }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-[--foreground-muted] mb-1">Today&apos;s Total</div>
          <div className="text-5xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            {APPOINTMENTS.length.toString().padStart(2, "0")}
          </div>
          <div className="text-[10px] text-[--foreground-muted] font-medium">appointments</div>
          <div className="flex justify-center gap-3 mt-3 flex-wrap">
            <span className="text-[10px] font-bold text-emerald-400">{completed} done</span>
            <span className="text-[10px] font-bold text-[color:#818cf8]">{scheduled} pending</span>
            <span className="text-[10px] font-bold text-amber-400">{noShows} no-show</span>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { label: "All",       count: APPOINTMENTS.length, color: "#818cf8" },
          { label: "Scheduled", count: scheduled,     color: "#818cf8" },
          { label: "Completed", count: completed,     color: "#34d399" },
          { label: "No-Show",   count: noShows,       color: "#fbbf24" },
          { label: "Cancelled", count: cancelled,     color: "#f87171" },
        ].map((tab, i) => (
          <button
            key={tab.label}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              i === 0 ? "text-white" : "text-[--foreground-muted] hover:text-white"
            }`}
            style={
              i === 0
                ? { background: `${tab.color}20`, border: `1px solid ${tab.color}40`, color: tab.color }
                : { border: "1px solid transparent" }
            }
          >
            {tab.label}
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px]"
              style={{ background: `${tab.color}18`, color: tab.color }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <AnimatePresence>
          {APPOINTMENTS.map((appt, idx) => {
            const meta = STATUS[appt.status as keyof typeof STATUS];
            const StatusIcon = meta.icon;
            return (
              <motion.div
                key={appt.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="glass-card overflow-hidden flex">
                  {/* Time column */}
                  <div
                    className="flex-shrink-0 w-28 flex flex-col items-center justify-center py-5 gap-1"
                    style={{ background: "rgba(13,18,38,0.6)", borderRight: "1px solid rgba(99,102,241,0.08)" }}
                  >
                    <Clock size={13} style={{ color: "#818cf8" }} />
                    <span className="text-xs font-black text-white tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {appt.time}
                    </span>
                    <span className="text-[10px] text-[--foreground-muted] font-medium">{appt.duration}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #6246ea, #7c3aed)" }}
                      >
                        {appt.patient.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>
                          {appt.patient}
                        </h3>
                        <p className="text-xs text-[--foreground-muted]">{appt.type} · Clinic</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                      {/* Badge */}
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${meta.cls}`}>
                        <StatusIcon size={11} />
                        {meta.label}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5">
                        <motion.button className="btn btn-ghost btn-icon" whileHover={{ scale: 1.1 }}
                          style={{ "--color": "#34d399" } as React.CSSProperties}>
                          <CheckCircle2 size={16} className="text-[--foreground-muted] hover:text-emerald-400 transition-colors" />
                        </motion.button>
                        <motion.button className="btn btn-ghost btn-icon" whileHover={{ scale: 1.1 }}>
                          <Phone size={16} className="text-[--foreground-muted] hover:text-[color:#818cf8] transition-colors" />
                        </motion.button>
                        <motion.button className="btn btn-ghost btn-icon" whileHover={{ scale: 1.1 }}>
                          <MessageSquare size={16} className="text-[--foreground-muted] hover:text-white transition-colors" />
                        </motion.button>
                        <motion.button className="btn btn-ghost btn-icon" whileHover={{ scale: 1.1 }}>
                          <MoreVertical size={16} className="text-[--foreground-muted]" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
