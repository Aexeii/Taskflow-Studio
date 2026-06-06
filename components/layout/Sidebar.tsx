'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store/app-store';
import {
  LayoutDashboard, FolderOpen, Calendar, Search,
  Plus, ChevronRight, LogOut, Settings, Zap,
  Circle, CheckCircle2, X, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/projects',  icon: FolderOpen,      label: 'Projects'  },
  { href: '/calendar',  icon: Calendar,         label: 'Calendar'  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { projects, sidebarOpen, setSidebarOpen, openTaskModal, setSelectedProject, selectedProjectId, filters, setFilters } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
    toast.success('Signed out');
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{
          width: '260px',
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-black"
            >
              <Zap size={14} fill="white" color="white" />
            </div>
            <span className="font-display font-bold text-gray-900 text-lg">
              Taskflow
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick add task */}
        <div className="px-4 mb-4">
          <button
            onClick={() => openTaskModal()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all bg-black text-white hover:bg-gray-800 shadow-sm"
          >
            <Plus size={16} />
            New Task
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mb-6">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
            <input
              value={filters.search}
              onChange={e => setFilters({ search: e.target.value })}
              placeholder="Search tasks..."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black/5 transition-all"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 mb-6">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Menu
          </p>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all',
                  active ? 'bg-gray-100 text-black font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon size={16} className={active ? 'text-black' : 'text-gray-400'} />
                {label}
                {active && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-black"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Projects */}
        <div className="px-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Projects
            </p>
            <Link
              href="/projects"
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus size={13} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="px-3 text-xs text-gray-400 italic">No projects yet</p>
          ) : (
            projects.map(project => (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProject(project.id);
                  router.push('/projects');
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm mb-0.5 transition-all text-left',
                  selectedProjectId === project.id ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: project.color }}
                />
                <span className="truncate flex-1">{project.name}</span>
                <ChevronRight size={12} className="text-gray-300" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
