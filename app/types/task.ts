export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  due_time: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}