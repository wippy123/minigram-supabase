-- Migration: Update tasks table to include team_id, assigned_user_id, and followers

-- Check if the tasks table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Add team_id column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'team_id') THEN
            ALTER TABLE tasks ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
        END IF;

        -- Add assigned_user_id column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_user_id') THEN
            ALTER TABLE tasks ADD COLUMN assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;

        -- Add followers column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'followers') THEN
            ALTER TABLE tasks ADD COLUMN followers UUID[];
        END IF;
    END IF;
END $$;