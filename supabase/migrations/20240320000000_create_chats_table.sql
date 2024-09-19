-- Create Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL,
  task_id UUID NOT NULL,
  participants UUID[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint
ALTER TABLE chats
  ADD CONSTRAINT fk_chats_task
  FOREIGN KEY (task_id)
  REFERENCES tasks(id)
  ON DELETE CASCADE;

-- Create index on task_id for faster lookups
CREATE INDEX idx_chats_task_id ON chats(task_id);

-- Create index on channel_id for faster lookups
CREATE INDEX idx_chats_channel_id ON chats(channel_id);

-- Add trigger to update the updated_at column
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON chats
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();