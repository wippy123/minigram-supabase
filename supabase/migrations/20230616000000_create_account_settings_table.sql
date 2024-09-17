CREATE TABLE account_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  bio TEXT,
  theme VARCHAR(10) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function before each update
CREATE TRIGGER update_account_settings_updated_at
BEFORE UPDATE ON account_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert a row for each existing user
INSERT INTO account_settings (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Create a trigger to automatically create account settings for new users
CREATE OR REPLACE FUNCTION create_account_settings_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.account_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_account_settings_after_user_creation
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_account_settings_for_new_user();