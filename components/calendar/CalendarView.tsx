'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRIORITY_CONFIG } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CalendarView() {
  const { tasks, openTaskModal } = useAppStore();
  const [current, setCurrent] = useState(new Date());

  const start = startOfMonth(current);
  const end = endOfMonth(current);
  const days = eachDayOfInterval({ start, end });

  // Pad start
  const startPad = start.getDay();
  const paddedDays: (Date | null)[] = [...Array(startPad).fill(null), ...days];

  function getTasksForDay(day: Date) {
    return tasks.filter(t => t.due_date && isSameDay(parseISO(t.due_date), day));
  }

  return (
    <div className="px-8 pb-8 flex flex-col h-full">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="font-display font-bold text-gray-900 text-2xl">
            {format(current, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrent(new Date())}
              className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-50 bg-gray-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-[0.2em] py-4 text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 flex-1">
          {paddedDays.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} className="border-r border-b border-gray-50/50 bg-gray-50/20" />;
            const dayTasks = getTasksForDay(day);
            const today = isToday(day);
            const inMonth = isSameMonth(day, current);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-3 min-h-[120px] flex flex-col transition-colors border-r border-b border-gray-50",
                  !inMonth && "bg-gray-50/20 opacity-40"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                      today ? "bg-black text-white shadow-md scale-110" : "text-gray-400"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-gray-300">{dayTasks.length}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto custom-scrollbar">
                  {dayTasks.slice(0, 4).map(task => (
                    <button
                      key={task.id}
                      onClick={() => openTaskModal(task)}
                      className="text-left text-[10px] font-bold px-2 py-1.5 rounded-lg truncate w-full transition-all hover:scale-[1.02] shadow-sm border border-black/5"
                      style={{
                        background: PRIORITY_CONFIG[task.priority].bg,
                        color: PRIORITY_CONFIG[task.priority].color,
                      }}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 4 && (
                    <button 
                      onClick={() => {/* could open a day view */}}
                      className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors pl-1"
                    >
                      + {dayTasks.length - 4} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
