"use client";

import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import PageWrapper from "@/components/layout/PageWrapper";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div 
      className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64"
      )}
    >
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <PageWrapper>
          {children}
        </PageWrapper>
      </main>
    </div>
  );
}
