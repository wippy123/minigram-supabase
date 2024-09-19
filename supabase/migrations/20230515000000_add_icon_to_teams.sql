-- Add icon column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS icon TEXT;

-- Update existing teams with a default icon
UPDATE teams SET icon = 'UserGroup' WHERE icon IS NULL;