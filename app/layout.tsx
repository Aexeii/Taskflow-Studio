import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Aero Tasks — Futuristic Task Management',
  description: 'A high-performance AI-powered task management system with a dark futuristic aesthetic.',
  keywords: ['tasks', 'productivity', 'project management', 'aero'],
  openGraph: {
    title: 'Aero Tasks',
    description: 'Futuristic task management for the modern era.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="aero-bg" suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 25, 38, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(30, 45, 69, 0.8)',
              color: '#e2eaf5',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#080c14' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#080c14' },
            },
          }}
        />
      </body>
    </html>
  );
}
