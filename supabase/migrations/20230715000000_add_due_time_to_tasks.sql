-- Add due_time column to tasks table
ALTER TABLE tasks ADD COLUMN due_time TIME;

-- Update existing rows to set a default value (optional)
-- Uncomment the following line if you want to set a default value for existing rows
-- UPDATE tasks SET due_time = '00:00:00' WHERE due_time IS NULL;

-- Add any necessary indexes or constraints
-- For example, if you want to ensure that due_time is always set:
-- ALTER TABLE tasks ALTER COLUMN due_time SET NOT NULL;