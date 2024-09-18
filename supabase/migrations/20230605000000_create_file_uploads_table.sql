-- Create file_uploads table
CREATE TABLE public.file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id BIGINT REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on the file_uploads table
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for file_uploads table
CREATE POLICY "Allow users to insert their own file_uploads" ON public.file_uploads
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to select their own file_uploads" ON public.file_uploads
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own file_uploads" ON public.file_uploads
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own file_uploads" ON public.file_uploads
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Add file_count column to tasks table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'file_count') THEN
        ALTER TABLE public.tasks ADD COLUMN file_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add due_date and assigned_user_id columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN due_date DATE,
ADD COLUMN assigned_user_id UUID REFERENCES auth.users(id);

-- Create function to update file_count
CREATE OR REPLACE FUNCTION update_task_file_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tasks SET file_count = file_count + 1 WHERE id = NEW.task_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tasks SET file_count = file_count - 1 WHERE id = OLD.task_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update file_count
CREATE TRIGGER update_task_file_count_trigger
AFTER INSERT OR DELETE ON file_uploads
FOR EACH ROW EXECUTE FUNCTION update_task_file_count();