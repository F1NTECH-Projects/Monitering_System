"use client";

import {
  Settings, User, Bell, Shield, CreditCard,
  MessageSquare, CheckCircle2, Save, Edit3, Phone,
  Mail, MapPin, Building2, Wifi, ChevronRight,
  Zap, Database, Globe,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/stores/authStore";
import axios from "axios";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-all flex-shrink-0 cursor-pointer"
      style={
        checked
          ? { background: "rgba(98,70,234,0.35)", border: "1px solid rgba(98,70,234,0.55)", boxShadow: "0 0 12px rgba(98,70,234,0.3)" }
          : { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)" }
      }
      aria-label="toggle"
    >
      <motion.div
        className="absolute top-0.5 w-[18px] h-[18px] rounded-full"
        animate={{ x: checked ? 20 : 2, background: checked ? "#818cf8" : "var(--fg-muted)" }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />
    </button>
  );
}

const SECTIONS = [
  { id: "profile",   label: "Clinic Profile",     icon: Building2,  color: "#818cf8" },
  { id: "notifs",    label: "Notifications",       icon: Bell,       color: "#fbbf24" },
  { id: "whatsapp",  label: "WhatsApp API",        icon: MessageSquare, color: "#34d399" },
  { id: "billing",   label: "Billing & Plan",      icon: CreditCard, color: "#a78bfa" },
  { id: "security",  label: "Security",            icon: Shield,     color: "#f87171" },
];

export default function SettingsPage() {
  const { clinic, token, setAuth } = useAuth();
  
  const [upiId, setUpiId] = useState(clinic?.upi_id || "");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  const [notifs, setNotifs] = useState({
    appointmentReminders: true,
    noShowAlerts:         true,
    weeklyDigest:         false,
    bookingConfirmations: true,
    smsBackup:            true,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeSection === "profile" && clinic && token) {
        const res = await axios.patch(
          `http://localhost:8000/api/v1/clinics/${clinic.id}`,
          { upi_id: upiId || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setAuth(token, res.data.clinic);
        }
      } else {
        await new Promise((r) => setTimeout(r, 1200));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter space-y-6 pb-10">
      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Settings size={13} style={{ color: "#fbbf24" }} />
          <span className="text-[10px] font-black text-[var(--fg-muted)] uppercase tracking-[0.15em]">Configuration</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          Settings
        </h2>
        <p className="text-[var(--fg-muted)] text-sm mt-1">
          Manage your clinic profile, integrations and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Sidebar Nav ─────────────────────────────── */}
        <div className="lg:col-span-1">
          <nav className="space-y-1 lg:sticky lg:top-4">
            {SECTIONS.map((s, idx) => (
              <motion.button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={
                  activeSection === s.id
                    ? { background: `${s.color}15`, border: `1px solid ${s.color}28`, color: s.color }
                    : { color: "var(--fg-muted)", border: "1px solid transparent" }
                }
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={activeSection !== s.id ? { x: 3 } : {}}
              >
                <s.icon size={15} style={{ color: activeSection === s.id ? s.color : undefined }} />
                <span className="flex-1 text-left">{s.label}</span>
                {activeSection === s.id && <ChevronRight size={13} />}
              </motion.button>
            ))}
          </nav>
        </div>

        {/* ── Main Content ─────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* ─ Clinic Profile ─ */}
          <AnimatePresence mode="wait">
            {activeSection === "profile" && (
              <motion.section
                key="profile"
                id="profile"
                className="glass-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)" }}>
                      <Building2 size={16} style={{ color: "#818cf8" }} />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Clinic Profile</h3>
                      <p className="text-[10px] text-[var(--fg-muted)]">Your clinic&apos;s public information</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm gap-1.5" style={{ color: "#818cf8" }}>
                    <Edit3 size={13} /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Clinic Name",    value: clinic?.name ?? "Your Clinic", icon: Building2 },
                    { label: "Owner Name",     value: clinic?.owner_name ?? "–",     icon: User      },
                    { label: "Phone Number",   value: "+91 98765 43210",             icon: Phone     },
                    { label: "Email Address",  value: "clinic@example.com",          icon: Mail      },
                    { label: "Address",        value: "123 Medical Street, Delhi",   icon: MapPin    },
                    { label: "Account Status", value: clinic?.is_active ? "Active" : "Inactive", icon: Wifi },
                  ].map((f) => (
                    <div key={f.label} className="p-3.5 rounded-xl"
                      style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(99,102,241,0.07)" }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <f.icon size={11} className="text-[var(--fg-muted)]" />
                        <span className="text-[9px] font-black text-[var(--fg-muted)] uppercase tracking-wider">{f.label}</span>
                      </div>
                      <p className="text-sm font-bold text-white">{f.value}</p>
                    </div>
                  ))}
                  
                  {/* UPI Settings */}
                  <div className="p-3.5 rounded-xl col-span-1 sm:col-span-2"
                      style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(99,102,241,0.07)" }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <CreditCard size={11} className="text-[#a78bfa]" />
                        <span className="text-[9px] font-black text-[#a78bfa] uppercase tracking-wider">Payment / UPI Details</span>
                      </div>
                      <div className="mt-2">
                         <input 
                           type="text"
                           className="input w-full bg-[#0a0a0a]"
                           placeholder="Enter your Clinic's UPI ID or Link..."
                           value={upiId}
                           onChange={(e) => setUpiId(e.target.value)}
                         />
                         <p className="text-[10px] text-[var(--fg-muted)] mt-1">
                           Patients will use this UPI ID to pay for online appointments. You must save to apply changes.
                         </p>
                      </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ─ Notifications ─ */}
            {activeSection === "notifs" && (
              <motion.section
                key="notifs"
                id="notifs"
                className="glass-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.18)" }}>
                    <Bell size={16} style={{ color: "#fbbf24" }} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Notification Preferences</h3>
                    <p className="text-[10px] text-[var(--fg-muted)]">Control when and how you receive alerts</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { key: "appointmentReminders", label: "Appointment Reminders",   icon: Zap,            desc: "Send WhatsApp reminders 24h before appointments" },
                    { key: "noShowAlerts",          label: "No-Show Alerts",          icon: Bell,           desc: "Notify when a patient misses their appointment" },
                    { key: "bookingConfirmations",  label: "Booking Confirmations",   icon: CheckCircle2,   desc: "Send confirmation on new appointment creation" },
                    { key: "smsBackup",             label: "SMS Backup Enable",       icon: Phone,          desc: "Use SMS when WhatsApp delivery fails" },
                    { key: "weeklyDigest",          label: "Weekly Digest Email",     icon: Mail,           desc: "Summary email of the past week's activity" },
                  ].map((n) => (
                    <div key={n.key}
                      className="flex items-center justify-between p-4 rounded-xl transition-colors"
                      style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(99,102,241,0.07)" }}>
                      <div className="flex items-start gap-3">
                        <n.icon size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--fg-muted)" }} />
                        <div>
                          <p className="text-sm font-bold text-white mb-0.5">{n.label}</p>
                          <p className="text-[11px] text-[var(--fg-muted)]">{n.desc}</p>
                        </div>
                      </div>
                      <Toggle
                        checked={notifs[n.key as keyof typeof notifs]}
                        onChange={() => setNotifs((p) => ({ ...p, [n.key]: !p[n.key as keyof typeof notifs] }))}
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ─ WhatsApp API ─ */}
            {activeSection === "whatsapp" && (
              <motion.section
                key="whatsapp"
                id="whatsapp"
                className="glass-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.18)" }}>
                    <MessageSquare size={16} style={{ color: "#34d399" }} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>WhatsApp Cloud API</h3>
                    <p className="text-[10px] text-[var(--fg-muted)]">Meta Business API integration status</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Connection",    value: "Active",           ok: true  },
                    { label: "Phone ID",      value: "•••••43210",       ok: true  },
                    { label: "Token Status",  value: "Valid (30 days)",  ok: true  },
                    { label: "Delivery Rate", value: "94.2%",            ok: true  },
                    { label: "Daily Limit",   value: "1,000 msgs/day",   ok: true  },
                    { label: "Webhook",       value: "Configured",       ok: true  },
                  ].map((s) => (
                    <div key={s.label}
                      className="flex items-center justify-between p-3.5 rounded-xl"
                      style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(99,102,241,0.07)" }}>
                      <div>
                        <p className="text-[9px] font-black text-[var(--fg-muted)] uppercase tracking-wider mb-1">{s.label}</p>
                        <p className="text-sm font-bold text-white">{s.value}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${s.ok ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`}
                          style={s.ok ? { boxShadow: "0 0 6px rgba(52,211,153,0.7)" } : {}} />
                        <CheckCircle2 size={14} style={{ color: s.ok ? "#34d399" : "#f87171" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ─ Billing ─ */}
            {activeSection === "billing" && (
              <motion.section
                key="billing"
                id="billing"
                className="glass-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(167,139,250,0.10)", border: "1px solid rgba(167,139,250,0.18)" }}>
                    <CreditCard size={16} style={{ color: "#a78bfa" }} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Billing & Subscription</h3>
                    <p className="text-[10px] text-[var(--fg-muted)]">Razorpay subscription management</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl gap-4 mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(98,70,234,0.12), rgba(167,139,250,0.07))", border: "1px solid rgba(98,70,234,0.20)" }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-black text-[#818cf8] uppercase tracking-wider">Premium Plan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>Active</span>
                    </div>
                    <p className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                      ₹2,499<span className="text-sm font-semibold text-[var(--fg-muted)] ml-1">/month</span>
                    </p>
                    <p className="text-xs text-[var(--fg-muted)] mt-1">Renews on May 1, 2026</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="btn btn-primary btn-sm">Manage Subscription</button>
                    <button className="btn btn-outline btn-sm" style={{ fontSize: "11px" }}>Download Invoice</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Patients",      value: "Unlimited", icon: User },
                    { label: "WA Messages",   value: "5,000/mo",  icon: MessageSquare },
                    { label: "Sub-Clinics",   value: "3 included", icon: Globe },
                  ].map((f) => (
                    <div key={f.label} className="p-3.5 rounded-xl text-center"
                      style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(99,102,241,0.07)" }}>
                      <f.icon size={16} className="mx-auto mb-1.5" style={{ color: "#818cf8" }} />
                      <p className="text-sm font-black text-white">{f.value}</p>
                      <p className="text-[10px] text-[var(--fg-muted)] font-medium">{f.label}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ─ Security ─ */}
            {activeSection === "security" && (
              <motion.section
                key="security"
                id="security"
                className="glass-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.18)" }}>
                    <Shield size={16} style={{ color: "#f87171" }} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>Security Settings</h3>
                    <p className="text-[10px] text-[var(--fg-muted)]">Keep your account safe and secure</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Change Password",        desc: "Update your account password",        icon: Shield,   action: "Update" },
                    { label: "Two-Factor Auth",         desc: "Add an extra layer of security",      icon: Phone,    action: "Enable"  },
                    { label: "Active Sessions",         desc: "Manage devices logged into account",  icon: Globe,    action: "View"    },
                    { label: "API Keys",                desc: "Manage integration access tokens",    icon: Database, action: "Manage"  },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(99,102,241,0.07)" }}>
                      <div className="flex items-center gap-3">
                        <s.icon size={14} style={{ color: "var(--fg-muted)" }} />
                        <div>
                          <p className="text-sm font-bold text-white">{s.label}</p>
                          <p className="text-[11px] text-[var(--fg-muted)]">{s.desc}</p>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm text-xs">{s.action}</button>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ─ Save Button ─ */}
          <div className="flex justify-end">
            <motion.button
              className="btn btn-primary gap-2"
              style={{ boxShadow: saved ? "0 8px 24px rgba(52,211,153,0.35)" : "0 8px 24px rgba(98,70,234,0.35)" }}
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
                  <span>Saving…</span>
                </>
              ) : saved ? (
                <><CheckCircle2 size={15} /><span>Saved!</span></>
              ) : (
                <><Save size={15} /><span>Save Changes</span></>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
