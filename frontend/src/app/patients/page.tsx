"use client";

import {
  Users, Search, UserPlus, MoreVertical, Phone,
  Calendar, Filter, Mail, Download, X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { exportCSV } from "@/lib/csv";

const PATIENTS = [
  { id: 1, name: "Arjun Sharma",     age: 34, phone: "919876543210", email: "arjun@example.com",     lastVisit: "24 Mar 2024", appts: 12 },
  { id: 2, name: "Priya Patel",      age: 28, phone: "919876543211", email: "priya@example.com",     lastVisit: "28 Mar 2024", appts: 5  },
  { id: 3, name: "Rahul Verma",      age: 45, phone: "919876543212", email: "rahul@example.com",     lastVisit: "15 Mar 2024", appts: 8  },
  { id: 4, name: "Sneha Gupta",      age: 31, phone: "919876543213", email: "sneha@example.com",     lastVisit: "30 Mar 2024", appts: 3  },
  { id: 5, name: "Amit Singh",       age: 52, phone: "919876543214", email: "amit@example.com",      lastVisit: "10 Feb 2024", appts: 20 },
  { id: 6, name: "Meera Reddy",      age: 24, phone: "919876543215", email: "meera@example.com",     lastVisit: "05 Mar 2024", appts: 2  },
  { id: 7, name: "Vikram Malhotra",  age: 38, phone: "919876543216", email: "vikram@example.com",    lastVisit: "18 Mar 2024", appts: 7  },
  { id: 8, name: "Ananya Iyer",      age: 29, phone: "919876543217", email: "ananya@example.com",    lastVisit: "22 Mar 2024", appts: 4  },
];

const AVATAR_COLORS = [
  ["#6246ea","#7c3aed"],["#0891b2","#0e7490"],["#059669","#047857"],
  ["#d97706","#b45309"],["#dc2626","#b91c1c"],["#7c3aed","#6d28d9"],
  ["#0891b2","#6246ea"],["#059669","#0891b2"],
];

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="px-0.5 rounded font-bold" style={{ background: "rgba(99,102,241,0.3)", color: "#818cf8" }}>{p}</mark>
          : p
      )}
    </>
  );
}

export default function PatientsPage() {
  const [raw,            setRaw]            = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy,         setSortBy]         = useState<"name"|"age"|"appts">("name");
  const searchRef = useRef<HTMLDivElement>(null);

  const searchTerm = useDebounce(raw, 220);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = PATIENTS
    .filter((p) =>
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name")  return a.name.localeCompare(b.name);
      if (sortBy === "age")   return a.age - b.age;
      if (sortBy === "appts") return b.appts - a.appts;
      return 0;
    });

  // Autocomplete suggestions (top 4 by name)
  const suggestions = raw
    ? PATIENTS.filter((p) => p.name.toLowerCase().includes(raw.toLowerCase())).slice(0, 4)
    : [];

  const handleExport = () =>
    exportCSV(filtered, "patients", {
      id: "ID", name: "Name", age: "Age",
      phone: "Phone", email: "Email",
      lastVisit: "Last Visit", appts: "Appointments",
    });

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={15} style={{ color: "#22d3ee" }} />
            <span className="text-xs font-bold uppercase tracking-widest text-[--foreground-muted]">Patient Directory</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            All Patients
            <span className="ml-3 text-sm font-bold px-2.5 py-0.5 rounded-full align-middle"
              style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.3)" }}>
              {filtered.length}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* CSV Export */}
          <motion.button
            id="export-patients-btn"
            className="btn btn-outline btn-sm gap-2"
            style={{ color: "#22d3ee", borderColor: "rgba(6,182,212,0.3)" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
          >
            <Download size={14} />
            Export CSV
          </motion.button>
          <motion.button
            className="btn btn-primary btn-sm gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <UserPlus size={14} />
            Register Patient
          </motion.button>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        {/* Autocomplete search */}
        <div className="relative flex-1" ref={searchRef}>
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[--foreground-muted]" />
          <input
            id="patient-search"
            type="text"
            placeholder="Search by name, phone or email…"
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setShowSuggestions(true); }}
            onFocus={() => raw && setShowSuggestions(true)}
            className="input-field pl-10 pr-9"
            autoComplete="off"
          />
          {raw && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--foreground-muted] hover:text-white transition-colors"
              onClick={() => { setRaw(""); setShowSuggestions(false); }}
            ><X size={14} /></button>
          )}

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-xl overflow-hidden"
                style={{ background: "rgba(13,18,38,0.98)", border: "1px solid rgba(99,102,241,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {suggestions.map((p, idx) => {
                  const [c1, c2] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <div key={p.id}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[rgba(99,102,241,0.08)] transition-colors"
                      onMouseDown={() => { setRaw(p.name); setShowSuggestions(false); }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{highlight(p.name, raw)}</p>
                        <p className="text-[10px] text-[--foreground-muted]">{p.phone}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "name",  label: "Name"  },
            { key: "age",   label: "Age"   },
            { key: "appts", label: "Visits" },
          ].map((opt) => (
            <button key={opt.key}
              onClick={() => setSortBy(opt.key as typeof sortBy)}
              className="btn btn-sm text-xs"
              style={
                sortBy === opt.key
                  ? { background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#818cf8" }
                  : { background: "transparent", border: "1px solid rgba(99,102,241,0.15)", color: "var(--foreground-muted)" }
              }>
              {opt.label}
            </button>
          ))}
          <button className="btn btn-outline btn-sm gap-1.5">
            <Filter size={13} />Filter
          </button>
        </div>
      </div>

      {/* Patient Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((patient, idx) => {
              const [c1, c2] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initials = patient.name.split(" ").map((n) => n[0]).join("");
              return (
                <motion.div key={patient.id} layout
                  initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                  <div className="glass-card overflow-hidden group cursor-pointer" style={{ padding: 0 }}>
                    {/* Colored top stripe */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${c1},${c2})` }} />

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                          style={{ background: `linear-gradient(135deg,${c1},${c2})`, boxShadow: `0 4px 14px ${c1}44` }}>
                          {initials}
                        </div>
                        <button className="btn btn-ghost btn-icon opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={15} />
                        </button>
                      </div>

                      <h3 className="font-bold text-white text-sm mb-1 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {highlight(patient.name, searchTerm)}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                          #{patient.id.toString().padStart(4, "0")}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${c1}18`, color: c1, border: `1px solid ${c1}28` }}>
                          {patient.age} yrs
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {[
                          { icon: Phone,    val: patient.phone     },
                          { icon: Mail,     val: patient.email     },
                          { icon: Calendar, val: `Last: ${patient.lastVisit}` },
                        ].map(({ icon: Icon, val }) => (
                          <div key={val} className="flex items-center gap-2 text-[11px] text-[--foreground-muted]">
                            <Icon size={11} className="flex-shrink-0" />
                            <span className="truncate">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-4 py-2.5 flex items-center justify-between"
                      style={{ background: "rgba(13,18,38,0.5)", borderTop: "1px solid rgba(99,102,241,0.08)" }}>
                      <span className="text-[10px] font-bold text-[--foreground-muted] uppercase tracking-wider">
                        {patient.appts} Visits
                      </span>
                      <button className="text-[11px] font-bold transition-colors" style={{ color: c1 }}>
                        View →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Users size={28} style={{ color: "var(--foreground-muted)" }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>No patients found</h3>
            <p className="text-[--foreground-muted] text-sm mb-5">Try adjusting your search or register a new patient.</p>
            <button className="btn btn-outline btn-sm" onClick={() => setRaw("")}>Clear Search</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
