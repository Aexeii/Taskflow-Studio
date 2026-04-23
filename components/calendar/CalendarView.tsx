'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRIORITY_CONFIG } from '@/lib/utils';

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
    <div className="px-6 pb-6 flex flex-col h-full">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="p-2 rounded-xl transition-colors"
          style={{ background: 'rgba(30,45,69,0.4)', color: '#7a93b4', border: '1px solid rgba(30,45,69,0.6)' }}
        >
          <ChevronLeft size={16} />
        </button>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#e2eaf5', fontSize: '20px' }}>
          {format(current, 'MMMM yyyy')}
        </h2>

        <button
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="p-2 rounded-xl transition-colors"
          style={{ background: 'rgba(30,45,69,0.4)', color: '#7a93b4', border: '1px solid rgba(30,45,69,0.6)' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: '#3d5478' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1">
        {paddedDays.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const dayTasks = getTasksForDay(day);
          const today = isToday(day);
          const inMonth = isSameMonth(day, current);

          return (
            <div
              key={day.toISOString()}
              className="rounded-xl p-2 min-h-[80px] flex flex-col transition-colors cursor-default"
              style={{
                background: today
                  ? 'rgba(56,196,232,0.06)'
                  : 'rgba(13,20,34,0.4)',
                border: today
                  ? '1px solid rgba(56,196,232,0.25)'
                  : '1px solid rgba(30,45,69,0.35)',
                opacity: inMonth ? 1 : 0.3,
              }}
            >
              <span
                className="text-xs font-semibold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full"
                style={{
                  color: today ? '#38c4e8' : '#7a93b4',
                  background: today ? 'rgba(56,196,232,0.15)' : 'transparent',
                }}
              >
                {format(day, 'd')}
              </span>

              <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => openTaskModal(task)}
                    className="text-left text-xs px-1.5 py-0.5 rounded-md truncate w-full transition-opacity hover:opacity-80"
                    style={{
                      background: PRIORITY_CONFIG[task.priority].bg,
                      color: PRIORITY_CONFIG[task.priority].color,
                    }}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-xs" style={{ color: '#3d5478' }}>
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
