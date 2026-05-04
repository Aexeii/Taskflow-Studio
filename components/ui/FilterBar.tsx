'use client';

import { useAppStore } from '@/store/app-store';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/types';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function FilterBar() {
  const { filters, setFilters, resetFilters, projects } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const hasFilters = filters.search || filters.priority !== 'all' || filters.status !== 'all' || filters.project_id !== 'all';

  return (
    <div className="px-6">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#3d5478' }} />
          <input
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            placeholder="Search tasks..."
            className="aero-input pl-9 text-sm"
            style={{ height: '38px' }}
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#3d5478' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Priority filter */}
        <select
          value={filters.priority}
          onChange={e => setFilters({ priority: e.target.value as Priority | 'all' })}
          className="aero-input text-sm"
          style={{ height: '38px', padding: '0 12px', width: 'auto' }}
        >
          <option value="all">All Priorities</option>
          {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
            <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={e => setFilters({ status: e.target.value as TaskStatus | 'all' })}
          className="aero-input text-sm"
          style={{ height: '38px', padding: '0 12px', width: 'auto' }}
        >
          <option value="all">All Statuses</option>
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        {/* Project filter */}
        {projects.length > 0 && (
          <select
            value={filters.project_id}
            onChange={e => setFilters({ project_id: e.target.value })}
            className="aero-input text-sm"
            style={{ height: '38px', padding: '0 12px', width: 'auto' }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-colors"
            style={{ color: '#f43f5e', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
