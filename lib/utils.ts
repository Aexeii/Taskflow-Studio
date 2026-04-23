import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import type { Priority, TaskStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d');
}

export function isOverdue(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isPast(d) && !isToday(d);
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; glow: string; bg: string }> = {
  low:    { label: 'Low',    color: '#7a93b4', glow: 'rgba(122,147,180,0.2)', bg: 'rgba(122,147,180,0.08)' },
  medium: { label: 'Medium', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)',  bg: 'rgba(245,158,11,0.08)'  },
  high:   { label: 'High',   color: '#f43f5e', glow: 'rgba(244,63,94,0.2)',   bg: 'rgba(244,63,94,0.08)'   },
  urgent: { label: 'Urgent', color: '#ff6b35', glow: 'rgba(255,107,53,0.3)',  bg: 'rgba(255,107,53,0.1)'   },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo:        { label: 'To Do',       color: '#7a93b4', bg: 'rgba(122,147,180,0.1)' },
  in_progress: { label: 'In Progress', color: '#38c4e8', bg: 'rgba(56,196,232,0.1)'  },
  done:        { label: 'Done',        color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
  cancelled:   { label: 'Cancelled',   color: '#3d5478', bg: 'rgba(61,84,120,0.1)'   },
};

export const PROJECT_COLORS = [
  '#38c4e8', '#4f8ef7', '#7c5df9', '#34d399',
  '#f59e0b', '#f43f5e', '#a78bfa', '#06b6d4',
];

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
