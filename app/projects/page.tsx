import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProjectsClient from './client';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('projects').select('*').eq('user_id', user.id).order('created_at'),
  ]);

  return (
    <ProjectsClient
      initialTasks={tasks ?? []}
      initialProjects={projects ?? []}
    />
  );
}
