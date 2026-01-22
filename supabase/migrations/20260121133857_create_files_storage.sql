/*
  # Create Files Storage System

  1. New Tables
    - `files`
      - `id` (uuid, primary key) - Unique identifier for each file
      - `user_id` (uuid) - Reference to the user who uploaded the file
      - `filename` (text) - Original filename
      - `storage_path` (text) - Path in Supabase Storage bucket
      - `file_type` (text) - MIME type of the file
      - `file_size` (bigint) - Size in bytes
      - `created_at` (timestamptz) - Upload timestamp
      - `updated_at` (timestamptz) - Last modification timestamp

  2. Security
    - Enable RLS on `files` table
    - Add policy for authenticated users to read their own files
    - Add policy for authenticated users to insert their own files
    - Add policy for authenticated users to update their own files
    - Add policy for authenticated users to delete their own files

  3. Indexes
    - Index on user_id for faster queries by user
    - Index on created_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_type text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files"
  ON files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();