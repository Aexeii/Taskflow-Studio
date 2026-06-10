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
  useDroppable,
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
import { cn } from '@/lib/utils';

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

/** Registers each column as a real dnd-kit droppable so tasks can be
 *  dropped onto it (including empty columns). */
function ColumnDropZone({ status, children }: { status: TaskStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 rounded-2xl p-2 space-y-3 min-h-[200px] transition-colors border',
        isOver ? 'bg-gray-100 border-gray-300' : 'bg-gray-50/50 border-gray-100/50'
      )}
    >
      {children}
    </div>
  );
}

interface BoardViewProps {
  /** When set (e.g. on the Projects page) only tasks for this project are shown. */
  projectId?: string;
}

export default function BoardView({ projectId }: BoardViewProps = {}) {
  const { tasks, reorderTasks, openTaskModal, filters } = useAppStore();
  const supabase = createClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Filter
  const filtered = tasks.filter(t => {
    if (projectId && t.project_id !== projectId) return false;
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false;
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

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Resolve the destination column: either the column itself (when dropped
    // on empty space / header) or the column of the task we dropped onto.
    const overIsColumn = (COLUMNS as string[]).includes(overId);
    const targetStatus: TaskStatus = overIsColumn
      ? (overId as TaskStatus)
      : (tasks.find(t => t.id === overId)?.status ?? activeTask.status);

    // Build the destination column ordering without the active task.
    const destTasks = tasks
      .filter(t => t.status === targetStatus && t.id !== activeId)
      .sort((a, b) => a.order_index - b.order_index);

    // Where to insert: before the task we hovered, or at the end of the column.
    let insertIndex = destTasks.length;
    if (!overIsColumn) {
      const idx = destTasks.findIndex(t => t.id === overId);
      if (idx !== -1) insertIndex = idx;
    }

    const movedTask: Task = { ...activeTask, status: targetStatus };
    destTasks.splice(insertIndex, 0, movedTask);

    // Re-index the destination column so ordering persists.
    const reindexed = destTasks.map((t, i) => ({ ...t, order_index: i }));

    // Nothing actually changed (same column, same position).
    const changed = reindexed.some(rt => {
      const orig = tasks.find(t => t.id === rt.id);
      return !orig || orig.status !== rt.status || orig.order_index !== rt.order_index;
    });
    if (!changed) return;

    // Optimistic local update.
    const byId = new Map(reindexed.map(t => [t.id, t]));
    reorderTasks(tasks.map(t => byId.get(t.id) ?? t));

    // Persist only the rows that changed.
    await Promise.all(
      reindexed
        .filter(rt => {
          const orig = tasks.find(t => t.id === rt.id);
          return !orig || orig.status !== rt.status || orig.order_index !== rt.order_index;
        })
        .map(rt =>
          supabase
            .from('tasks')
            .update({ status: rt.status, order_index: rt.order_index })
            .eq('id', rt.id)
        )
    );
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
              <div className="flex items-center justify-between mb-4 px-1">
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
              <ColumnDropZone status={status}>
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
              </ColumnDropZone>
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
