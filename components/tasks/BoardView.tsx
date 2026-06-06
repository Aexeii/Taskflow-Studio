'use client';

import { useAppStore } from '@/store/app-store';
import { createClient } from '@/lib/supabase/client';
import TaskCard from './TaskCard';
import { STATUS_CONFIG } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Plus } from 'lucide-react';

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done', 'cancelled'];

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

export default function BoardView() {
  const { tasks, updateTask, openTaskModal, filters } = useAppStore();
  const supabase = createClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Filter
  const filtered = tasks.filter(t => {
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false; // Fixed: added status filter
    if (filters.project_id !== 'all' && t.project_id !== filters.project_id) return false;
    return true;
  });

  function getColumnTasks(status: TaskStatus) {
    return filtered.filter(t => t.status === status).sort((a, b) => a.order_index - b.order_index);
  }

  function handleDragStart(e: DragStartEvent) {
    const task = tasks.find(t => t.id === e.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    // Dropped on a column header
    const newStatus = over.id as TaskStatus;
    if (COLUMNS.includes(newStatus)) {
      const task = tasks.find(t => t.id === active.id);
      if (task && task.status !== newStatus) {
        updateTask(task.id, { status: newStatus });
        await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-full overflow-x-auto pb-8 px-8">
        {COLUMNS.map(status => {
          const colTasks = getColumnTasks(status);
          const cfg = STATUS_CONFIG[status];
          return (
            <div
              key={status}
              className="flex-shrink-0 flex flex-col"
              style={{ width: '320px' }}
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between mb-4 px-1"
                id={status}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: cfg.color }}
                  />
                  <span className="text-sm font-bold text-gray-900">
                    {cfg.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openTaskModal({ status } as any)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Drop zone column */}
              <div
                id={status}
                className="flex-1 rounded-2xl p-2 space-y-3 min-h-[200px] transition-colors bg-gray-50/50 border border-gray-100/50"
              >
                <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {colTasks.map(task => (
                    <SortableTaskCard key={task.id} task={task} />
                  ))}
                </SortableContext>

                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                    <p className="text-[10px] font-medium uppercase tracking-wider">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} dragging />}
      </DragOverlay>
    </DndContext>
  );
}
