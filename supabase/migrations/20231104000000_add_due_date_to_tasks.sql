-- Migration: Add due_date column to tasks table

-- Add due_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'due_date') THEN
        ALTER TABLE tasks ADD COLUMN due_date DATE;
    END IF;
END $$;