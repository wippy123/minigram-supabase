-- Create the minigram-gen-images bucket as public
INSERT INTO storage.buckets (id, name, public)
VALUES ('minigram-gen-images', 'minigram-gen-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the minigram-gen-images bucket
CREATE POLICY "Allow public read access to minigram-gen-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'minigram-gen-images');

CREATE POLICY "Allow authenticated users to insert their own minigram-gen-images"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'minigram-gen-images' AND
  (LOWER(storage.extension(name)) = 'jpg' OR
   LOWER(storage.extension(name)) = 'jpeg' OR
   LOWER(storage.extension(name)) = 'png' OR
   LOWER(storage.extension(name)) = 'gif' OR
   LOWER(storage.extension(name)) = 'webp')
);

CREATE POLICY "Allow authenticated users to update their own minigram-gen-images"
ON storage.objects FOR UPDATE
USING (auth.uid() = owner AND bucket_id = 'minigram-gen-images')
WITH CHECK (
  auth.uid() = owner AND
  bucket_id = 'minigram-gen-images' AND
  (LOWER(storage.extension(name)) = 'jpg' OR
   LOWER(storage.extension(name)) = 'jpeg' OR
   LOWER(storage.extension(name)) = 'png' OR
   LOWER(storage.extension(name)) = 'gif' OR
   LOWER(storage.extension(name)) = 'webp')
);

CREATE POLICY "Allow authenticated users to delete their own minigram-gen-images"
ON storage.objects FOR DELETE
USING (auth.uid() = owner AND bucket_id = 'minigram-gen-images');
