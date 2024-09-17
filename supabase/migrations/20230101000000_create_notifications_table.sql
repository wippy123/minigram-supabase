CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remove RLS
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Remove the policy (if it exists)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;