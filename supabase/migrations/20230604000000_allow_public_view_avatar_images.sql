-- Make the avatar-image bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'avatar-image';

-- Drop the existing policy for public read access
DROP POLICY IF EXISTS "Allow public read access on avatar-image bucket" ON storage.objects;

-- Create a new policy to allow anyone to view avatar images
CREATE POLICY "Allow public view access on avatar-image bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'avatar-image');

-- Ensure authenticated users can still upload avatar images
DROP POLICY IF EXISTS "Allow authenticated users to upload avatar images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload avatar images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatar-image'
);

-- Ensure users can still update and delete their own avatar images
DROP POLICY IF EXISTS "Allow users to update and delete their own avatar images" ON storage.objects;
CREATE POLICY "Allow users to update their own avatar images" ON storage.objects
FOR UPDATE USING (
  auth.uid() = owner AND
  bucket_id = 'avatar-image'
) WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'avatar-image'
);

DROP POLICY IF EXISTS "Allow users to delete their own avatar images" ON storage.objects;
CREATE POLICY "Allow users to delete their own avatar images" ON storage.objects
FOR DELETE USING (
  auth.uid() = owner AND
  bucket_id = 'avatar-image'
);