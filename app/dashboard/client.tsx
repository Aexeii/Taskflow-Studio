'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BoardView from '@/components/tasks/BoardView';
import ListView from '@/components/tasks/ListView';
import CalendarView from '@/components/calendar/CalendarView';
import TaskModal from '@/components/tasks/TaskModal';
import StatsBar from '@/components/ui/StatsBar';
import FilterBar from '@/components/ui/FilterBar';
import type { Task, Project } from '@/types';
import type { User } from '@supabase/supabase-js';

interface Props {
  initialTasks: Task[];
  initialProjects: Project[];
  user: User;
}

export default function DashboardClient({ initialTasks, initialProjects }: Props) {
  const { setTasks, setProjects, viewMode } = useAppStore();

  useEffect(() => {
    setTasks(initialTasks);
    setProjects(initialProjects);
  }, [initialTasks, initialProjects, setTasks, setProjects]);

  const total = initialTasks.length;
  const done = initialTasks.filter(t => t.status === 'done').length;
  const inProgress = initialTasks.filter(t => t.status === 'in_progress').length;
  const overdue = initialTasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          subtitle={`${done} of ${total} tasks complete`}
          showViewToggle
        />

        <div className="flex-1 overflow-y-auto">
          <StatsBar total={total} done={done} inProgress={inProgress} overdue={overdue} />
          <FilterBar />

          <div className="mt-4">
            {viewMode === 'board' && <BoardView />}
            {viewMode === 'list' && <ListView />}
            {viewMode === 'calendar' && <CalendarView />}
            {viewMode === 'timeline' && (
              <div className="flex items-center justify-center h-64" style={{ color: '#3d5478' }}>
                <p className="text-sm">Timeline view coming soon</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <TaskModal />
    </div>
  );
}
