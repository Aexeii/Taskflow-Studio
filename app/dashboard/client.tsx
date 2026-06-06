'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BoardView from '@/components/tasks/BoardView';
import ListView from '@/components/tasks/ListView';
import CalendarView from '@/components/calendar/CalendarView';
import TimelineView from '@/components/tasks/TimelineView';
import TaskModal from '@/components/tasks/TaskModal';
import StatsBar from '@/components/ui/StatsBar';
import FilterBar from '@/components/ui/FilterBar';
import type { Task, Project } from '@/types';
import type { User } from '@supabase/supabase-js';
import { isOverdue } from '@/lib/utils';

interface Props {
  initialTasks: Task[];
  initialProjects: Project[];
  user: User;
}

export default function DashboardClient({ initialTasks, initialProjects }: Props) {
  const { tasks, setTasks, setProjects, viewMode } = useAppStore();

  useEffect(() => {
    setTasks(initialTasks);
    setProjects(initialProjects);
  }, [initialTasks, initialProjects, setTasks, setProjects]);

  // Use live store data for stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdueCount = tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false;
      return isOverdue(t.due_date);
    }).length;

    return { total, done, inProgress, overdue: overdueCount };
  }, [tasks]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9F8F6]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          subtitle={`${stats.done} of ${stats.total} tasks complete`}
          showViewToggle
        />

        <div className="flex-1 overflow-y-auto pb-10">
          <StatsBar {...stats} />
          <FilterBar />

          <div className="mt-2">
            {viewMode === 'board' && <BoardView />}
            {viewMode === 'list' && <ListView />}
            {viewMode === 'calendar' && <CalendarView />}
            {viewMode === 'timeline' && <TimelineView />}
          </div>
        </div>
      </main>

      <TaskModal />
    </div>
  );
}
