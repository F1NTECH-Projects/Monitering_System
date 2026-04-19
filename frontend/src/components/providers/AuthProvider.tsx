"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/stores/authStore";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useSidebar } from "@/hooks/useSidebar";

const PUBLIC_ROUTES = ["/login", "/portal", "/book", "/prescription"];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const token   = useAuth((s) => s.token);
  const router  = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const showShell = token && !isPublic;

  useEffect(() => {
    if (!token && !isPublic) {
      router.replace("/login");
    }
    if (token && pathname === "/login") {
      router.replace("/");
    }
  }, [token, pathname, router, isPublic]);

  // Public pages (login, portal) — render without chrome
  if (isPublic) {
    return <>{children}</>;
  }

  // Not authenticated yet — show blank while redirect happens
  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="w-10 h-10 rounded-full border-2 border-[rgba(99,102,241,0.2)] border-t-[#818cf8] animate-spin" />
      </div>
    );
  }

  // Authenticated — render full app shell
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{
          marginLeft: isCollapsed ? "72px" : "var(--sidebar-width)",
        }}
      >
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="main-scroll flex-1 px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
