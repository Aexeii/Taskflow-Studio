'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import CalendarView from '@/components/calendar/CalendarView';
import TaskModal from '@/components/tasks/TaskModal';
import type { Task, Project } from '@/types';

interface Props {
  initialTasks: Task[];
  initialProjects: Project[];
}

export default function CalendarClient({ initialTasks, initialProjects }: Props) {
  const { setTasks, setProjects } = useAppStore();

  useEffect(() => {
    setTasks(initialTasks);
    setProjects(initialProjects);
  }, [initialTasks, initialProjects]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Calendar" subtitle="Tasks by due date" showViewToggle={false} />
        <div className="flex-1 overflow-y-auto pt-5">
          <CalendarView />
        </div>
      </main>
      <TaskModal />
    </div>
  );
}
