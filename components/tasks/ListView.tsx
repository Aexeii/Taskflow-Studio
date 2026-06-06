'use client';

import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { CheckCircle2, Circle, Flag, Calendar, Trash2, Edit3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ListView() {
  const { tasks, updateTask, deleteTask, openTaskModal, filters, projects } = useAppStore();
  const supabase = createClient();

  const filtered = tasks.filter(t => {
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.project_id !== 'all' && t.project_id !== filters.project_id) return false;
    return true;
  }).sort((a, b) => a.order_index - b.order_index);

  async function toggleDone(task: typeof tasks[0]) {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask(task.id, { status: newStatus });
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
  }

  async function handleDelete(id: string) {
    deleteTask(id);
    await supabase.from('tasks').delete().eq('id', id);
    toast.success('Task deleted');
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-8">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
          <CheckCircle2 size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">No tasks found</p>
        <p className="text-xs mt-1 text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="px-8 pb-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <div className="w-5" />
          <div>Task</div>
          <div className="hidden md:block">Details</div>
          <div className="text-right">Actions</div>
        </div>
        
        {filtered.map((task, i) => {
          const isDone = task.status === 'done';
          const overdue = task.due_date && isOverdue(task.due_date) && !isDone;
          const priority = PRIORITY_CONFIG[task.priority];
          const status = STATUS_CONFIG[task.status];
          const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;

          return (
            <div
              key={task.id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-6 py-4 group transition-colors",
                i < filtered.length - 1 && "border-b border-gray-50",
                isDone ? "bg-gray-50/30" : "hover:bg-gray-50/50"
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(task)}
                className={cn(
                  "flex-shrink-0 transition-all hover:scale-110",
                  isDone ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                )}
              >
                {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>

              {/* Title and Priority */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: priority.color, opacity: isDone ? 0.5 : 1 }}
                />
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    isDone ? "text-gray-400 line-through" : "text-gray-900"
                  )}
                >
                  {task.title}
                </p>
              </div>

              {/* Meta - hidden on mobile */}
              <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                {project && (
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.color }} />
                    {project.name}
                  </span>
                )}

                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: status.bg, color: status.color, opacity: isDone ? 0.5 : 1 }}
                >
                  {status.label}
                </span>

                {task.due_date && (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-[10px] font-medium min-w-[80px]",
                      overdue ? "text-red-500" : "text-gray-400"
                    )}
                  >
                    {overdue ? <Clock size={11} /> : <Calendar size={11} />}
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openTaskModal(task)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
