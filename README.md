# ⚡ Aero Tasks

A dark futuristic task management web app built with **Next.js 14**, **Supabase**, and a custom **glassmorphism design system** — frosted panels, neon accents, floating cards, and smooth micro-interactions.

---

## ✨ Features

- Kanban board with drag-and-drop (dnd-kit)
- List view + Calendar view
- Project organization with color coding
- Task CRUD with priority, status, tags, due dates
- Search + multi-filter system
- Supabase auth (email/password + GitHub OAuth)
- Real-time cloud sync
- Fully responsive — mobile, tablet, desktop
- Dark glassmorphism UI system

---

## 🚀 Quick Start

### 1. Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase-schema.sql`
3. Go to **Settings → API** → copy your URL and anon key

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

---

## 🌐 Deploy to Vercel

```bash
npx vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) and add the two env vars in the dashboard.

**After deploying**, update Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## 🎨 Design System Tokens

| Token | Hex | Usage |
|---|---|---|
| `aero-bg` | `#080c14` | Page background |
| `aero-card` | `#111926` | Card background |
| `aero-border` | `#1e2d45` | Borders |
| `aero-cyan` | `#38c4e8` | Primary accent |
| `aero-blue` | `#4f8ef7` | Secondary |
| `aero-violet` | `#7c5df9` | Tertiary |
| `aero-green` | `#34d399` | Success |
| `aero-red` | `#f43f5e` | Danger |

Key CSS utilities: `.glass`, `.glass-sm`, `.aero-input`, `.btn-primary`, `.btn-ghost`, `.task-card`, `.gradient-border`

---

## 📱 Mobile App (React Native)

```bash
npx create-expo-app aero-tasks-mobile --template blank-typescript
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-reanimated react-native-gesture-handler zustand

# Build APK
npm install -g eas-cli && eas login
eas build --platform android --profile preview
```

Use the same Supabase project — all data syncs automatically.

---

## 🖥️ Desktop App (Electron)

```bash
mkdir aero-tasks-desktop && cd aero-tasks-desktop
npm init -y && npm install electron electron-builder
```

`main.js`:
```js
const { app, BrowserWindow, Tray, Menu } = require('electron');
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    titleBarStyle: 'hidden',
    backgroundColor: '#080c14',
  });
  win.loadURL('https://your-app.vercel.app'); // your deployed URL
});
```

```bash
npx electron-builder --win   # outputs .exe
```

---

## 🔗 Architecture

```
         ┌─────────────────────────────┐
         │        SUPABASE              │
         │  PostgreSQL + Auth + RT      │
         └────────────┬────────────────┘
              ┌───────┼───────┐
              ▼       ▼       ▼
          Web App  Mobile  Desktop
          Next.js   RN/Expo  Electron
          Vercel    EAS APK  .exe
```

---

## 🛠️ Stack

Next.js 14 · Tailwind CSS · Zustand · Supabase · dnd-kit · date-fns · Framer Motion · react-hot-toast · Vercel
