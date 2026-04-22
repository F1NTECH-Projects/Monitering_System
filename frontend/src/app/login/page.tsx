'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Activity, ArrowRight, Loader2, CheckCircle2, Wifi, Shield, Zap, Users } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const FEATURES = [
  { label: 'Automated WhatsApp Reminders',     icon: Zap,          color: '#818cf8' },
  { label: 'SMS Fallback When WhatsApp Fails',  icon: Shield,       color: '#22d3ee' },
  { label: 'Email Reminders + HTML Templates',  icon: CheckCircle2, color: '#34d399' },
  { label: 'Patient Self-Service Portal',        icon: Users,        color: '#fbbf24' },
  { label: 'Multi-Language (EN / HI / TA / TE)', icon: Activity,    color: '#a78bfa' },
  { label: 'Admin Super-Dashboard',              icon: Wifi,         color: '#f87171' },
];

const REG_FIELDS = [
  { k: 'name',        l: 'Clinic Name',          t: 'text',  p: 'Dr. Sharma Multi-Specialty Clinic', r: true  },
  { k: 'owner_name',  l: 'Owner / Doctor Name',  t: 'text',  p: 'Dr. Ravi Sharma',                   r: true  },
  { k: 'owner_email', l: 'Email Address',        t: 'email', p: 'dr.sharma@clinic.com',               r: true  },
  { k: 'phone',       l: 'Phone (91XXXXXXXXXX)', t: 'text',  p: '919876543210',                       r: true  },
  { k: 'address',     l: 'Clinic Address',       t: 'text',  p: '123 MG Road, Bengaluru',             r: false },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [tab, setTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData,    setLoginData]    = useState({ owner_email: '', password: '' });
  const [regData,      setRegData]      = useState({ name: '', phone: '', owner_name: '', owner_email: '', password: '', address: '' });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(loginData);
      setAuth(res.data.access_token, res.data.clinic);
      toast.success(`Welcome back, ${res.data.clinic.name}!`);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(regData);
      setAuth(res.data.access_token, res.data.clinic);
      toast.success('Clinic registered! Welcome to ClinicFlow 🎉');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen w-full flex bg-app overflow-hidden relative">
      {/* Animated background orbs */}
      <div className="orb orb-brand" />
      <div className="orb orb-cyan" />

      {/* ── LEFT BRANDING PANEL ─────────────────────────── */}
      <motion.div
        className="hidden lg:flex flex-col justify-between relative z-10 flex-shrink-0"
        style={{
          width: '480px',
          background: 'rgba(4,7,18,0.80)',
          borderRight: '1px solid rgba(99,102,241,0.12)',
          backdropFilter: 'blur(24px)',
          padding: '3rem',
        }}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6246ea,#7c3aed)', boxShadow: '0 6px 28px rgba(98,70,234,0.55)' }}
            whileHover={{ scale: 1.08, rotate: 8 }}
          >
            <Activity size={22} className="text-white" />
          </motion.div>
          <div>
            <span className="font-black text-2xl text-white block" style={{ fontFamily: 'Outfit,sans-serif' }}>
              Clinic<span style={{ color: '#22d3ee' }}>Flow</span>
            </span>
            <p className="text-[10px] text-[var(--fg-muted)] uppercase tracking-[0.15em] font-bold mt-0.5">Healthcare OS v2</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-4xl font-black text-white leading-[1.1] mb-4" style={{ fontFamily: 'Outfit,sans-serif' }}>
              Zero missed<br />
              <span className="text-gradient">appointments.</span><br />
              Every time.
            </h2>
            <p className="text-[var(--fg-muted)] text-sm leading-relaxed">
              ClinicFlow automates your entire patient reminder workflow — WhatsApp first, SMS fallback, Email confirmation — so no patient ever forgets their visit.
            </p>
          </motion.div>

          {/* Feature list */}
          <div className="space-y-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}28` }}>
                  <f.icon size={12} style={{ color: f.color }} />
                </div>
                <span className="text-sm text-[var(--fg-muted)]">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Wifi size={11} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">All Systems Operational</span>
        </div>
      </motion.div>

      {/* ── RIGHT FORM PANEL ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 overflow-y-auto">
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6246ea,#7c3aed)', boxShadow: '0 4px 16px rgba(98,70,234,0.5)' }}>
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-black text-xl text-white" style={{ fontFamily: 'Outfit,sans-serif' }}>
              Clinic<span style={{ color: '#22d3ee' }}>Flow</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-3xl font-black text-white mb-1.5" style={{ fontFamily: 'Outfit,sans-serif' }}>
              {tab === 'login' ? 'Welcome back' : 'Get started'}
            </h1>
            <p className="text-[var(--fg-muted)] text-sm">
              {tab === 'login'
                ? 'Sign in to your clinic dashboard'
                : 'Create your ClinicFlow account in seconds'
              }
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 mb-7 rounded-xl" style={{ background: 'rgba(9,15,30,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}>
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative flex-1 py-2.5 text-sm font-bold rounded-lg transition-all"
                style={tab === t
                  ? { background: 'linear-gradient(135deg,#6246ea,#7c3aed)', color: 'white',
                      boxShadow: '0 4px 18px rgba(98,70,234,0.5)' }
                  : { color: 'var(--fg-muted)' }
                }
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-[var(--fg-muted)] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email" required
                    className="input"
                    value={loginData.owner_email}
                    onChange={(e) => setLoginData({ ...loginData, owner_email: e.target.value })}
                    placeholder="dr.smith@clinic.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs font-semibold text-[#818cf8] hover:text-[#a78bfa] transition-colors">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'} required
                      className="input pr-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-white transition-colors">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit" disabled={loading}
                  className="btn btn-primary w-full h-12 text-base mt-2"
                  style={{ boxShadow: '0 8px 32px rgba(98,70,234,0.40)' }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /><span>Signing in…</span></>
                    : <><span>Sign In</span><ArrowRight size={18} /></>
                  }
                </motion.button>
              </motion.form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  {REG_FIELDS.map((f) => (
                    <div key={f.k} className={f.k === 'name' || f.k === 'owner_email' || f.k === 'address' ? 'col-span-2' : ''}>
                      <label className="block text-xs font-bold mb-1.5 text-[var(--fg-muted)] uppercase tracking-wider">
                        {f.l}
                      </label>
                      {f.k === 'password' ? null : (
                        <input
                          type={f.t} required={f.r}
                          className="input"
                          placeholder={f.p}
                          value={(regData as any)[f.k]}
                          onChange={(e) => setRegData({ ...regData, [f.k]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}

                  {/* Password field */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold mb-1.5 text-[var(--fg-muted)] uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'} required minLength={8}
                        className="input pr-10"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        placeholder="At least 8 characters"
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-white transition-colors">
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input type="checkbox" required id="terms"
                    className="mt-0.5 rounded border-[rgba(99,102,241,0.3)] bg-transparent accent-[#6246ea] cursor-pointer" />
                  <label htmlFor="terms" className="text-xs text-[var(--fg-muted)] cursor-pointer leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-[#818cf8] hover:text-[#a78bfa] transition-colors">Terms of Service</a>
                    {' '}&amp;{' '}
                    <a href="#" className="text-[#818cf8] hover:text-[#a78bfa] transition-colors">Privacy Policy</a>
                  </label>
                </div>

                <motion.button
                  type="submit" disabled={loading}
                  className="btn btn-primary w-full h-12 text-base"
                  style={{ boxShadow: '0 8px 32px rgba(98,70,234,0.40)' }}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /><span>Creating account…</span></>
                    : <><span>Create Account</span><ArrowRight size={18} /></>
                  }
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-[var(--fg-muted)] mt-6">
            {tab === 'login'
              ? <>Don&apos;t have an account?{' '}<button onClick={() => setTab('register')} className="text-[#818cf8] font-bold hover:text-[#a78bfa] transition-colors">Register free</button></>
              : <>Already have an account?{' '}<button onClick={() => setTab('login')} className="text-[#818cf8] font-bold hover:text-[#a78bfa] transition-colors">Sign in</button></>
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(99,102,241,0.2)] border-t-[#818cf8] animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
