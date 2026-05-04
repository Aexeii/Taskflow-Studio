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
  const { projects, sidebarOpen, setSidebarOpen, openTaskModal, setSelectedProject, selectedProjectId } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

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
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
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
          background: 'rgba(8,12,20,0.95)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(30,45,69,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #38c4e8, #4f8ef7)' }}
            >
              <Zap size={14} fill="#080c14" color="#080c14" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#e2eaf5', fontSize: '18px' }}>
              Aero
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: '#7a93b4' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick add task */}
        <div className="px-4 mb-4">
          <button
            onClick={() => openTaskModal()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(56,196,232,0.12), rgba(79,142,247,0.08))',
              border: '1px solid rgba(56,196,232,0.2)',
              color: '#38c4e8',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(56,196,232,0.2), rgba(79,142,247,0.14))';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(56,196,232,0.12), rgba(79,142,247,0.08))';
            }}
          >
            <Plus size={16} />
            New Task
          </button>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          {searchOpen ? (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3d5478' }} />
              <input
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onBlur={() => { if (!searchVal) setSearchOpen(false); }}
                placeholder="Search tasks..."
                className="aero-input pl-9 text-xs"
                style={{ height: '36px' }}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors"
              style={{ color: '#3d5478', background: 'rgba(13,20,34,0.6)', border: '1px solid rgba(30,45,69,0.5)' }}
            >
              <Search size={13} />
              <span>Search...</span>
              <span className="ml-auto text-xs opacity-50">⌘K</span>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="px-3 mb-4">
          <p className="px-2 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: '#3d5478' }}>
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
                  active ? 'font-medium' : 'font-normal',
                )}
                style={{
                  color: active ? '#38c4e8' : '#7a93b4',
                  background: active ? 'rgba(56,196,232,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(56,196,232,0.12)' : '1px solid transparent',
                }}
              >
                <Icon size={16} />
                {label}
                {active && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: '#38c4e8', boxShadow: '0 0 6px #38c4e8' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Projects */}
        <div className="px-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3d5478' }}>
              Projects
            </p>
            <Link
              href="/projects"
              className="p-1 rounded-lg transition-colors"
              style={{ color: '#3d5478' }}
            >
              <Plus size={13} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="px-2 text-xs" style={{ color: '#3d5478' }}>No projects yet</p>
          ) : (
            projects.map(project => (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProject(project.id);
                  router.push('/projects');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm mb-0.5 transition-all text-left"
                style={{
                  color: selectedProjectId === project.id ? '#e2eaf5' : '#7a93b4',
                  background: selectedProjectId === project.id ? 'rgba(30,45,69,0.5)' : 'transparent',
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: project.color }}
                />
                <span className="truncate">{project.name}</span>
                <span className="ml-auto text-xs" style={{ color: '#3d5478' }}>
                  {project.task_count ?? 0}
                </span>
                <ChevronRight size={12} style={{ color: '#3d5478' }} />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(30,45,69,0.5)' }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: '#7a93b4' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#f43f5e';
              (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = '#7a93b4';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
