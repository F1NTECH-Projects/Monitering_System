"use client";

import { usePathname } from "next/navigation";
import { 
  Bell, 
  Search, 
  User,
  PlusCircle,
  Activity
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { MotionButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    switch (pathname) {
      case "/": return "Dashboard Overview";
      case "/patients": return "Patient Directory";
      case "/appointments": return "Appointment Schedule";
      case "/logs": return "Message Delivery Logs";
      case "/settings": return "Clinic Profile & Settings";
      default: return "Clinic Dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass border-b flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {getPageTitle()}
        </h1>
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            className="pl-10 h-9 bg-slate-100/50 dark:bg-slate-800/50 border-none focus-visible:ring-brand-400" 
            placeholder="Search patients, records..." 
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <MotionButton 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex items-center gap-2 border-brand-200 text-brand-600 hover:bg-brand-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusCircle size={16} />
          <span>New Appointment</span>
        </MotionButton>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="relative">
            <MotionButton variant="ghost" size="icon" className="text-slate-500" whileHover={{ rotate: 15 }}>
              <Bell size={20} />
            </MotionButton>
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-600 rounded-full border-2 border-white dark:border-slate-900" />
          </div>

          <div className="flex items-center gap-3 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">City Ortho Care</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Premium Plan</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-md cursor-pointer hover:ring-2 hover:ring-brand-400 transition-all">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
