# ⚡ Aero Tasks

A dark futuristic task management web app built with **Next.js 14**, **MongoDB + Prisma**, and a custom **glassmorphism design system**.

## ✨ Features

- Kanban board with drag-and-drop (dnd-kit)
- List view + Calendar view
- Project organization with color coding
- Task CRUD with priority, status, tags, due dates
- Search + multi-filter system
- JWT authentication with MongoDB
- Real-time cloud sync
- Fully responsive — mobile, tablet, desktop
- Dark glassmorphism UI system

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB

1. Create a project at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Update `.env.local` with your MongoDB URL

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Setup Prisma

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Stack

- **Frontend**: Next.js 14 · React 18 · Tailwind CSS · Framer Motion
- **Backend**: Next.js API Routes · Node.js
- **Database**: MongoDB · Prisma ORM
- **Auth**: JWT · bcryptjs
- **UI Components**: dnd-kit · Lucide React · react-hot-toast
- **Deployment**: Vercel

## 📁 Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # Authentication endpoints
│   ├── tasks/        # Task management endpoints
│   └── projects/     # Project management endpoints
├── auth/             # Auth pages (login, signup)
├── dashboard/        # Main dashboard
└── layout.tsx        # Root layout

components/          # Reusable components
lib/                 # Utilities
├── db.ts             # Prisma client
└── auth.ts           # Auth helpers

prisma/              # Database schema
└── schema.prisma
```

## 🌐 Deploy to Vercel

```bash
npx vercel
```

## 📝 License

MIT