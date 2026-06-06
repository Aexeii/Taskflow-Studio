# ⚡ Taskflow Studio

A clean, modern task management web app built with **Next.js 14**, **Supabase**, and a custom **white/beige/cream/black/gray** design system.

## ✨ Features

- **Kanban Board**: Drag-and-drop task organization (dnd-kit)
- **List View**: Detailed list of tasks with sorting and filtering
- **Calendar View**: Visual task scheduling
- **Timeline View**: Project roadmap (Coming Soon)
- **Project Organization**: Color-coded projects and progress tracking
- **Task CRUD**: Manage priority, status, tags, and due dates
- **Advanced Filtering**: Search and multi-filter system
- **Authentication**: Secure login/signup via Supabase (Email/Password & Google)
- **Responsive Design**: Optimized for mobile, tablet, and desktop

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [Supabase](https://supabase.com)
2. Run the provided `supabase-schema.sql` in the Supabase SQL Editor
3. Update `.env.local` with your Supabase credentials

### 3. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Stack

- **Frontend**: Next.js 14 (App Router) · React 18 · Tailwind CSS · Framer Motion
- **Backend**: Next.js API Routes · Supabase SSR
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (Email & Google)
- **UI Components**: dnd-kit · Lucide React · react-hot-toast · Zustand
- **Deployment**: Vercel

## 📝 License

MIT
