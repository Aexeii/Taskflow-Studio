'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TaskModal from '@/components/tasks/TaskModal';
import BoardView from '@/components/tasks/BoardView';
import ListView from '@/components/tasks/ListView';
import { PROJECT_COLORS } from '@/lib/utils';
import type { Task, Project } from '@/types';
import { Plus, Folder, Trash2, Edit3, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  initialTasks: Task[];
  initialProjects: Project[];
}

export default function ProjectsClient({ initialTasks, initialProjects }: Props) {
  const { setTasks, setProjects, projects, addProject, deleteProject, updateProject, selectedProjectId, setSelectedProject, viewMode } = useAppStore();
  const supabase = createClient();

  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(PROJECT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
    setProjects(initialProjects);
    if (!selectedProjectId && initialProjects.length > 0) {
      setSelectedProject(initialProjects[0].id);
    }
  }, [initialTasks, initialProjects]);

  async function handleCreateProject() {
    if (!newName.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .insert({ name: newName.trim(), description: newDesc.trim() || null, color: newColor, user_id: user.id })
      .select().single();

    if (data) {
      addProject(data);
      setSelectedProject(data.id);
      toast.success('Project created');
      setShowNewProject(false);
      setNewName(''); setNewDesc(''); setNewColor(PROJECT_COLORS[0]);
    } else {
      toast.error(error?.message ?? 'Error');
    }
    setSaving(false);
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Delete this project? Tasks will remain but be unassigned.')) return;
    deleteProject(id);
    await supabase.from('projects').delete().eq('id', id);
    toast.success('Project deleted');
    setSelectedProject(null);
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Projects" subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`} showViewToggle />

        <div className="flex flex-1 overflow-hidden">
          {/* Projects sidebar */}
          <div
            className="w-64 flex-shrink-0 flex flex-col overflow-y-auto"
            style={{ borderRight: '1px solid rgba(30,45,69,0.5)', background: 'rgba(8,12,20,0.4)' }}
          >
            <div className="p-4">
              <button
                onClick={() => setShowNewProject(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'rgba(30,45,69,0.4)',
                  border: '1px dashed rgba(30,45,69,0.8)',
                  color: '#7a93b4',
                }}
              >
                <Plus size={14} /> New Project
              </button>
            </div>

            <div className="px-3 flex-1">
              {projects.map(project => {
                const taskCount = initialTasks.filter(t => t.project_id === project.id).length;
                const doneCount = initialTasks.filter(t => t.project_id === project.id && t.status === 'done').length;
                const active = selectedProjectId === project.id;

                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className="w-full text-left p-3 rounded-xl mb-1.5 transition-all group"
                    style={{
                      background: active ? 'rgba(30,45,69,0.5)' : 'transparent',
                      border: active ? '1px solid rgba(30,45,69,0.7)' : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project.color }} />
                      <span className="text-sm font-medium truncate" style={{ color: active ? '#e2eaf5' : '#7a93b4' }}>
                        {project.name}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteProject(project.id); }}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        style={{ color: '#3d5478' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f43f5e'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#3d5478'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {/* Mini progress */}
                    <div className="w-full h-1 rounded-full" style={{ background: 'rgba(30,45,69,0.6)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${taskCount > 0 ? (doneCount / taskCount) * 100 : 0}%`,
                          background: project.color,
                        }}
                      />
                    </div>
                    <span className="text-xs mt-1.5 block" style={{ color: '#3d5478' }}>
                      {doneCount}/{taskCount} done
                    </span>
                  </button>
                );
              })}

              {projects.length === 0 && (
                <p className="text-xs text-center mt-8" style={{ color: '#3d5478' }}>
                  No projects yet
                </p>
              )}
            </div>
          </div>

          {/* Project content */}
          <div className="flex-1 overflow-y-auto">
            {selectedProject ? (
              <>
                <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: selectedProject.color }} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#e2eaf5', fontSize: '20px' }}>
                    {selectedProject.name}
                  </h2>
                  {selectedProject.description && (
                    <span className="text-sm" style={{ color: '#7a93b4' }}>{selectedProject.description}</span>
                  )}
                </div>
                <div className="pt-4">
                  {viewMode === 'board' ? <BoardView /> : <ListView />}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: '#3d5478' }}>
                <Folder size={40} className="mb-3" />
                <p className="text-sm">Select or create a project</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewProject(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{
                background: 'rgba(11,17,28,0.98)',
                border: '1px solid rgba(30,45,69,0.8)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#e2eaf5', fontSize: '18px' }}>
                  New Project
                </h3>
                <button onClick={() => setShowNewProject(false)} style={{ color: '#7a93b4' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>Name</label>
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Project name"
                    className="aero-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>Description</label>
                  <input
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Optional description"
                    className="aero-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: '#7a93b4' }}>Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{
                          background: c,
                          border: newColor === c ? `3px solid white` : '3px solid transparent',
                          transform: newColor === c ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: newColor === c ? `0 0 12px ${c}80` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowNewProject(false)} className="btn-ghost flex-1">Cancel</button>
                  <button onClick={handleCreateProject} disabled={saving} className="btn-primary flex-1">
                    {saving ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <TaskModal />
    </div>
  );
}
