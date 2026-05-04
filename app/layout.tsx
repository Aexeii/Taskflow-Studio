import type { Metadata } from 'next';
import { DM_Sans, Syne, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

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
    <html lang="en" className={`${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
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
