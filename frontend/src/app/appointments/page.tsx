"use client";

import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock,
  CheckCircle2, XCircle, AlertCircle, Phone, MessageSquare, Search, Video
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/stores/authStore";
import PatientChat from "@/components/chat/PatientChat";

const STATUS_META: Record<string, { label: string; icon: any; color: string; bg: string; border: string; badgeCls: string }> = {
  scheduled: { label: "Scheduled", icon: Clock,        color: "#818cf8", bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.20)",  badgeCls: "badge-scheduled" },
  completed:  { label: "Completed", icon: CheckCircle2, color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.20)",  badgeCls: "badge-completed" },
  "no_show":  { label: "No-Show",   icon: AlertCircle,  color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.20)",  badgeCls: "badge-noshow"   },
  cancelled:  { label: "Cancelled", icon: XCircle,      color: "#f87171", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.20)",   badgeCls: "badge-cancelled"},
};

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export default function AppointmentsPage() {
  const { clinic, token } = useAuth();
  const [baseDate, setBaseDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [openChatFor, setOpenChatFor] = useState<string | null>(null);

  // New Appointment Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
      patient_id: "6612ae0d08a5b2a0c4f8b0p0", // In reality this would be selected from a list of patients, mocking a patient ID for demo
      appointment_time: "",
      notes: "",
      consultation_type: "offline",
      payment_mode: "offline"
  });

  const fetchAppointments = async () => {
      if (!clinic || !token) return;
      try {
          const dateStr = baseDate.toISOString().split("T")[0];
          const res = await axios.get(`http://localhost:8000/api/v1/appointments/clinic/${clinic.id}?date=${dateStr}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setAppointments(res.data.appointments);
      } catch (e) {
          console.error("Failed to fetch appointments", e);
      }
  };

  useEffect(() => {
      fetchAppointments();
      // Mock patient ID to avoid errors on submit if patients DB is not synced for UI yet
      // Ideally we should have a searchable patient list.
  }, [baseDate, clinic, token]);

  const handleScheduleAppt = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          let timeVal = new Date(newAppt.appointment_time);
          await axios.post(`http://localhost:8000/api/v1/appointments/schedule`, 
            {
               patient_id: "6612ae0d08a5b2a0c4f8b0p0", // We need a valid BSON object id. We'll use a dummy or skip patient validation
               appointment_time: timeVal.toISOString(),
               notes: newAppt.notes,
               consultation_type: newAppt.consultation_type,
               payment_mode: newAppt.payment_mode
            }, 
            { headers: { Authorization: `Bearer ${token}` }}
          );
          setShowScheduleModal(false);
          fetchAppointments();
      } catch (e: any) {
          alert("Could not schedule: Check if the patient ID exists in DB.");
      }
  };

  const markStatus = async (id: string, statusEndpoint: string) => {
      try {
          await axios.post(`http://localhost:8000/api/v1/appointments/${id}/${statusEndpoint}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchAppointments();
      } catch (e) {
          console.error(e);
      }
  };

  const dateStr = baseDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const dayStr  = baseDate.toLocaleDateString("en-IN", { weekday: "long" });
  const isToday = new Date().toDateString() === baseDate.toDateString();

  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const completed  = appointments.filter((a) => a.status === "completed").length;
  const noShows    = appointments.filter((a) => a.status === "no_show").length;
  const cancelled  = appointments.filter((a) => a.status === "cancelled").length;

  const displayedAppts = appointments
    .filter((a) => activeTab === "All" || a.status.toLowerCase() === activeTab.toLowerCase())
    .filter((a) => !searchQuery || a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()));

  const TABS = [
    { label: "All",        count: appointments.length, color: "#818cf8" },
    { label: "Scheduled",  count: scheduled,            color: "#818cf8" },
    { label: "Completed",  count: completed,            color: "#34d399" },
    { label: "No_Show",    count: noShows,              color: "#fbbf24" },
    { label: "Cancelled",  count: cancelled,            color: "#f87171" },
  ];

  return (
    <div className="page-enter space-y-6 pb-10 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar size={13} style={{ color: "#818cf8" }} />
            <span className="text-[10px] font-black text-[var(--fg-muted)] uppercase tracking-[0.15em]">Daily Schedule</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Appointments
          </h2>
          <p className="text-[var(--fg-muted)] text-sm mt-1">Track, manage and update patient visits.</p>
        </div>
        <motion.button
          onClick={() => setShowScheduleModal(true)}
          className="btn btn-primary gap-2 flex-shrink-0"
          style={{ boxShadow: "0 8px 28px rgba(98,70,234,0.45)" }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={15} /> Schedule Appointment
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <motion.button className="btn btn-outline btn-icon flex-shrink-0" onClick={() => setBaseDate(addDays(baseDate, -1))}>
              <ChevronLeft size={15} />
            </motion.button>
            <div className="text-center min-w-[170px]">
              <div className="font-black text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>{dateStr}</div>
              <div className="text-[11px] text-[var(--fg-muted)] flex items-center justify-center gap-1.5 mt-0.5">
                {dayStr}
                {isToday && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.22)" }}>
                    TODAY
                  </span>
                )}
              </div>
            </div>
            <motion.button className="btn btn-outline btn-icon flex-shrink-0" onClick={() => setBaseDate(addDays(baseDate, 1))}>
              <ChevronRight size={15} />
            </motion.button>
          </div>
          <div className="relative border border-[rgba(255,255,255,0.05)] rounded-xl bg-[rgba(255,255,255,0.03)] px-3 py-1.5">
            <input
              placeholder="Search patients..."
              className="bg-transparent text-sm text-white w-full h-8 outline-none placeholder-[var(--fg-muted)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center p-4 rounded-2xl text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(98,70,234,0.18), rgba(124,58,237,0.12))", border: "1px solid rgba(98,70,234,0.25)" }}>
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--fg-muted)] mb-1.5">
              {isToday ? "Today's Total" : "Selected Day"}
            </div>
            <div className="text-5xl font-black text-white mb-1 leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
              {appointments.length.toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={
              activeTab === tab.label
                ? { background: `${tab.color}18`, border: `1px solid ${tab.color}35`, color: tab.color }
                : { color: "var(--fg-muted)", border: "1px solid transparent" }
            }
          >
            {tab.label}
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
              style={{ background: `${tab.color}18`, color: tab.color }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayedAppts.map((appt, idx) => {
            const meta = STATUS_META[appt.status] || STATUS_META.scheduled;
            const StatusIcon = meta.icon;
            const d = new Date(appt.appointment_time);
            const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

            return (
              <motion.div
                key={appt.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              >
                <div className="glass-card overflow-hidden flex flex-col md:flex-row group transition-all hover:bg-[rgba(255,255,255,0.02)]" style={{ padding: 0 }}>
                  <div className="w-1 flex-shrink-0" style={{ background: `linear-gradient(180deg, ${meta.color}, ${meta.color}55)` }} />
                  
                  <div className="flex-shrink-0 w-28 flex flex-col items-center justify-center py-5 gap-1.5 border-r border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                    <Clock size={14} style={{ color: meta.color }} />
                    <span className="text-sm font-black text-white tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>{timeStr}</span>
                    <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)]">{appt.consultation_type}</span>
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm"
                        style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}aa)` }}>
                        {appt.patient_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm" style={{ fontFamily: "Outfit, sans-serif" }}>{appt.patient_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[11px] text-[var(--fg-muted)] flex items-center justify-center font-semibold bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full">{appt.patient_phone}</p>
                          {appt.payment_mode === "online" && (
                            <span className="text-[10px] text-[#34d399] border border-[#34d399] px-2 py-0.5 rounded-full font-bold uppercase">{appt.payment_status}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${meta.badgeCls}`}>
                         <StatusIcon size={12} /> {meta.label}
                       </div>
                       <div className="flex gap-2">
                          {appt.consultation_type === "online" && (
                             <a href={`https://meet.jit.si/cliniq_${appt.id}`} target="_blank" rel="noreferrer" title="Join Video Call" className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] text-[#a78bfa] hover:bg-[rgba(167,139,250,0.2)] transition-colors">
                                <Video size={14} />
                             </a>
                          )}
                          <button onClick={() => setOpenChatFor(openChatFor === appt.id ? null : appt.id)} className="p-2 rounded-xl bg-[rgba(99,102,241,0.1)] text-[#818cf8] hover:bg-[rgba(99,102,241,0.2)] transition-colors" title="Message Patient">
                            <MessageSquare size={14} />
                          </button>
                          {appt.status === "scheduled" && (
                             <button onClick={() => markStatus(appt.id, "complete")} className="p-2 text-[#34d399] bg-[rgba(52,211,153,0.1)] rounded-xl hover:bg-[rgba(52,211,153,0.2)]" title="Mark Complete">
                               <CheckCircle2 size={14} />
                             </button>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
                {openChatFor === appt.id && (
                  <div className="mt-2 ml-29">
                     <PatientChat appointmentId={appt.id} isClinic={true} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card max-w-md w-full relative">
                 <button onClick={() => setShowScheduleModal(false)} className="absolute top-4 right-4 text-[var(--fg-muted)]"><XCircle size={20} /></button>
                 <h3 className="text-xl font-bold text-white mb-6">Schedule Appointment</h3>
                 <form onSubmit={handleScheduleAppt} className="space-y-4">
                     <div>
                       <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1">Appointment Time</label>
                       <input type="datetime-local" required className="input w-full bg-[rgba(255,255,255,0.03)] text-sm h-10 px-3 border border-[rgba(255,255,255,0.1)] rounded-xl"
                         value={newAppt.appointment_time} onChange={(e) => setNewAppt({...newAppt, appointment_time: e.target.value})}
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1">Consultation Type</label>
                         <select className="input w-full bg-[rgba(255,255,255,0.03)] text-sm h-10 px-3 border border-[rgba(255,255,255,0.1)] rounded-xl text-white"
                            value={newAppt.consultation_type} onChange={(e) => setNewAppt({...newAppt, consultation_type: e.target.value})}>
                            <option value="offline" className="bg-[#0f172a]">In-Clinic (Offline)</option>
                            <option value="online" className="bg-[#0f172a]">Telemedicine (Online)</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1">Payment Mode</label>
                         <select className="input w-full bg-[rgba(255,255,255,0.03)] text-sm h-10 px-3 border border-[rgba(255,255,255,0.1)] rounded-xl text-white"
                            value={newAppt.payment_mode} onChange={(e) => setNewAppt({...newAppt, payment_mode: e.target.value})}>
                            <option value="offline" className="bg-[#0f172a]">Pay at Clinic (Cash)</option>
                            <option value="online" className="bg-[#0f172a]">Pay Online (UPI QR)</option>
                         </select>
                       </div>
                     </div>
                     <button type="submit" className="w-full btn btn-primary mt-4">Schedule & Notify Patient</button>
                 </form>
             </motion.div>
          </div>
      )}
    </div>
  );
}
