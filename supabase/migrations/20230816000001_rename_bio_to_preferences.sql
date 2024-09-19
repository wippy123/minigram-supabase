-- Rename bio column to preferences in profile_settings table
ALTER TABLE profile_settings RENAME COLUMN bio TO preferences;