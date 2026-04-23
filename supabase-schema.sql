-- =============================================
-- AERO TASKS — SUPABASE SCHEMA
-- Run this in your Supabase SQL editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROJECTS TABLE
-- =============================================
create table if not exists public.projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  description text,
  color       text not null default '#38c4e8',
  icon        text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- =============================================
-- TASKS TABLE
-- =============================================
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  project_id  uuid references public.projects(id) on delete set null,
  title       text not null,
  description text,
  status      text not null default 'todo'
              check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  priority    text not null default 'medium'
              check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date    timestamptz,
  tags        text[],
  order_index bigint not null default extract(epoch from now()) * 1000,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- Projects policies
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Tasks policies
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- =============================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_projects_updated
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

create trigger on_tasks_updated
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

-- =============================================
-- INDEXES for performance
-- =============================================
create index if not exists idx_tasks_user_id    on public.tasks(user_id);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_status      on public.tasks(status);
create index if not exists idx_tasks_due_date    on public.tasks(due_date);
create index if not exists idx_projects_user_id  on public.projects(user_id);
