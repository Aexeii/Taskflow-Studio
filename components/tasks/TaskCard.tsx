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
        'bg-white border border-gray-100 p-4 rounded-xl shadow-sm transition-all group hover:border-gray-300 hover:shadow-md',
        dragging && 'opacity-50 scale-95',
        isDone && 'bg-gray-50/50 border-gray-100'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Done Toggle */}
        <button
          onClick={toggleDone}
          disabled={completing}
          className={cn(
            'mt-0.5 flex-shrink-0 transition-all hover:scale-110',
            isDone ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'
          )}
        >
          {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title and Menu */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={cn(
                'text-sm font-semibold leading-tight break-words',
                isDone ? 'text-gray-400 line-through' : 'text-gray-900'
              )}
            >
              {task.title}
            </h3>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <MoreHorizontal size={15} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-7 z-20 w-36 bg-white border border-gray-100 rounded-xl shadow-xl py-1 overflow-hidden">
                    <button
                      onClick={() => { openTaskModal(task); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-red-500 hover:bg-red-50 transition-colors"
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
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-gray-50">
            {/* Priority */}
            <span
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: priority.bg, color: priority.color, opacity: isDone ? 0.5 : 1 }}
            >
              {priority.label}
            </span>

            {/* Project */}
            {project && (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.color }} />
                {project.name}
              </span>
            )}

            {/* Due date */}
            {task.due_date && (
              <span
                className={cn(
                  'flex items-center gap-1 text-[10px] font-medium ml-auto',
                  overdue ? 'text-red-500' : 'text-gray-400'
                )}
              >
                {overdue ? <Clock size={11} /> : <Calendar size={11} />}
                {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
