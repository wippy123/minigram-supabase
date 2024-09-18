import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FileUploadData {
  task_id: number;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
}

export interface TaskData {
  title: string;
  description: string;
  team_id: string;
  due_date: string | null;
  assigned_user_id: string | null;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  not_urgent: boolean;
}

export async function insertFileUpload(fileData: FileUploadData) {
  const { data, error } = await supabase
    .from('file_uploads')
    .insert(fileData)
    .select();

  if (error) throw error;
  return data;
}

export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from('members')
    .select('id, user_id, users:auth.users(id, email)')
    .eq('team_id', teamId);

  if (error) throw error;
  return data;
}