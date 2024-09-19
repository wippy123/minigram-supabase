-- Add avatar_url column to profile_settings table
ALTER TABLE profile_settings
ADD COLUMN IF NOT EXISTS avatar_url TEXT;