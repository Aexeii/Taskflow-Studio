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
      className="flex items-center justify-between px-8 py-6 flex-shrink-0 bg-white border-b border-gray-100"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold leading-tight text-gray-900 font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs mt-0.5 text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showViewToggle && (
          <div className="hidden sm:flex items-center p-1 bg-gray-50 border border-gray-100 rounded-xl gap-0.5">
            {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={label}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === mode ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon size={14} />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>
    </header>
  );
}
