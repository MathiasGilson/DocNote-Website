/*
  # Create Files Storage Bucket

  1. Storage Setup
    - Creates a private 'files' bucket for user file uploads
    - Maximum file size: 50MB

  2. Security Policies
    - Authenticated users can upload files to their own folder (user_id prefix)
    - Authenticated users can view/download their own files
    - Authenticated users can update their own files
    - Authenticated users can delete their own files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('files', 'files', false, 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'files' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );