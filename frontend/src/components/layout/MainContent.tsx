"use client";
import { useSidebar } from "@/hooks/useSidebar";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className="flex flex-1 flex-col transition-all duration-300 overflow-hidden"
      style={{ marginLeft: isCollapsed ? "72px" : "var(--sidebar-width, 240px)" }}
    >
      {children}
    </div>
  );
}
