"use client";
import { useAuth } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionButton } from "@/components/ui/Button";
import { useSidebar } from "@/hooks/useSidebar";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Patients", icon: Users, href: "/patients" },
  { name: "Appointments", icon: Calendar, href: "/appointments" },
  { name: "Message Logs", icon: MessageSquare, href: "/logs" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed: collapsed, toggle } = useSidebar();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 glass border-r",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col justify-between py-6 px-3">
        <div>
          {/* Logo Section */}
          <div className={cn("flex items-center mb-8 px-2", collapsed ? "justify-center" : "gap-3")}>
            <div className="bg-brand-600 p-2 rounded-lg text-white shadow-lg">
              <Stethoscope size={24} />
            </div>
            {!collapsed && (
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Clinic<span className="text-brand-600">Flow</span>
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group mb-1",
                      isActive 
                        ? "bg-brand-600 text-white shadow-md" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600"
                    )}
                  >
                    <item.icon size={20} className={cn(isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                    {!collapsed && <span className="font-medium">{item.name}</span>}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="font-medium text-sm">Collapse</span>}
          </button>
          
          <div className={cn("pt-4 border-t border-slate-200 dark:border-slate-800", collapsed ? "px-1" : "px-2")}>
            <MotionButton 
              variant="ghost" 
              className={cn("w-full justify-start text-danger-500 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 px-2")}
              whileHover={{ x: 5 }}
            >
              <LogOut size={20} onClick={handleLogout} style={{cursor:"pointer"}} />
              {!collapsed && <span className="ml-3 font-medium">Log out</span>}
            </MotionButton>
          </div>
        </div>
      </div>
    </aside>
  );
}
