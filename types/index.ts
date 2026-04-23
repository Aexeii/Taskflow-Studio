export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  due_date?: string;
  project_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  order_index: number;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
  completed_count?: number;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export type ViewMode = 'board' | 'list' | 'calendar' | 'timeline';

export interface FilterState {
  search: string;
  priority: Priority | 'all';
  status: TaskStatus | 'all';
  project_id: string | 'all';
  due: 'all' | 'today' | 'week' | 'overdue';
}
