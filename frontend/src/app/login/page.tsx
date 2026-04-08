"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";
import { useAuth } from "@/stores/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Eye, EyeOff, Lock, Mail, ArrowRight, Wifi } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authService.login({ owner_email: email, password });
      setAuth(res.data.access_token, res.data.clinic);
      router.push("/");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-mesh overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(98,70,234,0.5) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 65%)" }} />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 relative z-10 p-12"
        style={{ background: "rgba(13,18,38,0.6)", borderRight: "1px solid rgba(99,102,241,0.12)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6246ea, #7c3aed)", boxShadow: "0 4px 20px rgba(98,70,234,0.5)" }}>
            <Activity size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            Clinic<span style={{ color: "#22d3ee" }}>Flow</span>
          </span>
        </div>

        {/* Feature cards */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-4xl font-black text-white leading-tight mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
              Healthcare
              <span className="text-gradient block">Management</span>
              Reimagined.
            </h2>
            <p className="text-[--foreground-muted] text-sm leading-relaxed">
              Automate WhatsApp reminders, track appointments, and manage your
              entire clinic from one beautiful dashboard.
            </p>
          </motion.div>

          <div className="space-y-3 pt-4">
            {[
              { label: "Automated WhatsApp Reminders", color: "#818cf8" },
              { label: "Real-time Appointment Tracking", color: "#22d3ee" },
              { label: "No-Show Recovery Workflows", color: "#34d399" },
              { label: "Detailed Analytics & Logs", color: "#fbbf24" },
            ].map((f, i) => (
              <motion.div key={f.label} className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                <span className="text-sm text-[--foreground-muted]">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Wifi size={12} className="text-emerald-400" />
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">All systems operational</span>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6246ea, #7c3aed)" }}>
                <Activity size={16} className="text-white" />
              </div>
              <span className="text-lg font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                Clinic<span style={{ color: "#22d3ee" }}>Flow</span>
              </span>
            </div>
            <h3 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Welcome back
            </h3>
            <p className="text-[--foreground-muted] text-sm">Sign in to your clinic dashboard.</p>
          </div>

          {/* Card */}
          <div className="glass-card p-8 border-gradient">
            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-[--foreground-muted] uppercase tracking-wider mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--foreground-muted] pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="owner@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-[--foreground-muted] uppercase tracking-wider mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--foreground-muted] pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-11"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[--foreground-muted] hover:text-[--foreground] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div className="text-right">
                <button type="button" className="text-xs text-[color:#818cf8] hover:opacity-80 transition-opacity font-medium">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-2 gap-2"
                style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <p className="text-center text-xs text-[--foreground-muted] mt-6">
            New clinic?{" "}
            <span className="font-semibold cursor-pointer" style={{ color: "#818cf8" }}>
              Contact support →
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
