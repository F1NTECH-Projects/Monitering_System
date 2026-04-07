import AuthGuard from "@/components/AuthGuard";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";
import QueryProvider from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClinicFlow | Modern Healthcare Management",
  description: "High-end clinic management and patient reminder system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="flex h-screen overflow-hidden bg-[--background] text-[--foreground]">
        <QueryProvider>
          <Sidebar />
          <MainContent>
            <AuthGuard>{children}</AuthGuard>
          </MainContent>
        </QueryProvider>
      </body>
    </html>
  );
}
