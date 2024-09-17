-- Remove RLS if it was previously enabled
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Remove the policy if it exists
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

-- Add any other modifications you want to make to the notifications table here
-- For example, if you want to add a new column:
-- ALTER TABLE notifications ADD COLUMN priority TEXT;