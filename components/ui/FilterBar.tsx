'use client';

import { useAppStore } from '@/store/app-store';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/types';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function FilterBar() {
  const { filters, setFilters, resetFilters, projects } = useAppStore();
  const hasFilters = filters.search || filters.priority !== 'all' || filters.status !== 'all' || filters.project_id !== 'all';

  return (
    <div className="px-8 mb-6">
      <div className="flex items-center gap-3 flex-wrap bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            placeholder="Search tasks..."
            className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-black/5 outline-none"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Priority filter */}
        <select
          value={filters.priority}
          onChange={e => setFilters({ priority: e.target.value as Priority | 'all' })}
          className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-black/5 outline-none min-w-[130px]"
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
          className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-black/5 outline-none min-w-[130px]"
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
            className="bg-gray-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-black/5 outline-none min-w-[130px]"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
