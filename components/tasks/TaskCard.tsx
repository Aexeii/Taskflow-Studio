'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue, cn } from '@/lib/utils';
import type { Task } from '@/types';
import {
  Calendar, Flag, MoreHorizontal, Trash2, Edit3,
  CheckCircle2, Circle, Clock, GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  dragging?: boolean;
}

export default function TaskCard({ task, dragging }: TaskCardProps) {
  const { updateTask, deleteTask, openTaskModal, projects } = useAppStore();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  const isDone = task.status === 'done';
  const overdue = task.due_date && isOverdue(task.due_date) && !isDone;
  const priority = PRIORITY_CONFIG[task.priority];
  const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;

  async function toggleDone() {
    setCompleting(true);
    const newStatus = isDone ? 'todo' : 'done';
    updateTask(task.id, { status: newStatus });
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    setCompleting(false);
  }

  async function handleDelete() {
    deleteTask(task.id);
    await supabase.from('tasks').delete().eq('id', task.id);
    toast.success('Task deleted');
    setMenuOpen(false);
  }

  return (
    <div
      className={cn(
        'task-card glass-sm p-4 relative group',
        dragging && 'opacity-50 scale-95',
      )}
      style={{
        borderColor: isDone
          ? 'rgba(52,211,153,0.15)'
          : overdue
          ? 'rgba(244,63,94,0.2)'
          : undefined,
      }}
    >
      {/* Priority accent line */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ background: priority.color, opacity: isDone ? 0.3 : 0.7 }}
      />

      <div className="pl-3">
        {/* Top row */}
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={toggleDone}
            disabled={completing}
            className="mt-0.5 flex-shrink-0 transition-all"
            style={{ color: isDone ? '#34d399' : '#3d5478' }}
          >
            {isDone
              ? <CheckCircle2 size={17} />
              : <Circle size={17} />
            }
          </button>

          <p
            className={cn('text-sm flex-1 leading-snug', isDone && 'line-through')}
            style={{ color: isDone ? '#3d5478' : '#e2eaf5' }}
          >
            {task.title}
          </p>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: '#7a93b4' }}
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 top-7 z-20 w-36 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(13,20,34,0.98)',
                    border: '1px solid rgba(30,45,69,0.8)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <button
                    onClick={() => { openTaskModal(task); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors"
                    style={{ color: '#7a93b4' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#e2eaf5'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7a93b4'}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors"
                    style={{ color: '#7a93b4' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f43f5e'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7a93b4'}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: '#7a93b4' }}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(30,45,69,0.6)', color: '#7a93b4' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Priority */}
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: priority.bg, color: priority.color }}
          >
            <Flag size={10} />
            {priority.label}
          </span>

          {/* Project */}
          {project && (
            <span className="flex items-center gap-1 text-xs" style={{ color: '#7a93b4' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.color }} />
              {project.name}
            </span>
          )}

          {/* Due date */}
          {task.due_date && (
            <span
              className="flex items-center gap-1 text-xs ml-auto"
              style={{ color: overdue ? '#f43f5e' : '#7a93b4' }}
            >
              {overdue ? <Clock size={11} /> : <Calendar size={11} />}
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
