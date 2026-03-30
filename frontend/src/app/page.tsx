"use client";

import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Plus,
  Phone,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { MotionButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const stats = [
  { 
    title: "Total Patients", 
    value: "1,284", 
    change: "+12.5%", 
    trend: "up", 
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20"
  },
  { 
    title: "Appointments Today", 
    value: "24", 
    change: "+3 since 8 AM", 
    trend: "up", 
    icon: Calendar,
    color: "text-brand-600",
    bg: "bg-brand-50 dark:bg-brand-900/20"
  },
  { 
    title: "Reminders Sent", 
    value: "156", 
    change: "98% Success Rate", 
    trend: "up", 
    icon: MessageSquare,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20"
  },
  { 
    title: "No-Shows", 
    value: "2", 
    change: "-4% from avg", 
    trend: "down", 
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20"
  },
];

const recentAppointments = [
  { id: 1, name: "Arjun Sharma", time: "10:30 AM", status: "finished", type: "Check-up" },
  { id: 2, name: "Priya Patel", time: "11:15 AM", status: "upcoming", type: "Consultation" },
  { id: 3, name: "Rahul Verma", time: "12:00 PM", status: "upcoming", type: "Follow-up" },
  { id: 4, name: "Sneha Gupta", time: "02:30 PM", status: "upcoming", type: "X-Ray Review" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, Dr. Ayush!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening at your clinic today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MotionButton variant="outline" className="glass" whileHover={{ scale: 1.05 }}>
            View Reports
          </MotionButton>
          <MotionButton className="bg-brand-600 hover:bg-brand-700 shadow-brand-500/20 shadow-lg" whileHover={{ scale: 1.05 }}>
            <Plus size={18} className="mr-2" />
            Add Record
          </MotionButton>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div key={idx} variants={item}>
            <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn(stat.color)} size={22} />
                  </div>
                  {stat.trend === "up" ? (
                    <div className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                      <ArrowUpRight size={14} className="mr-0.5" />
                      {stat.change}
                    </div>
                  ) : (
                    <div className="flex items-center text-blue-500 text-xs font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                      <ArrowDownRight size={14} className="mr-0.5" />
                      {stat.change}
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
              </CardContent>
              <div className={cn("h-1.5 w-full bg-linear-to-r", 
                stat.color === "text-brand-600" ? "from-brand-500 to-brand-300" :
                stat.color === "text-blue-600" ? "from-blue-500 to-blue-300" :
                stat.color === "text-emerald-600" ? "from-emerald-500 to-emerald-300" :
                "from-amber-500 to-amber-300"
              )} />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Activity + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart Placeholder */}
        <Card className="lg:col-span-2 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Appointment Activity</CardTitle>
              <CardDescription>Weekly overview of scheduled visits</CardDescription>
            </div>
            <MotionButton variant="ghost" size="icon">
              <TrendingUp size={20} className="text-brand-600" />
            </MotionButton>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-between gap-2 pt-4 px-8 pb-10">
            {[65, 45, 75, 55, 90, 70, 85].map((height, i) => (
              <motion.div 
                key={i} 
                className="w-full bg-linear-to-t from-brand-600/80 to-brand-400/20 rounded-t-lg relative group cursor-pointer"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {height} Records
                </div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Appointments List */}
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Today</CardTitle>
            <MotionButton variant="link" className="text-brand-600 text-xs font-bold p-0">
              View All
            </MotionButton>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentAppointments.map((appt) => (
              <div key={appt.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs",
                    appt.status === "finished" ? "bg-emerald-100 text-emerald-600" : "bg-brand-100 text-brand-600"
                  )}>
                    {appt.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                      {appt.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {appt.type} • {appt.time}
                    </p>
                  </div>
                </div>
                {appt.status === "finished" ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <MotionButton variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-brand-600">
                    <ArrowUpRight size={16} />
                  </MotionButton>
                )}
              </div>
            ))}
            
            <MotionButton className="w-full mt-4 glass border-brand-100 text-brand-600 dark:text-brand-400 hover:bg-brand-50" whileHover={{ scale: 1.02 }}>
              Manage Schedule
            </MotionButton>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Quick Links / Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass border-dashed border-2 hover:border-brand-400 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-brand-600 rounded-full text-white shadow-lg shadow-brand-600/30">
              <Plus size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Quick Schedule</h4>
              <p className="text-sm text-slate-500">Add a new appointment in seconds</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass border-dashed border-2 hover:border-emerald-400 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-full text-white shadow-lg shadow-emerald-600/30">
              <Users size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Register Patient</h4>
              <p className="text-sm text-slate-500">Onboard a new patient to the system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
