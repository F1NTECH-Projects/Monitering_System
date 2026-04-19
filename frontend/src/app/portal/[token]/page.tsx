"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Calendar, MapPin, User, Video, CreditCard } from "lucide-react";
import axios from "axios";
import PatientChat from "@/components/chat/PatientChat";

export default function PortalPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionDone, setActionDone] = useState<string | false>(false);
  const [paymentMarked, setPaymentMarked] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await axios.get(`${url}/portal/${token}`);
        setData(res.data);
      } catch (e: any) {
        setError(e.response?.data?.detail || "Invalid link or appointment not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [token]);

  const handleAction = async (action: "confirm" | "cancel") => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      await axios.post(`${url}/portal/${token}/action`, { action });
      setActionDone(action === "confirm" ? "confirmed" : "cancelled");
      setData((prev: any) => ({ ...prev, status: action === "confirm" ? "scheduled" : "cancelled" }));
    } catch (e) {
      alert("Failed to process your request");
    }
  };

  const markAsPaid = () => {
      setPaymentMarked(true);
      // We can also patch payment_status if we created an endpoint for it.
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07091A]">
        <div className="w-8 h-8 border-4 border-t-[#6366f1] border-white/10 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07091A] p-4">
        <div className="glass-card p-8 max-w-md w-full text-center border border-[rgba(255,255,255,0.05)]">
          <XCircle size={48} className="text-[#f87171] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Unavailable</h2>
          <p className="text-[var(--fg-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  const d = new Date(data.appointment_time);
  const isCancelled = data.status === "cancelled";

  return (
    <div className="min-h-screen flex flex-col bg-[#07091A] p-4 sm:p-8 relative overflow-hidden">
      {/* Background Motifs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6366f1] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22d3ee] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl mx-auto w-full mt-12 z-10">
        <motion.div
          className="glass-card p-8 overflow-hidden relative shadow-2xl border border-[rgba(255,255,255,0.04)]"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ background: "rgba(10, 10, 16, 0.4)", backdropFilter: "blur(20px)" }}
        >
          {actionDone && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${actionDone === "confirmed" ? "bg-[rgba(16,185,129,0.1)] text-[#34d399]" : "bg-[rgba(239,68,68,0.1)] text-[#f87171]"}`}
            >
              <CheckCircle2 size={24} />
              <span className="font-medium text-sm">Your appointment was successfully {actionDone}.</span>
            </motion.div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a78bfa]" style={{ fontFamily: "Outfit, sans-serif" }}>
              {data.clinic_name}
            </h1>
            <p className="text-[var(--fg-muted)] mt-2 text-sm font-medium tracking-wider uppercase">Patient Portal</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] transition-all hover:bg-[rgba(255,255,255,0.05)]">
              <div className="w-12 h-12 rounded-xl bg-[rgba(98,70,234,0.15)] flex items-center justify-center text-[#818cf8]">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#818cf8] uppercase tracking-[0.1em] mb-1">Patient</p>
                <p className="text-lg font-bold text-white">{data.patient_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)] transition-all hover:bg-[rgba(255,255,255,0.05)]">
              <div className="w-12 h-12 rounded-xl bg-[rgba(34,211,238,0.15)] flex items-center justify-center text-cyan-400">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.1em] mb-1">Appointment Time</p>
                <p className="text-lg font-bold text-white">
                  {d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm font-medium text-[var(--fg-muted)] mt-0.5">
                  {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)]">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                    <MapPin size={20} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Clinic</p>
                    <p className="text-sm font-bold text-white">{data.clinic_phone || "N/A"}</p>
                </div>
                </div>

                <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)]">
                <div className="w-10 h-10 rounded-xl bg-[rgba(251,191,36,0.15)] flex items-center justify-center text-[#fbbf24]">
                    <Video size={20} />
                </div>
                <div>
                    <p className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest mb-1">Modality</p>
                    <p className="text-sm font-bold text-white capitalize">{data.consultation_type}</p>
                </div>
                </div>
            </div>
          </div>

          {/* Telemedicine Section */}
          {data.consultation_type === "online" && !isCancelled && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-6 p-5 rounded-2xl bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.15)] flex flex-col items-center">
                  <Video size={32} className="text-[#a78bfa] mb-3" />
                  <h3 className="text-white font-bold mb-1">Teleconsultation Link</h3>
                  <p className="text-[11px] text-[var(--fg-muted)] text-center mb-4 leading-relaxed">
                      Join the virtual waiting room. The clinic will admit you when ready.
                  </p>
                  <a 
                    href={`https://meet.jit.si/cliniq_${data.appointment_id}`} 
                    target="_blank" rel="noreferrer"
                    className="w-full text-center py-3 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold transition-colors"
                  >
                      Join Meeting
                  </a>
              </motion.div>
          )}

          {/* Payment Section */}
          {data.payment_mode === "online" && !paymentMarked && data.payment_status === "pending" && data.clinic_upi_id && !isCancelled && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="mt-6 p-5 rounded-2xl bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.15)] flex flex-col items-center text-center">
                  <CreditCard size={32} className="text-[#34d399] mb-3" />
                  <h3 className="text-white font-bold mb-1">Payment Required</h3>
                  <p className="text-[11px] text-[var(--fg-muted)] mb-4">Please scan this QR code to pay via UPI.</p>
                  
                  <div className="bg-white p-2 rounded-xl mb-4">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.clinic_upi_id}`} alt="UPI QR Code" />
                  </div>
                  <p className="text-xs font-bold font-mono tracking-widest text-[#34d399] mb-4">{data.clinic_upi_id}</p>
                  
                  <button onClick={markAsPaid} className="w-full py-3 rounded-xl border border-[rgba(52,211,153,0.3)] text-[#34d399] font-semibold transition-colors hover:bg-[rgba(52,211,153,0.1)]">
                      I have Paid
                  </button>
              </motion.div>
          )}

          {!isCancelled && !actionDone && (
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
              <button onClick={() => handleAction("cancel")} className="py-3 px-4 rounded-xl text-sm font-semibold transition-colors bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171] hover:bg-[rgba(239,68,68,0.15)]">
                Cancel
              </button>
              <button onClick={() => handleAction("confirm")} className="py-3 px-4 rounded-xl text-sm font-semibold transition-colors bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#34d399] hover:bg-[rgba(16,185,129,0.15)]">
                Confirm Arrival
              </button>
            </div>
          )}
          
          <PatientChat appointmentId={data.appointment_id} isClinic={false} />

        </motion.div>
      </div>
    </div>
  );
}
