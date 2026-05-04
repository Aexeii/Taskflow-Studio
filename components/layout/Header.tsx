'use client';

import { useAppStore } from '@/store/app-store';
import { Menu, LayoutGrid, List, Calendar, GitBranch, Plus, SlidersHorizontal } from 'lucide-react';
import type { ViewMode } from '@/types';
import { cn } from '@/lib/utils';

const VIEW_MODES: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
  { mode: 'board',    icon: LayoutGrid, label: 'Board'    },
  { mode: 'list',     icon: List,       label: 'List'     },
  { mode: 'calendar', icon: Calendar,   label: 'Calendar' },
  { mode: 'timeline', icon: GitBranch,  label: 'Timeline' },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
  showViewToggle?: boolean;
}

export default function Header({ title, subtitle, showViewToggle = true }: HeaderProps) {
  const { setSidebarOpen, viewMode, setViewMode, openTaskModal } = useAppStore();

  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        borderBottom: '1px solid rgba(30,45,69,0.5)',
        background: 'rgba(8,12,20,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: '#7a93b4', background: 'rgba(30,45,69,0.4)' }}
        >
          <Menu size={18} />
        </button>
        <div>
          <h1
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#e2eaf5' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: '#7a93b4' }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showViewToggle && (
          <div
            className="hidden sm:flex items-center p-1 rounded-xl gap-0.5"
            style={{ background: 'rgba(13,20,34,0.8)', border: '1px solid rgba(30,45,69,0.6)' }}
          >
            {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                )}
                style={{
                  color: viewMode === mode ? '#38c4e8' : '#7a93b4',
                  background: viewMode === mode ? 'rgba(56,196,232,0.1)' : 'transparent',
                }}
              >
                <Icon size={14} />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => openTaskModal()}
          className="btn-primary flex items-center gap-2"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
}
