"use client";

import {
  Users, Search, UserPlus, MoreVertical, Phone,
  Calendar, Mail, Download, X, SlidersHorizontal, Activity, FileText
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { exportCSV } from "@/lib/csv";
import axios from "axios";
import { useAuth } from "@/stores/authStore";

const AVATAR_COLORS: [string, string][] = [
  ["#6246ea", "#7c3aed"], ["#0891b2", "#0e7490"],
  ["#059669", "#047857"], ["#d97706", "#b45309"],
  ["#dc2626", "#b91c1c"], ["#7c3aed", "#6d28d9"],
  ["#0891b2", "#6246ea"], ["#059669", "#0891b2"],
];

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="px-0.5 rounded font-bold"
            style={{ background: "rgba(99,102,241,0.25)", color: "#818cf8" }}>
            {p}
          </mark>
        ) : p
      )}
    </>
  );
}

export default function PatientsPage() {
  const { clinic, token } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Profile Modal
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const fetchPatients = async () => {
      if (!clinic || !token) return;
      try {
          const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
          const res = await axios.get(`${url}/patients/clinic/${clinic.id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setPatients(res.data.patients);
      } catch (e) {
          console.error("Failed to fetch patients", e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchPatients();
  }, [clinic, token]);

  const searchTerm = useDebounce(raw, 220);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = patients
    .filter((p) =>
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const suggestions = raw
    ? patients.filter((p) => p.name.toLowerCase().includes(raw.toLowerCase())).slice(0, 5)
    : [];

  const handleExport = () =>
    exportCSV(filtered, "patients", {
      id: "ID", name: "Name",
      phone: "Phone", email: "Email",
      lastVisit: "Created At"
    });

  return (
    <div className="page-enter space-y-6 pb-10">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Users size={13} style={{ color: "#22d3ee" }} />
            <span className="text-[10px] font-black text-[var(--fg-muted)] uppercase tracking-[0.15em]">
              Patient Directory
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            All Patients
            <span className="ml-3 text-sm font-black px-2.5 py-0.5 rounded-lg align-middle"
              style={{ background: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.25)" }}>
              {filtered.length}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            className="btn btn-outline btn-sm gap-2"
            style={{ color: "#22d3ee", borderColor: "rgba(6,182,212,0.28)" }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleExport}
          >
            <Download size={13} /> Export CSV
          </motion.button>
          <motion.button
            className="btn btn-primary btn-sm gap-2 shadow-[0_4px_16px_rgba(98,70,234,0.4)]"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          >
            <UserPlus size={13} /> Add Patient
          </motion.button>
        </div>
      </div>

      {/* ── Search Bar ───────────────────────── */}
      <div className="glass-card flex flex-col sm:flex-row gap-3" style={{ padding: "1rem 1.25rem" }}>
        <div className="relative flex-1" ref={searchRef}>
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--fg-muted)]" />
          <input
            type="text"
            placeholder="Search by name, phone or email…"
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setShowSuggestions(true); }}
            onFocus={() => raw && setShowSuggestions(true)}
            className="input-premium pl-9 pr-9 w-full bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] text-white focus:border-[#6366f1]"
            autoComplete="off"
          />
          {raw && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-white transition-colors"
              onClick={() => { setRaw(""); setShowSuggestions(false); }}
            >
              <X size={13} />
            </button>
          )}

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-xl overflow-hidden glass"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              >
                {suggestions.map((p, idx) => {
                  const [c1, c2] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <div key={p.id}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors text-white"
                      onMouseDown={() => { setRaw(p.name); setShowSuggestions(false); setSelectedPatient(p); }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                        style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{highlight(p.name, raw)}</p>
                        <p className="text-[10px] text-[var(--fg-muted)]">{p.phone}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Patient Card Grid ─────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {loading ? (
            <div className="flex justify-center p-20"><div className="w-8 h-8 rounded-full border-4 border-t-[#6366f1] border-[#6366f1]/20 animate-spin"></div></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((patient, idx) => {
              const [c1, c2] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initials = patient.name.split(" ").map((n: string) => n[0]).join("").substring(0,2);
              
              const d = new Date(patient.created_at);
              const dateStr = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <motion.div
                  key={patient.id} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, scale: 1.01 }} onClick={() => setSelectedPatient(patient)}
                >
                  <div className="glass-card group cursor-pointer h-full" style={{ padding: 0 }}>
                    <div className="h-1.5 w-full rounded-t-xl" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                          style={{ background: `linear-gradient(135deg,${c1},${c2})`, boxShadow: `0 4px 14px ${c1}44` }}>
                          {initials}
                        </div>
                        <button className="btn btn-ghost btn-icon opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={14} />
                        </button>
                      </div>

                      <h3 className="font-black text-white text-sm mb-1.5 leading-tight">{highlight(patient.name, searchTerm)}</h3>
                      
                      <div className="space-y-1.5 mt-2 text-white">
                         <div className="flex items-center gap-2 text-[11px] text-[var(--fg-muted)]">
                            <Phone size={10} className="flex-shrink-0" />
                            <span className="truncate">{patient.phone}</span>
                         </div>
                         <div className="flex items-center gap-2 text-[11px] text-[var(--fg-muted)]">
                            <Calendar size={10} className="flex-shrink-0" />
                            <span className="truncate">Active since: {dateStr}</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-2.5 flex items-center justify-between border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
                         Medical Record
                      </span>
                      <span className="text-[11px] font-black flex items-center gap-1 transition-colors" style={{ color: c1 }}>
                        View Profile →
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-[rgba(99,102,241,0.15)] bg-[rgba(99,102,241,0.08)]">
              <Users size={28} className="text-[var(--fg-muted)]" />
            </div>
            <h3 className="text-lg font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>No patients found</h3>
            <p className="text-[var(--fg-muted)] text-sm mb-5 max-w-xs">Try adjusting your search or add a new patient.</p>
            <button className="btn btn-outline btn-sm" onClick={() => setRaw("")}>Clear Filters</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PATIENT PROFILE MODAL */}
      {selectedPatient && (
          <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
              <div className="modal-content relative overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 w-full h-24 bg-gradient-to-r from-[#6246ea] to-[#22d3ee] opacity-20 pointer-events-none" />
                  <button onClick={() => setSelectedPatient(null)} className="absolute top-4 right-4 text-[var(--fg-muted)] hover:text-white z-10"><X size={20}/></button>
                  
                  <div className="p-6 pt-10">
                      <div className="flex items-center gap-4 mb-6">
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6246ea] to-[#7c3aed] flex items-center justify-center text-xl font-black text-white shadow-xl">
                                {selectedPatient.name.charAt(0)}
                           </div>
                           <div>
                               <h2 className="text-2xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{selectedPatient.name}</h2>
                               <div className="flex gap-2 text-xs text-[var(--fg-muted)] mt-1 font-semibold">
                                   <span>{selectedPatient.phone}</span> • <span>ID: {selectedPatient.id.substring(selectedPatient.id.length - 6).toUpperCase()}</span>
                               </div>
                           </div>
                      </div>

                      <div className="grid gap-4">
                          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 text-white">
                              <h4 className="flex items-center gap-2 text-xs font-black uppercase text-[#818cf8] mb-3 tracking-widest"><Activity size={14} /> Medical Notes</h4>
                              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                                  {selectedPatient.notes || "No historical medical notes recorded for this patient."}
                              </p>
                          </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                          <button 
                             onClick={() => window.open(`/prescription/${selectedPatient._id || selectedPatient.id}`, '_blank')}
                             className="flex-1 btn btn-primary flex flex-col items-center py-4 rounded-xl gap-2 h-auto text-white"
                          >
                              <FileText size={20} />
                              <span className="text-xs">Generate Prescription (PDF)</span>
                          </button>
                          <button className="flex-1 btn bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] text-[#34d399] flex flex-col items-center py-4 rounded-xl gap-2 h-auto hover:bg-[rgba(52,211,153,0.2)]">
                              <Download size={20} />
                              <span className="text-xs">Download Invoice</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
