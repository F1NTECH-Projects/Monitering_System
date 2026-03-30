"use client";

import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Phone,
  MessageSquare,
  Search,
  Filter
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button, MotionButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const appointments = [
  { id: 1, patient: "Arjun Sharma", time: "09:00 AM", status: "finished", type: "First Visit", duration: "30 min" },
  { id: 2, patient: "Priya Patel", time: "10:15 AM", status: "finished", type: "Consultation", duration: "45 min" },
  { id: 3, patient: "Rahul Verma", time: "11:30 AM", status: "scheduled", type: "Follow-up", duration: "15 min" },
  { id: 4, patient: "Sneha Gupta", time: "12:45 PM", status: "scheduled", type: "Check-up", duration: "30 min" },
  { id: 5, patient: "Amit Singh", time: "02:00 PM", status: "scheduled", type: "Procedure", duration: "60 min" },
  { id: 6, patient: "Meera Reddy", time: "03:30 PM", status: "no-show", type: "Follow-up", duration: "15 min" },
  { id: 7, patient: "Vikram Malhotra", time: "04:15 PM", status: "cancelled", type: "Consultation", duration: "30 min" },
];

const statusStyles: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  finished: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  "no-show": "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  cancelled: "bg-danger-50 text-danger-500 border-danger-100 dark:bg-danger-900/20 dark:text-danger-400 dark:border-danger-800",
};

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="text-brand-600" size={32} />
            Daily Schedule
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Keep track of your patient visits and manage your time effectively.
          </p>
        </div>
        <MotionButton className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20 px-6 py-6 rounded-xl" whileHover={{ scale: 1.02 }}>
          <Plus size={20} className="mr-2" />
          Schedule New Appointment
        </MotionButton>
      </div>

      {/* Date Selector & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-none shadow-md">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-200">
                <ChevronLeft size={18} />
              </Button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white min-w-[200px] text-center">
                {selectedDate}
              </h3>
              <Button variant="ghost" size="icon" className="h-10 w-10 border border-slate-200">
                <ChevronRight size={18} />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  className="pl-9 h-10 w-48 bg-slate-50 border-slate-200" 
                  placeholder="Patient name..." 
                />
              </div>
              <Button variant="outline" className="h-10 border-slate-200">
                <Filter size={16} className="mr-2" />
                Advanced
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-brand-600 text-white flex flex-col items-center justify-center py-6 text-center">
           <h4 className="text-sm font-medium opacity-80 uppercase tracking-widest text-[10px]">Today's Load</h4>
           <div className="text-5xl font-black mt-2">07</div>
           <p className="text-[10px] font-bold mt-2 opacity-90 uppercase">Appointments across 5 slots</p>
        </Card>
      </div>

      {/* Appointment Timeline */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {appointments.map((appt, idx) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    {/* Time Column */}
                    <div className="p-6 sm:w-32 bg-slate-50 dark:bg-slate-800/40 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                      <Clock size={16} className="text-brand-600 mb-1" />
                      <span className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {appt.time}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {appt.duration}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-brand-100 dark:border-brand-900 p-0.5">
                          <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-brand-600 text-sm">
                            {appt.patient.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                            {appt.patient}
                          </h3>
                          <p className="text-sm font-medium text-slate-500">
                            {appt.type} • Consultation Mode
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wide",
                          statusStyles[appt.status]
                        )}>
                          {appt.status === "finished" && <CheckCircle2 size={14} />}
                          {appt.status === "scheduled" && <Clock size={14} />}
                          {appt.status === "no-show" && <AlertCircle size={14} />}
                          {appt.status === "cancelled" && <XCircle size={14} />}
                          {appt.status}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MotionButton variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50" whileHover={{ scale: 1.1 }}>
                            <CheckCircle2 size={18} />
                          </MotionButton>
                          <MotionButton variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-brand-500 hover:bg-brand-50" whileHover={{ scale: 1.1 }}>
                            <Phone size={18} />
                          </MotionButton>
                          <MotionButton variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-600" whileHover={{ scale: 1.1 }}>
                            <MoreVertical size={18} />
                          </MotionButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
