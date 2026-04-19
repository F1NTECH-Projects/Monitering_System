"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User, Phone, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function PublicBookingPage() {
  const { clinic_id } = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    appointment_time: "",
    notes: "",
    consultation_type: "offline",
    payment_mode: "offline"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successToken, setSuccessToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      
      try {
          const dt = new Date(formData.appointment_time);
          const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
          const res = await axios.post(`${url}/portal/clinic/${clinic_id}/book`, {
              ...formData,
              appointment_time: dt.toISOString()
          });
          
          if (res.data.success) {
              setSuccessToken(res.data.portal_token);
          }
      } catch (e: any) {
          setError(e.response?.data?.detail || "Failed to book appointment. Check the details and try again.");
      } finally {
          setLoading(false);
      }
  };

  if (successToken) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#07091A] p-4 text-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card max-w-md p-8">
                  <CheckCircle2 size={48} className="text-[#34d399] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
                  <p className="text-[var(--fg-muted)] mb-6">Your appointment has been successfully scheduled.</p>
                  <button 
                    onClick={() => router.push(`/portal/${successToken}`)}
                    className="btn btn-primary w-full"
                  >
                      Go to Patient Portal
                  </button>
              </motion.div>
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07091A] p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6366f1] opacity-[0.05] rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
            className="glass-card max-w-md w-full p-8 z-10"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        >
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-[rgba(98,70,234,0.15)] rounded-full flex items-center justify-center text-[#818cf8] mx-auto mb-3">
                    <Calendar size={24} />
                </div>
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>Book an Appointment</h1>
                <p className="text-sm text-[var(--fg-muted)] mt-1">Schedule your visit quickly and securely.</p>
            </div>

            {error && (
                <div className="bg-[rgba(239,68,68,0.1)] text-[#f87171] p-3 rounded-xl text-sm mb-6 border border-[rgba(239,68,68,0.2)]">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
                        <input type="text" required value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                          className="input w-full pl-9 h-10 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] focus:border-[#6366f1]" placeholder="Arjun Sharma" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
                        <input type="tel" required value={formData.patient_phone} onChange={(e) => setFormData({...formData, patient_phone: e.target.value})}
                          className="input w-full pl-9 h-10 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] focus:border-[#6366f1]" placeholder="9876543210" />
                    </div>
                </div>

                <div>
                   <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Appointment Time</label>
                   <input type="datetime-local" required value={formData.appointment_time} onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                     className="input w-full h-10 bg-[rgba(255,255,255,0.03)] text-white border-[rgba(255,255,255,0.1)] focus:border-[#6366f1]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Consultation</label>
                        <select className="input w-full h-10 bg-[rgba(255,255,255,0.03)] text-white border-[rgba(255,255,255,0.1)]"
                           value={formData.consultation_type} onChange={(e) => setFormData({...formData, consultation_type: e.target.value})}>
                            <option value="offline" className="bg-[#0f172a]">In-Clinic</option>
                            <option value="online" className="bg-[#0f172a]">Online (Video)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Payment Mode</label>
                        <select className="input w-full h-10 bg-[rgba(255,255,255,0.03)] text-white border-[rgba(255,255,255,0.1)]"
                           value={formData.payment_mode} onChange={(e) => setFormData({...formData, payment_mode: e.target.value})}>
                            <option value="offline" className="bg-[#0f172a]">Pay Later</option>
                            <option value="online" className="bg-[#0f172a]">Online (UPI)</option>
                        </select>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full btn btn-primary py-3 rounded-xl mt-6 font-bold tracking-wide shadow-[0_8px_24px_rgba(98,70,234,0.35)]">
                    {loading ? "Booking..." : "Confirm Booking"}
                </button>
            </form>
        </motion.div>
    </div>
  );
}
