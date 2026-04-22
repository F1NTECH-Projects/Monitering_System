"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Calendar, MapPin, User, Video, CreditCard, Clock } from "lucide-react";
import axios from "axios";
import PatientChat from "@/components/chat/PatientChat";

export default function PortalPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionDone, setActionDone] = useState<"confirmed" | "cancelled" | false>(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentMarked, setPaymentMarked] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await axios.get(`${API}/portal/${token}`);
        setData(res.data);
      } catch (e: any) {
        setError(e.response?.data?.detail || "Invalid link or appointment not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [token]);

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${API}/portal/${token}/confirm`);
      setActionDone("confirmed");
      setData((prev: any) => ({ ...prev, portal_confirmed: true }));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to confirm appointment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      // Use the reschedule endpoint to signal cancellation desire,
      // or we patch status directly via the reschedule message field
      await axios.post(`${API}/portal/${token}/reschedule`, {
        preferred_time: "cancel",
        message: "Patient requested cancellation via portal",
      });
      setActionDone("cancelled");
      setData((prev: any) => ({ ...prev, status: "cancelled" }));
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to cancel appointment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07091A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-[#6366f1] border-white/10 rounded-full animate-spin" />
          <p className="text-[var(--fg-muted)] text-sm">Loading your appointment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07091A] p-4">
        <div className="glass-card p-8 max-w-md w-full text-center border border-[rgba(255,255,255,0.05)]">
          <XCircle size={48} className="text-[#f87171] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Link Unavailable</h2>
          <p className="text-[var(--fg-muted)]">{error}</p>
          <p className="text-[var(--fg-muted)] text-xs mt-3">
            This link may have expired or the appointment no longer exists.
          </p>
        </div>
      </div>
    );
  }

  const d = new Date(data.appointment_time);
  const isCancelled = data.status === "cancelled" || actionDone === "cancelled";
  const isConfirmed = data.portal_confirmed || actionDone === "confirmed";
  const isPast = d < new Date();

  return (
    <div className="min-h-screen flex flex-col bg-[#07091A] p-4 sm:p-8 relative overflow-hidden">
      {/* Background Motifs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6366f1] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#22d3ee] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl mx-auto w-full mt-8 z-10">
        <motion.div
          className="glass-card p-8 overflow-hidden relative shadow-2xl border border-[rgba(255,255,255,0.04)]"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ background: "rgba(10, 10, 16, 0.4)", backdropFilter: "blur(20px)" }}
        >
          {/* Action confirmation banner */}
          {actionDone && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${actionDone === "confirmed"
                  ? "bg-[rgba(16,185,129,0.1)] text-[#34d399] border border-[rgba(16,185,129,0.2)]"
                  : "bg-[rgba(239,68,68,0.1)] text-[#f87171] border border-[rgba(239,68,68,0.2)]"
                }`}
            >
              {actionDone === "confirmed"
                ? <CheckCircle2 size={20} />
                : <XCircle size={20} />
              }
              <span className="font-medium text-sm">
                {actionDone === "confirmed"
                  ? "Appointment confirmed! The clinic has been notified."
                  : "Cancellation request sent. The clinic will follow up."}
              </span>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#a78bfa]"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {data.clinic_name}
            </h1>
            <p className="text-[var(--fg-muted)] mt-2 text-sm font-medium tracking-wider uppercase">
              Patient Appointment Portal
            </p>
          </div>

          {/* Status badges */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            <span
              className="text-[10px] font-black uppercase px-3 py-1 rounded-full"
              style={
                isCancelled
                  ? { background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                  : isConfirmed
                    ? { background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }
                    : { background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }
              }
            >
              {isCancelled ? "Cancelled" : isConfirmed ? "Confirmed" : "Awaiting Confirmation"}
            </span>
            {isPast && !isCancelled && (
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full"
                style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                Past Appointment
              </span>
            )}
          </div>

          {/* Details cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)]">
              <div className="w-12 h-12 rounded-xl bg-[rgba(98,70,234,0.15)] flex items-center justify-center text-[#818cf8]">
                <User size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#818cf8] uppercase tracking-[0.1em] mb-1">Patient</p>
                <p className="text-lg font-bold text-white">{data.patient_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)]">
              <div className="w-12 h-12 rounded-xl bg-[rgba(34,211,238,0.15)] flex items-center justify-center text-cyan-400">
                <Calendar size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.1em] mb-1">Date</p>
                <p className="text-lg font-bold text-white">
                  {d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)]">
              <div className="w-12 h-12 rounded-xl bg-[rgba(167,139,250,0.15)] flex items-center justify-center text-[#a78bfa]">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#a78bfa] uppercase tracking-[0.1em] mb-1">Time</p>
                <p className="text-lg font-bold text-white">
                  {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)]">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                  <p className="text-sm font-bold text-white">{data.clinic_phone || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] p-4 rounded-2xl border border-[rgba(255,255,255,0.03)]">
                <div className="w-10 h-10 rounded-xl bg-[rgba(251,191,36,0.15)] flex items-center justify-center text-[#fbbf24]">
                  <Video size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest mb-1">Type</p>
                  <p className="text-sm font-bold text-white capitalize">{data.consultation_type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {data.notes && (
            <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
              <p className="text-[10px] font-black text-[var(--fg-muted)] uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-white">{data.notes}</p>
            </div>
          )}

          {/* Telemedicine Section */}
          {data.consultation_type === "online" && !isCancelled && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-6 p-5 rounded-2xl bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.15)] flex flex-col items-center"
            >
              <Video size={32} className="text-[#a78bfa] mb-3" />
              <h3 className="text-white font-bold mb-1">Teleconsultation Link</h3>
              <p className="text-[11px] text-[var(--fg-muted)] text-center mb-4 leading-relaxed">
                Join the virtual waiting room. The clinic will admit you when ready.
              </p>
              <a
                href={`https://meet.jit.si/cliniq_${data.appointment_id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-3 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold transition-colors"
              >
                Join Meeting
              </a>
            </motion.div>
          )}

          {/* Payment Section */}
          {data.payment_mode === "online" &&
            !paymentMarked &&
            data.payment_status === "pending" &&
            data.clinic_upi_id &&
            !isCancelled && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-6 p-5 rounded-2xl bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.15)] flex flex-col items-center text-center"
              >
                <CreditCard size={32} className="text-[#34d399] mb-3" />
                <h3 className="text-white font-bold mb-1">Payment Required</h3>
                <p className="text-[11px] text-[var(--fg-muted)] mb-4">
                  Scan the QR code to pay via UPI before your appointment.
                </p>
                <div className="bg-white p-2 rounded-xl mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.clinic_upi_id}`}
                    alt="UPI QR Code"
                  />
                </div>
                <p className="text-xs font-bold font-mono tracking-widest text-[#34d399] mb-4">
                  {data.clinic_upi_id}
                </p>
                <button
                  onClick={() => setPaymentMarked(true)}
                  className="w-full py-3 rounded-xl border border-[rgba(52,211,153,0.3)] text-[#34d399] font-semibold transition-colors hover:bg-[rgba(52,211,153,0.1)]"
                >
                  I have Paid ✓
                </button>
              </motion.div>
            )}

          {/* Action Buttons — only show if appointment is upcoming and not yet actioned */}
          {!isCancelled && !actionDone && !isPast && (
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="py-3 px-4 rounded-xl text-sm font-semibold transition-colors bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#f87171] hover:bg-[rgba(239,68,68,0.15)] disabled:opacity-50"
              >
                {actionLoading ? "..." : "Request Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading || isConfirmed}
                className="py-3 px-4 rounded-xl text-sm font-semibold transition-colors bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#34d399] hover:bg-[rgba(16,185,129,0.15)] disabled:opacity-50"
              >
                {isConfirmed ? "✓ Confirmed" : actionLoading ? "..." : "Confirm Arrival"}
              </button>
            </div>
          )}

          {/* Chat */}
          <PatientChat appointmentId={data.appointment_id} isClinic={false} />
        </motion.div>
      </div>
    </div>
  );
}