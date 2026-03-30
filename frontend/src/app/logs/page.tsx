"use client";

import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter,
  Calendar,
  Phone,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const logs = [
  { id: 1, patient: "Arjun Sharma", phone: "919876543210", type: "Reminder", status: "success", time: "08:15 AM", date: "30 Mar 2024" },
  { id: 2, patient: "Priya Patel", phone: "919876543211", type: "Reminder", status: "success", time: "09:30 AM", date: "30 Mar 2024" },
  { id: 3, patient: "Meera Reddy", phone: "919876543215", type: "No-Show Rebook", status: "failed", time: "11:00 AM", date: "30 Mar 2024", error: "Invalid phone number" },
  { id: 4, patient: "Rahul Verma", phone: "919876543212", type: "Confirmation", status: "success", time: "11:45 AM", date: "30 Mar 2024" },
  { id: 5, patient: "Sneha Gupta", phone: "919876543213", type: "Reminder", status: "pending", time: "12:15 PM", date: "30 Mar 2024" },
];

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="text-brand-600" size={32} />
            Message Delivery Logs
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track the delivery status of all WhatsApp reminders and confirmations.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
           <div className="text-emerald-600 font-bold text-2xl">94%</div>
           <div className="text-[10px] font-bold text-emerald-700/70 uppercase leading-tight">
             Overall Delivery<br/>Success Rate
           </div>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200" 
              placeholder="Search by patient or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 gap-2 border-slate-200">
            <Calendar size={18} />
            Select Date
          </Button>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card className="border-none shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Patient</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Sent Time</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {logs.map((log) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-brand-600">
                        {log.patient.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{log.patient}</p>
                        <p className="text-[10px] font-medium text-slate-500">{log.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.status === "success" && (
                        <div className="flex items-center text-emerald-500 text-[10px] font-bold uppercase">
                          <CheckCircle2 size={14} className="mr-1" />
                          Delivered
                        </div>
                      )}
                      {log.status === "failed" && (
                        <div className="flex items-center text-danger-500 text-[10px] font-bold uppercase">
                          <XCircle size={14} className="mr-1" />
                          Failed
                        </div>
                      )}
                      {log.status === "pending" && (
                        <div className="flex items-center text-amber-500 text-[10px] font-bold uppercase">
                          <AlertCircle size={14} className="mr-1" />
                          Queued
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{log.time}</p>
                      <p className="text-[10px] font-medium text-slate-500">{log.date}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-brand-600 font-bold hover:bg-brand-50">
                      Resend <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="flex items-center justify-center gap-2 py-4">
        <Button variant="outline" size="sm" disabled>Previous</Button>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="bg-brand-600 text-white border-brand-600">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
        </div>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
}
