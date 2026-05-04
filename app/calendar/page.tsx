import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CalendarClient from './client';

export default async function CalendarPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at'),
  ]);

  return <CalendarClient initialTasks={tasks ?? []} initialProjects={projects ?? []} />;
}
