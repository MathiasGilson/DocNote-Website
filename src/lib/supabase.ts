import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type FileRecord = {
  id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
};
