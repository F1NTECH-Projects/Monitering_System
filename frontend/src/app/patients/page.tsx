"use client";

import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  Filter,
  ArrowUpDown,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button, MotionButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const patients = [
  { id: 1, name: "Arjun Sharma", age: 34, phone: "919876543210", email: "arjun@example.com", lastVisit: "24 Mar 2024", appts: 12 },
  { id: 2, name: "Priya Patel", age: 28, phone: "919876543211", email: "priya@example.com", lastVisit: "28 Mar 2024", appts: 5 },
  { id: 3, name: "Rahul Verma", age: 45, phone: "919876543212", email: "rahul@example.com", lastVisit: "15 Mar 2024", appts: 8 },
  { id: 4, name: "Sneha Gupta", age: 31, phone: "919876543213", email: "sneha@example.com", lastVisit: "30 Mar 2024", appts: 3 },
  { id: 5, name: "Amit Singh", age: 52, phone: "919876543214", email: "amit@example.com", lastVisit: "10 Feb 2024", appts: 20 },
  { id: 6, name: "Meera Reddy", age: 24, phone: "919876543215", email: "meera@example.com", lastVisit: "05 Mar 2024", appts: 2 },
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-brand-600" size={32} />
            Patient Directory
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your patient records and medical history efficiently.
          </p>
        </div>
        <MotionButton className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20 px-6 py-6 rounded-xl" whileHover={{ scale: 1.02 }}>
          <UserPlus size={20} className="mr-2" />
          Register New Patient
        </MotionButton>
      </div>

      {/* Search & Filters */}
      <Card className="border-none shadow-md overflow-visible">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" 
              placeholder="Search by name, phone number, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-11 gap-2 border-slate-200">
              <Filter size={18} />
              Filters
            </Button>
            <Button variant="outline" className="h-11 gap-2 border-slate-200">
              <ArrowUpDown size={18} />
              Sort
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient, idx) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-xl transition-all duration-300 border-none group">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-brand-600">
                      <MoreVertical size={18} />
                    </Button>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      ID: #{patient.id.toString().padStart(4, '0')}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600">
                      {patient.age} yrs
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Phone size={14} className="mr-3 text-slate-400" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <Calendar size={14} className="mr-3 text-slate-400" />
                      Last Visit: {patient.lastVisit}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
                  <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Calendar size={14} className="mr-1.5" />
                    {patient.appts} Appointments
                  </div>
                  <Button variant="link" className="text-brand-600 p-0 h-auto text-sm font-bold">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="py-20 text-center">
          <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
            <Users size={48} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">No patients found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-6">
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
