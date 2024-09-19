-- Create the avatar-image bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatar-image', 'avatar-image', false)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the avatar-image bucket
CREATE POLICY "Allow authenticated users to select their own avatar"
ON storage.objects FOR SELECT
USING (auth.uid() = owner);

CREATE POLICY "Allow authenticated users to insert their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'avatar-image' AND
  (LOWER(storage.extension(name)) = 'jpg' OR
   LOWER(storage.extension(name)) = 'jpeg' OR
   LOWER(storage.extension(name)) = 'png' OR
   LOWER(storage.extension(name)) = 'gif' OR
   LOWER(storage.extension(name)) = 'webp')
);

CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE
USING (auth.uid() = owner AND bucket_id = 'avatar-image')
WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'avatar-image' AND
  (LOWER(storage.extension(name)) = 'jpg' OR
   LOWER(storage.extension(name)) = 'jpeg' OR
   LOWER(storage.extension(name)) = 'png' OR
   LOWER(storage.extension(name)) = 'gif' OR
   LOWER(storage.extension(name)) = 'webp')
);

CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE
USING (auth.uid() = owner AND bucket_id = 'avatar-image');