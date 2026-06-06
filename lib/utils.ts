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

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low:    { label: 'Low',    color: '#9CA3AF', bg: '#F3F4F6' },
  medium: { label: 'Medium', color: '#D97706', bg: '#FEF3C7' },
  high:   { label: 'High',   color: '#DC2626', bg: '#FEE2E2' },
  urgent: { label: 'Urgent', color: '#7C2D12', bg: '#FFEDD5' },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo:        { label: 'To Do',       color: '#6B7280', bg: '#F3F4F6' },
  in_progress: { label: 'In Progress', color: '#2563EB', bg: '#DBEAFE' },
  done:        { label: 'Done',        color: '#059669', bg: '#D1FAE5' },
  cancelled:   { label: 'Cancelled',   color: '#9CA3AF', bg: '#F3F4F6' },
};

export const PROJECT_COLORS = [
  '#000000', '#4B5563', '#9CA3AF', '#D1D5DB',
  '#2563EB', '#059669', '#DC2626', '#D97706',
];

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
