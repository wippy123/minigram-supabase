-- Rename account_settings table to profile_settings
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account_settings') THEN
    ALTER TABLE account_settings RENAME TO profile_settings;
  END IF;
END $$;