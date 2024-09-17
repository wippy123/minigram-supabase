-- Add role column to team_members table
ALTER TABLE team_members
ADD COLUMN role TEXT NOT NULL DEFAULT 'contributor';

-- Create an enum type for roles
CREATE TYPE team_member_role AS ENUM ('admin', 'contributor');

-- Add a temporary column with the new type
ALTER TABLE team_members
ADD COLUMN role_enum team_member_role;

-- Update the temporary column based on the existing role column
UPDATE team_members
SET role_enum = CASE
    WHEN role = 'admin' THEN 'admin'::team_member_role
    ELSE 'contributor'::team_member_role
END;

-- Drop the old role column
ALTER TABLE team_members
DROP COLUMN role;

-- Rename the new column to 'role'
ALTER TABLE team_members
RENAME COLUMN role_enum TO role;

-- Set the default value for the new role column
ALTER TABLE team_members
ALTER COLUMN role SET DEFAULT 'contributor'::team_member_role;