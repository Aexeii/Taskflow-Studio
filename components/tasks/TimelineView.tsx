'use client';

import { useAppStore } from '@/store/app-store';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { format, startOfWeek, addDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export default function TimelineView() {
  const { tasks, filters, projects, openTaskModal } = useAppStore();

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.project_id !== 'all' && t.project_id !== filters.project_id) return false;
      return true;
    }).sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime();
    });
  }, [tasks, filters]);

  // Generate 14 days for the timeline
  const timelineDays = useMemo(() => {
    const start = startOfWeek(new Date());
    return Array.from({ length: 14 }).map((_, i) => addDays(start, i));
  }, []);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-8 text-gray-400">
        <p className="text-sm font-medium">No tasks with due dates found</p>
      </div>
    );
  }

  return (
    <div className="px-8 pb-8 overflow-x-auto">
      <div className="min-w-[1000px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Timeline Header */}
        <div className="grid grid-cols-[250px_1fr] border-b border-gray-100">
          <div className="p-4 bg-gray-50/50 border-r border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Task
          </div>
          <div className="grid grid-cols-14">
            {timelineDays.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-2 text-center border-r border-gray-50 last:border-r-0",
                  isSameDay(day, new Date()) ? "bg-black/5" : ""
                )}
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase">{format(day, 'EEE')}</div>
                <div className={cn(
                  "text-xs font-bold mt-0.5",
                  isSameDay(day, new Date()) ? "text-black" : "text-gray-400"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="divide-y divide-gray-50">
          {filtered.map(task => {
            const project = projects.find(p => p.id === task.project_id);
            const taskDate = task.due_date ? parseISO(task.due_date) : null;
            
            return (
              <div key={task.id} className="grid grid-cols-[250px_1fr] group hover:bg-gray-50/30 transition-colors">
                <div className="p-4 border-r border-gray-100 flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project?.color || '#E5E7EB' }} />
                  <span 
                    className={cn(
                      "text-sm font-medium truncate cursor-pointer hover:text-black",
                      task.status === 'done' ? "text-gray-400 line-through" : "text-gray-700"
                    )}
                    onClick={() => openTaskModal(task)}
                  >
                    {task.title}
                  </span>
                </div>
                
                <div className="grid grid-cols-14 relative h-14">
                  {/* Grid lines */}
                  {timelineDays.map((_, i) => (
                    <div key={i} className="border-r border-gray-50 last:border-r-0 h-full" />
                  ))}
                  
                  {/* Task Bar */}
                  {taskDate && (
                    <div className="absolute inset-0 flex items-center px-2">
                      {timelineDays.map((day, i) => {
                        if (isSameDay(day, taskDate)) {
                          return (
                            <div 
                              key={i}
                              style={{ 
                                gridColumnStart: i + 1,
                                background: project?.color || '#000',
                                opacity: task.status === 'done' ? 0.4 : 1
                              }}
                              className="h-8 rounded-lg shadow-sm flex items-center px-3 text-[10px] font-bold text-white truncate animate-fade-in"
                            >
                              {format(taskDate, 'HH:mm')}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        .grid-cols-14 {
          display: grid;
          grid-template-columns: repeat(14, 1fr);
        }
      `}</style>
    </div>
  );
}
