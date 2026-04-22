"use client";

import {
  MessageSquare, CheckCircle2, XCircle, AlertCircle,
  Search, Calendar, RotateCcw, Download,
} from "lucide-react";
import { useState } from "react";
import { exportCSV } from "@/lib/csv";
import { motion } from "framer-motion";

const LOGS = [
  { id: 1, patient: "Arjun Sharma",  phone: "919876543210", type: "Reminder",         status: "success", time: "08:15 AM", date: "30 Mar 2024" },
  { id: 2, patient: "Priya Patel",   phone: "919876543211", type: "Reminder",         status: "success", time: "09:30 AM", date: "30 Mar 2024" },
  { id: 3, patient: "Meera Reddy",   phone: "919876543215", type: "No-Show Rebook",   status: "failed",  time: "11:00 AM", date: "30 Mar 2024", error: "Invalid phone number" },
  { id: 4, patient: "Rahul Verma",   phone: "919876543212", type: "Confirmation",     status: "success", time: "11:45 AM", date: "30 Mar 2024" },
  { id: 5, patient: "Sneha Gupta",   phone: "919876543213", type: "Reminder",         status: "pending", time: "12:15 PM", date: "30 Mar 2024" },
  { id: 6, patient: "Amit Singh",    phone: "919876543214", type: "Confirmation",     status: "success", time: "01:30 PM", date: "30 Mar 2024" },
  { id: 7, patient: "Vikram Kumar",  phone: "919876543216", type: "Reminder",         status: "failed",  time: "02:00 PM", date: "30 Mar 2024", error: "WhatsApp not registered" },
];

const STATUS_META = {
  success: { label: "Delivered", icon: CheckCircle2, cls: "badge-success" },
  failed:  { label: "Failed",    icon: XCircle,      cls: "badge-failed"  },
  pending: { label: "Queued",    icon: AlertCircle,  cls: "badge-pending" },
};

const TYPE_COLORS: Record<string, string> = {
  "Reminder":       "#818cf8",
  "No-Show Rebook": "#fbbf24",
  "Confirmation":   "#34d399",
};

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const success = LOGS.filter((l) => l.status === "success").length;
  const failed  = LOGS.filter((l) => l.status === "failed").length;
  const pending = LOGS.filter((l) => l.status === "pending").length;
  const rate    = Math.round((success / LOGS.length) * 100);

  const filtered = LOGS.filter((l) => {
    const matchSearch =
      !searchTerm ||
      l.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm);
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleExport = () =>
    exportCSV(filtered, "message_logs", {
      id: "ID", patient: "Patient", phone: "Phone",
      type: "Type", status: "Status", time: "Time", date: "Date",
    });

  return (
    <div className="page-enter space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} style={{ color: "#34d399" }} />
            <span className="text-xs font-bold uppercase tracking-widest text-[--foreground-muted]">
              WhatsApp Delivery Logs
            </span>
          </div>
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            Message Logs
          </h2>
          <p className="text-[--foreground-muted] text-sm mt-1">
            Track all WhatsApp reminders and confirmation deliveries.
          </p>
        </div>
        <motion.button
          id="export-logs-btn"
          className="btn btn-outline btn-sm gap-2 flex-shrink-0"
          style={{ color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
        >
          <Download size={14} />
          Export CSV
        </motion.button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sent",     value: LOGS.length, color: "#818cf8", bg: "rgba(99,102,241,0.1)",   border: "rgba(99,102,241,0.2)"  },
          { label: "Delivered",      value: success,     color: "#34d399", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.2)"  },
          { label: "Failed",         value: failed,      color: "#f87171", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.2)"   },
          { label: "Success Rate",   value: `${rate}%`,  color: "#22d3ee", bg: "rgba(6,182,212,0.1)",    border: "rgba(6,182,212,0.2)"   },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            className="kpi-card text-center"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          >
            <div className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif", color: k.color }}>
              {k.value}
            </div>
            <div className="text-[11px] font-bold text-[--foreground-muted] uppercase tracking-wider">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--foreground-muted)" }} />
          <input
            type="text"
            placeholder="Search by patient or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-premium pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[null, "success", "failed", "pending"].map((s) => (
            <button
              key={String(s)}
              onClick={() => setFilterStatus(s)}
              className="btn btn-sm"
              style={
                filterStatus === s
                  ? { background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.5)", color: "#818cf8" }
                  : { background: "transparent", border: "1px solid rgba(99,102,241,0.15)", color: "var(--foreground-muted)" }
              }
            >
              {s === null ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button className="btn btn-outline btn-sm gap-1.5">
            <Calendar size={13} />
            Date
          </button>
        </div>
      </div>

      {/* Table */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Message Type</th>
                <th>Status</th>
                <th>Sent At</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, idx) => {
                const meta = STATUS_META[log.status as keyof typeof STATUS_META];
                const StatusIcon = meta.icon;
                const typeColor = TYPE_COLORS[log.type] ?? "#818cf8";
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group"
                  >
                    {/* Patient */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #6246ea, #7c3aed)" }}
                        >
                          {log.patient.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{log.patient}</p>
                          <p className="text-[10px] text-[--foreground-muted] font-mono">{log.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td>
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md"
                        style={{ background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}25` }}
                      >
                        {log.type}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${meta.cls}`}>
                          <StatusIcon size={11} />
                          {meta.label}
                        </div>
                        {log.error && (
                          <p className="text-[10px] text-red-400 mt-0.5">{log.error}</p>
                        )}
                      </div>
                    </td>

                    {/* Time */}
                    <td>
                      <p className="text-sm font-medium text-white">{log.time}</p>
                      <p className="text-[10px] text-[--foreground-muted]">{log.date}</p>
                    </td>

                    {/* Action */}
                    <td className="text-right">
                      <motion.button
                        className="btn btn-ghost btn-sm gap-1.5 text-[color:#818cf8] hover:text-white opacity-0 group-hover:opacity-100"
                        style={{ fontSize: "0.6875rem" }}
                        whileHover={{ x: 2 }}
                      >
                        <RotateCcw size={12} />
                        Resend
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[--foreground-muted]">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No logs matching your search.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
        >
          <span className="text-xs text-[--foreground-muted]">
            Showing {filtered.length} of {LOGS.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm text-xs" disabled>← Prev</button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className="btn btn-sm text-xs w-8"
                style={n === 1 ? { background: "rgba(99,102,241,0.25)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.4)" } : { background: "transparent", color: "var(--foreground-muted)", border: "1px solid transparent" }}
              >
                {n}
              </button>
            ))}
            <button className="btn btn-ghost btn-sm text-xs">Next →</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
