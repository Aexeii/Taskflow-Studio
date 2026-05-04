'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import { X, Flag, Folder, Calendar, Tag, Type, AlignLeft } from 'lucide-react';
import type { Priority, TaskStatus } from '@/types';
import { PRIORITY_CONFIG, STATUS_CONFIG, PROJECT_COLORS } from '@/lib/utils';
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

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
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

    if (editingTask) {
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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={closeTaskModal}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && closeTaskModal()}
      >
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(11,17,28,0.98)',
            border: '1px solid rgba(30,45,69,0.8)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#e2eaf5', fontSize: '18px' }}>
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={closeTaskModal}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#7a93b4' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
                <Type size={12} /> Title
              </label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="aero-input"
                style={{ fontSize: '15px', fontWeight: 500 }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
                <AlignLeft size={12} /> Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add more context..."
                rows={3}
                className="aero-input resize-none"
                style={{ lineHeight: '1.6' }}
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
                  <Flag size={12} /> Priority
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: priority === p ? PRIORITY_CONFIG[p].bg : 'rgba(13,20,34,0.6)',
                        color: priority === p ? PRIORITY_CONFIG[p].color : '#7a93b4',
                        border: `1px solid ${priority === p ? PRIORITY_CONFIG[p].color + '40' : 'rgba(30,45,69,0.5)'}`,
                      }}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#7a93b4' }}>Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="aero-input text-sm"
                  style={{ height: '36px', padding: '0 12px' }}
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
                <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
                  <Folder size={12} /> Project
                </label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="aero-input text-sm"
                  style={{ height: '36px', padding: '0 12px' }}
                >
                  <option value="">No project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
                  <Calendar size={12} /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="aero-input text-sm"
                  style={{ height: '36px', padding: '0 12px', colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>
                <Tag size={12} /> Tags (comma-separated)
              </label>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="design, frontend, urgent"
                className="aero-input text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-5" style={{ borderTop: '1px solid rgba(30,45,69,0.5)' }}>
            <button onClick={closeTaskModal} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : editingTask ? 'Save Changes' : 'Create Task'
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
