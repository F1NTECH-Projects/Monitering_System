import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'ClinicFlow — Healthcare Management OS',
  description: 'Automated WhatsApp appointment reminders, real-time analytics, and multi-clinic management.',
  keywords: ['clinic', 'healthcare', 'appointments', 'WhatsApp', 'reminders', 'monitoring'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-app overflow-hidden h-screen antialiased">
        {/* Ambient background orbs */}
        <div className="orb orb-brand" />
        <div className="orb orb-cyan" />

        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 3500,
            success: { iconTheme: { primary: '#34d399', secondary: '#03050f' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#03050f' } },
          }}
        />
      </body>
    </html>
  );
}
