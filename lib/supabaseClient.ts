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

export async function insertFileUpload(fileData: FileUploadData) {
  const { data, error } = await supabase
    .from('file_uploads')
    .insert(fileData)
    .select();

  if (error) throw error;
  return data;
}