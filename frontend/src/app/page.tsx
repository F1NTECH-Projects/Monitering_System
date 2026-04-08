"use client";
import { useCallback, useState } from "react";
import { useAuth } from "@/stores/authStore";
import { clinicService } from "@/services/api";
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

export default function DashboardPage() {
  const clinic = useAuth((s) => s.clinic);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clinic?.id) return;
    clinicService.getStats(clinic.id)
      .then((r) => setStats(r.data))
      .catch(() => setError("Failed to load stats"));
  }, [clinic?.id]);

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!stats) return <p className="p-6 text-gray-400">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Welcome, {clinic?.name}</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total patients</p>
          <p className="text-3xl font-bold mt-1">{stats.total_patients}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Today&apos;s appointments</p>
          <p className="text-3xl font-bold mt-1">{stats.today_appointments}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total no-shows</p>
          <p className="text-3xl font-bold mt-1">{stats.total_no_shows}</p>
        </div>
      </div>
    </div>
  );
}
