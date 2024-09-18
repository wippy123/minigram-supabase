-- Migration: Add status and not_urgent columns to tasks table

-- Create ENUM type for task status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled');
    END IF;
END$$;

-- Add status column to tasks table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        ALTER TABLE tasks ADD COLUMN status task_status NOT NULL DEFAULT 'Pending';
    END IF;
END$$;

-- Add not_urgent column to tasks table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'not_urgent') THEN
        ALTER TABLE tasks ADD COLUMN not_urgent BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END$$;

-- Create index on status column for better query performance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_status') THEN
        CREATE INDEX idx_tasks_status ON tasks(status);
    END IF;
END$$;

-- Create index on not_urgent column for better query performance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_not_urgent') THEN
        CREATE INDEX idx_tasks_not_urgent ON tasks(not_urgent);
    END IF;
END$$;

-- Update RLS policies to include new columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can view their team''s tasks status and urgency') THEN
            CREATE POLICY "Users can view their team's tasks status and urgency" ON tasks
                FOR SELECT
                USING (
                    auth.uid() IN (
                        SELECT member_id FROM team_members WHERE team_id = tasks.team_id
                    )
                );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can update their team''s tasks status and urgency') THEN
            CREATE POLICY "Users can update their team's tasks status and urgency" ON tasks
                FOR UPDATE
                USING (
                    auth.uid() IN (
                        SELECT member_id FROM team_members WHERE team_id = tasks.team_id
                    )
                );
        END IF;
    END IF;
END$$;