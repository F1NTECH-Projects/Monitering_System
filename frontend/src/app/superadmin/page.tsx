"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Building, CalendarCheck, ShieldAlert, LogOut, ArrowUpRight, Activity } from "lucide-react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchStats() {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await axios.get(`${url}/superadmin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "You do not have access to this dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-8 h-8 border-4 border-t-[--accent-purple] border-white/10 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh p-4">
        <div className="glass-card p-8 text-center max-w-sm">
          <ShieldAlert size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-[--foreground-muted] mb-6">{error}</p>
          <button onClick={() => router.push("/")} className="btn btn-primary w-full">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Total Appts", count: stats.appointments.total },
    { name: "Completed", count: stats.appointments.completed },
    { name: "No Shows", count: stats.appointments.no_show }
  ];

  return (
    <div className="min-h-screen bg-mesh p-8">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-8 bg-[rgba(13,18,38,0.4)] backdrop-blur-md p-4 rounded-2xl border border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Super Admin</h1>
            <p className="text-xs text-[--foreground-muted]">System Overview</p>
          </div>
        </div>
        <button 
          onClick={() => { logout(); router.push("/login"); }}
          className="flex items-center gap-2 text-sm text-[--foreground-muted] hover:text-white transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-[--foreground-muted] uppercase">Total Clinics</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Building size={20} /></div>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-white">{stats.clinics.total}</p>
            <p className="text-sm text-emerald-400 mb-1">{stats.clinics.active} Active</p>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-[--foreground-muted] uppercase">Total Patients</h3>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Users size={20} /></div>
          </div>
          <p className="text-4xl font-black text-white">{stats.patients}</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-[--foreground-muted] uppercase">Appointments</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><CalendarCheck size={20} /></div>
          </div>
          <p className="text-4xl font-black text-white">{stats.appointments.total}</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-[--foreground-muted] uppercase">Message Logs</h3>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Activity size={20} /></div>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-white">{stats.messages.total}</p>
            <p className="text-sm text-red-400 mb-1">{stats.messages.failed} Failed</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6">Appointment Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(13,18,38,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="url(#colorBar)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Clinics</h3>
            <button className="text-xs font-semibold text-[--accent-cyan] hover:text-white transition-colors flex items-center">
              View All <ArrowUpRight size={14} className="ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {stats.recent_clinics.map((c: any) => (
              <div key={c.id} className="flex justify-between items-center p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-[--foreground-muted]">{c.owner_email}</p>
                </div>
                <div>
                  {c.is_active ? 
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span> 
                    : 
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
