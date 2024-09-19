
-- Rename the trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_account_settings_updated_at') THEN
    ALTER TRIGGER update_account_settings_updated_at
    ON profile_settings RENAME TO update_profile_settings_updated_at;
  END IF;
END $$;
ON profile_settings RENAME TO update_profile_settings_updated_at;

-- Update the function name in the create_account_settings_for_new_user function
CREATE OR REPLACE FUNCTION create_profile_settings_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old trigger
DROP TRIGGER IF EXISTS create_account_settings_after_user_creation ON auth.users;

-- Create the new trigger with the updated function name
CREATE TRIGGER create_profile_settings_after_user_creation
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_settings_for_new_user();

-- Drop the old function
DROP FUNCTION IF EXISTS create_account_settings_for_new_user();