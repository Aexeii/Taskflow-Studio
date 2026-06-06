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
  title: 'Taskflow Studio — Minimal Task Management',
  description: 'A clean, modern task management system with a focus on simplicity and productivity.',
  keywords: ['tasks', 'productivity', 'project management', 'taskflow'],
  openGraph: {
    title: 'Taskflow Studio',
    description: 'Minimal task management for the modern era.',
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
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#111827',
              borderRadius: '12px',
              fontSize: '13px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  );
}
