-- Create the avatar-image bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-image', 'avatar-image', false)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to avatar-image bucket
CREATE POLICY "Allow public read access on avatar-image bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'avatar-image');

-- Allow authenticated users to upload avatar images
CREATE POLICY "Allow authenticated users to upload avatar images" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  bucket_id = 'avatar-image'
);

-- Allow users to update and delete their own avatar images
CREATE POLICY "Allow users to update and delete their own avatar images" ON storage.objects
FOR UPDATE USING (
  auth.uid() = owner AND
  bucket_id = 'avatar-image'
) WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'avatar-image'
);

CREATE POLICY "Allow users to delete their own avatar images" ON storage.objects
FOR DELETE USING (
  auth.uid() = owner AND
  bucket_id = 'avatar-image'
);