'use client';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import { X, Flag, Folder, Calendar, Tag, Type, AlignLeft } from 'lucide-react';
import type { Priority, TaskStatus } from '@/types';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TaskModal() {
  const { taskModalOpen, editingTask, closeTaskModal, addTask, updateTask, projects } = useAppStore();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  // A real edit only when we have an existing task with an id. The board
  // column "+" passes a partial task ({ status }) to pre-fill a NEW task,
  // so we must not treat that as an update.
  const isEdit = Boolean(editingTask && editingTask.id);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title ?? '');
      setDescription(editingTask.description ?? '');
      setPriority(editingTask.priority ?? 'medium');
      setStatus(editingTask.status ?? 'todo');
      setDueDate(editingTask.due_date ? editingTask.due_date.split('T')[0] : '');
      setProjectId(editingTask.project_id ?? '');
      setTags(editingTask.tags?.join(', ') ?? '');
    } else {
      setTitle(''); setDescription(''); setPriority('medium');
      setStatus('todo'); setDueDate(''); setProjectId(''); setTags('');
    }
  }, [editingTask, taskModalOpen]);

  if (!taskModalOpen) return null;

  async function handleSave() {
    if (!title.trim()) return toast.error('Task title required');
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Not signed in'); setSaving(false); return; }

    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      due_date: dueDate || null,
      project_id: projectId || null,
      tags: tagArr.length ? tagArr : null,
    };

    if (isEdit && editingTask) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', editingTask.id);
      if (!error) {
        updateTask(editingTask.id, { ...payload, description: payload.description ?? undefined, project_id: payload.project_id ?? undefined, due_date: payload.due_date ?? undefined, tags: tagArr });
        toast.success('Task updated');
        closeTaskModal();
      } else {
        toast.error(error.message);
      }
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...payload, user_id: user.id, order_index: Date.now() })
        .select()
        .single();
      if (!error && data) {
        addTask(data);
        toast.success('Task created');
        closeTaskModal();
      } else {
        toast.error(error?.message ?? 'Error');
      }
    }
    setSaving(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={closeTaskModal}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && closeTaskModal()}
      >
        <div className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <h2 className="font-display font-bold text-gray-900 text-lg">
              {isEdit ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={closeTaskModal}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                <Type size={12} /> Title
              </label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/5 transition-all font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                <AlignLeft size={12} /> Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add more context..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/5 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  <Flag size={12} /> Priority
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border',
                        priority === p 
                          ? 'bg-black text-white border-black' 
                          : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                      )}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 block">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black/5"
                >
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project + Due date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  <Folder size={12} /> Project
                </label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black/5"
                >
                  <option value="">No project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  <Calendar size={12} /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black/5"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                <Tag size={12} /> Tags
              </label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="design, frontend, urgent"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/5"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-5 bg-gray-50 border-t border-gray-100">
            <button onClick={closeTaskModal} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : isEdit ? 'Save Changes' : 'Create Task'
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
