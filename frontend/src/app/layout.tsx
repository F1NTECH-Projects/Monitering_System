import AuthGuard from "@/components/AuthGuard";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import PageWrapper from "@/components/layout/PageWrapper";
import QueryProvider from "@/components/providers/QueryProvider";
import SidebarShell from "@/components/layout/SidebarShell";
import ThemeProvider from "@/components/providers/ThemeProvider";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClinicFlow | Modern Healthcare Management",
  description: "High-end clinic management and automated WhatsApp appointment reminder system.",
  keywords: ["clinic", "healthcare", "appointments", "WhatsApp", "reminders"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full`}>
      <body className="bg-mesh h-screen overflow-hidden text-[--foreground] antialiased">
        <QueryProvider>
          <ThemeProvider>
          {/* Ambient background orbs */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div
              className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full opacity-20 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(98,70,234,0.4) 0%, transparent 70%)" }}
            />
            <div
              className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-15 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
            />
          </div>

          {/* App shell */}
          <div className="relative z-10 flex h-screen">
            <Sidebar />
            {/* Main content area — offset dynamically by Sidebar width */}
            <SidebarShell>
              <Navbar />
              <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 lg:py-8">
                <AuthGuard>
                  <PageWrapper>{children}</PageWrapper>
                </AuthGuard>
              </main>
            </SidebarShell>
          </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
