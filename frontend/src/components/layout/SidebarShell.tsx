"use client";
import { useSidebar } from "@/hooks/useSidebar";
import { useEffect, useState } from "react";

export default function SidebarShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
      style={{ marginLeft: isMobile ? 0 : isCollapsed ? "72px" : "240px" }}
    >
      {children}
    </div>
  );
}
