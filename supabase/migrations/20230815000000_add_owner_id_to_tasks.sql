-- Add owner_id column to tasks table
ALTER TABLE tasks ADD COLUMN owner_id UUID;

-- Add foreign key constraint
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_owner
FOREIGN KEY (owner_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create an index on owner_id for better query performance
CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);


-- Make owner_id NOT NULL after updating existing rows
ALTER TABLE tasks ALTER COLUMN owner_id SET NOT NULL;