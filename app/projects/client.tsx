'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TaskModal from '@/components/tasks/TaskModal';
import BoardView from '@/components/tasks/BoardView';
import ListView from '@/components/tasks/ListView';
import TimelineView from '@/components/tasks/TimelineView';
import { PROJECT_COLORS } from '@/lib/utils';
import type { Task, Project } from '@/types';
import { Plus, Folder, Trash2, Edit3, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

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
    <div className="flex h-screen overflow-hidden bg-[#F9F8F6]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Projects" subtitle={`${projects.length} project${projects.length !== 1 ? 's' : ''}`} showViewToggle />

        <div className="flex flex-1 overflow-hidden">
          {/* Projects sidebar */}
          <div className="w-72 flex-shrink-0 flex flex-col bg-white border-r border-gray-100">
            <div className="p-6">
              <button
                onClick={() => setShowNewProject(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all"
              >
                <Plus size={16} /> New Project
              </button>
            </div>

            <div className="px-3 flex-1 overflow-y-auto pb-6">
              {projects.map(project => {
                const taskCount = initialTasks.filter(t => t.project_id === project.id).length;
                const doneCount = initialTasks.filter(t => t.project_id === project.id && t.status === 'done').length;
                const active = selectedProjectId === project.id;
                const progress = taskCount > 0 ? (doneCount / taskCount) * 100 : 0;

                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl mb-2 transition-all group border",
                      active ? "bg-white border-gray-200 shadow-sm" : "bg-transparent border-transparent hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project.color }} />
                      <span className={cn("text-sm font-bold truncate flex-1", active ? "text-gray-900" : "text-gray-500")}>
                        {project.name}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteProject(project.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-300 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    
                    {/* Mini progress */}
                    <div className="space-y-1.5">
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: project.color }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{doneCount}/{taskCount} Done</span>
                        <span className="text-[10px] font-bold text-gray-900">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {projects.length === 0 && (
                <div className="text-center mt-10 px-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Folder size={20} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No projects</p>
                </div>
              )}
            </div>
          </div>

          {/* Project content */}
          <div className="flex-1 overflow-y-auto bg-[#F9F8F6]">
            {selectedProject ? (
              <div className="pb-10">
                <div className="px-8 py-6 bg-white border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-4 h-4 rounded-full" style={{ background: selectedProject.color }} />
                    <h2 className="font-display font-bold text-gray-900 text-2xl">
                      {selectedProject.name}
                    </h2>
                  </div>
                  {selectedProject.description && (
                    <p className="text-sm text-gray-500 ml-7">{selectedProject.description}</p>
                  )}
                </div>
                <div>
                  {viewMode === 'board' && <BoardView projectId={selectedProject.id} />}
                  {viewMode === 'list' && <ListView projectId={selectedProject.id} />}
                  {viewMode === 'timeline' && <TimelineView projectId={selectedProject.id} />}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                  <Folder size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium">Select or create a project</p>
                <p className="text-xs mt-1">Organize your tasks into focused projects.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowNewProject(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display font-bold text-gray-900 text-xl">
                  New Project
                </h3>
                <button onClick={() => setShowNewProject(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Name</label>
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Project name"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/5 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                  <input
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Optional description"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black/5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Color</label>
                  <div className="flex gap-3 flex-wrap p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all border-2",
                          newColor === c ? "border-black scale-110 shadow-sm" : "border-transparent"
                        )}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowNewProject(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateProject} 
                    disabled={saving} 
                    className="flex-1 bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50"
                  >
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
