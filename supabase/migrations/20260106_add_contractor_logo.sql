-- Add logo_url column to profiles table for contractor branding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for contractor logos if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('contractor-logos', 'contractor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for logo storage
CREATE POLICY "Users can upload their own logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contractor-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'contractor-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contractor-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Logos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'contractor-logos');
