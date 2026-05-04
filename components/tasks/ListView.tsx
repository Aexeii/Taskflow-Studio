'use client';

import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { CheckCircle2, Circle, Flag, Calendar, Trash2, Edit3, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

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
      <div className="flex flex-col items-center justify-center h-64 px-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(30,45,69,0.3)', border: '1px solid rgba(30,45,69,0.5)' }}
        >
          <CheckCircle2 size={28} style={{ color: '#3d5478' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: '#7a93b4' }}>No tasks found</p>
        <p className="text-xs mt-1" style={{ color: '#3d5478' }}>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(30,45,69,0.5)', background: 'rgba(11,17,28,0.5)' }}
      >
        {filtered.map((task, i) => {
          const isDone = task.status === 'done';
          const overdue = task.due_date && isOverdue(task.due_date) && !isDone;
          const priority = PRIORITY_CONFIG[task.priority];
          const status = STATUS_CONFIG[task.status];
          const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;

          return (
            <div
              key={task.id}
              className="flex items-center gap-4 px-5 py-3.5 group transition-colors"
              style={{
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(30,45,69,0.35)' : 'none',
                background: 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(30,45,69,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(task)}
                className="flex-shrink-0 transition-all"
                style={{ color: isDone ? '#34d399' : '#3d5478' }}
              >
                {isDone ? <CheckCircle2 size={17} /> : <Circle size={17} />}
              </button>

              {/* Priority dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: priority.color }}
              />

              {/* Title */}
              <p
                className="flex-1 text-sm truncate"
                style={{ color: isDone ? '#3d5478' : '#e2eaf5', textDecoration: isDone ? 'line-through' : 'none' }}
              >
                {task.title}
              </p>

              {/* Meta - hidden on mobile */}
              <div className="hidden md:flex items-center gap-4 flex-shrink-0">
                {project && (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: '#7a93b4' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.color }} />
                    {project.name}
                  </span>
                )}

                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: status.bg, color: status.color }}
                >
                  {status.label}
                </span>

                {task.due_date && (
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: overdue ? '#f43f5e' : '#7a93b4' }}
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
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#7a93b4' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#38c4e8'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7a93b4'}
                >
                  <Edit3 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#7a93b4' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f43f5e'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#7a93b4'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
