"use client";

import {
  Settings, User, Bell, Shield, CreditCard, Webhook,
  MessageSquare, CheckCircle2, Save, Edit3, Phone,
  Mail, MapPin, Building2, Wifi,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/stores/authStore";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="toggle-switch cursor-pointer" onClick={onChange}>
      <input type="checkbox" checked={checked} onChange={() => {}} className="sr-only" />
      <div className="toggle-track" />
    </label>
  );
}

export default function SettingsPage() {
  const clinic = useAuth((s) => s.clinic);
  const [saving, setSaving] = useState(false);

  const [notifs, setNotifs] = useState({
    appointmentReminders: true,
    noShowAlerts: true,
    weeklyDigest: false,
    bookingConfirmations: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
  };

  const sections = [
    { id: "profile",    label: "Clinic Profile",    icon: Building2 },
    { id: "notifs",     label: "Notifications",     icon: Bell       },
    { id: "whatsapp",   label: "WhatsApp API",      icon: MessageSquare },
    { id: "billing",    label: "Billing & Plan",    icon: CreditCard  },
    { id: "security",   label: "Security",          icon: Shield      },
  ];

  return (
    <div className="page-enter space-y-7 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={16} style={{ color: "#fbbf24" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-[--foreground-muted]">
            Configuration
          </span>
        </div>
        <h2 className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          Settings
        </h2>
        <p className="text-[--foreground-muted] text-sm mt-1">
          Manage your clinic profile, integrations and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={
                    idx === 0
                      ? { background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }
                      : { color: "var(--foreground-muted)" }
                  }
                >
                  <s.icon size={15} />
                  {s.label}
                </a>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-5">

          {/* Clinic Profile */}
          <motion.section
            id="profile"
            className="glass-card p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                  <Building2 size={16} style={{ color: "#818cf8" }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Clinic Profile</h3>
                  <p className="text-[10px] text-[--foreground-muted]">Your clinic&apos;s public information</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm gap-1.5 text-[color:#818cf8]">
                <Edit3 size={13} /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Clinic Name",   value: clinic?.name ?? "Your Clinic",  icon: Building2 },
                { label: "Owner Name",    value: clinic?.owner_name ?? "–",      icon: User      },
                { label: "Phone Number",  value: "+91 98765 43210",              icon: Phone     },
                { label: "Email Address", value: "clinic@example.com",           icon: Mail      },
                { label: "Address",       value: "123 Medical Street, Delhi",    icon: MapPin    },
                { label: "Account Status",value: clinic?.is_active ? "Active" : "Inactive", icon: Wifi },
              ].map((f) => (
                <div key={f.label} className="p-3.5 rounded-xl" style={{ background: "rgba(13,18,38,0.5)", border: "1px solid rgba(99,102,241,0.08)" }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <f.icon size={12} className="text-[--foreground-muted]" />
                    <span className="text-[10px] font-bold text-[--foreground-muted] uppercase tracking-wider">{f.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{f.value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Notifications */}
          <motion.section
            id="notifs"
            className="glass-card p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <Bell size={16} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Notification Preferences</h3>
                <p className="text-[10px] text-[--foreground-muted]">Control when and how you receive alerts</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "appointmentReminders", label: "Appointment Reminders", desc: "Send WhatsApp reminders 24h before appointments" },
                { key: "noShowAlerts",          label: "No-Show Alerts",        desc: "Notify when a patient misses their appointment" },
                { key: "bookingConfirmations",  label: "Booking Confirmations", desc: "Send confirmation on new appointment creation" },
                { key: "weeklyDigest",          label: "Weekly Digest",         desc: "Summary email of the past week's activity" },
              ].map((n) => (
                <div key={n.key}
                  className="flex items-center justify-between p-4 rounded-xl transition-colors"
                  style={{ background: "rgba(13,18,38,0.5)", border: "1px solid rgba(99,102,241,0.08)" }}
                >
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{n.label}</p>
                    <p className="text-[11px] text-[--foreground-muted]">{n.desc}</p>
                  </div>
                  <Toggle
                    checked={notifs[n.key as keyof typeof notifs]}
                    onChange={() => setNotifs((p) => ({ ...p, [n.key]: !p[n.key as keyof typeof notifs] }))}
                  />
                </div>
              ))}
            </div>
          </motion.section>

          {/* WhatsApp API Status */}
          <motion.section
            id="whatsapp"
            className="glass-card p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <MessageSquare size={16} style={{ color: "#34d399" }} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>WhatsApp Cloud API</h3>
                <p className="text-[10px] text-[--foreground-muted]">Meta Business API integration status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Connection",   value: "Active",          ok: true },
                { label: "Phone ID",     value: "•••••43210",      ok: true },
                { label: "Token Status", value: "Valid (30 days)", ok: true },
                { label: "Delivery Rate",value: "94.2%",           ok: true },
              ].map((s) => (
                <div key={s.label}
                  className="flex items-center justify-between p-3.5 rounded-xl"
                  style={{ background: "rgba(13,18,38,0.5)", border: "1px solid rgba(99,102,241,0.08)" }}
                >
                  <div>
                    <p className="text-[10px] font-bold text-[--foreground-muted] uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-sm font-semibold text-white">{s.value}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${s.ok ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                    <CheckCircle2 size={14} style={{ color: s.ok ? "#34d399" : "#f87171" }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Billing */}
          <motion.section
            id="billing"
            className="glass-card p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <CreditCard size={16} style={{ color: "#a78bfa" }} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Billing & Subscription</h3>
                <p className="text-[10px] text-[--foreground-muted]">Razorpay subscription management</p>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-4"
              style={{ background: "linear-gradient(135deg, rgba(98,70,234,0.12), rgba(167,139,250,0.08))", border: "1px solid rgba(98,70,234,0.2)" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-[color:#818cf8] uppercase tracking-wider">Premium Plan</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>Active</span>
                </div>
                <p className="text-xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>₹2,499<span className="text-sm font-medium text-[--foreground-muted]">/month</span></p>
                <p className="text-xs text-[--foreground-muted] mt-1">Renews on May 1, 2026</p>
              </div>
              <button className="btn btn-outline btn-sm">Manage Subscription</button>
            </div>
          </motion.section>

          {/* Save Button */}
          <div className="flex justify-end">
            <motion.button
              className="btn btn-primary gap-2"
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {saving ? (
                <>
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
