'use client';

import { create } from 'zustand';
import type { Task, Project, FilterState, ViewMode } from '@/types';

interface AppState {
  tasks: Task[];
  projects: Project[];
  filters: FilterState;
  viewMode: ViewMode;
  selectedProjectId: string | null;
  sidebarOpen: boolean;
  taskModalOpen: boolean;
  editingTask: Task | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedProject: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  openTaskModal: (task?: Task) => void;
  closeTaskModal: () => void;
}

const defaultFilters: FilterState = {
  search: '',
  priority: 'all',
  status: 'all',
  project_id: 'all',
  due: 'all',
};

export const useAppStore = create<AppState>((set) => ({
  tasks: [],
  projects: [],
  filters: defaultFilters,
  viewMode: 'board',
  selectedProjectId: null,
  sidebarOpen: false,
  taskModalOpen: false,
  editingTask: null,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  reorderTasks: (tasks) => set({ tasks }),

  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  deleteProject: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedProject: (id) => set({ selectedProjectId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openTaskModal: (task) =>
    set({ taskModalOpen: true, editingTask: task ?? null }),
  closeTaskModal: () => set({ taskModalOpen: false, editingTask: null }),
}));
