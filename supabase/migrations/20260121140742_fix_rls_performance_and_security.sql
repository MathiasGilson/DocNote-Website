/*
  # Fix RLS Performance and Security Issues

  1. RLS Policy Performance Optimization
    - Update all RLS policies on `files` table to use `(select auth.uid())` 
      instead of `auth.uid()` for better query performance at scale
    - This prevents re-evaluation of auth functions for each row

  2. Unused Indexes Cleanup
    - Drop unused index `idx_files_user_id`
    - Drop unused index `idx_files_created_at`

  3. Function Security Fix
    - Recreate `update_updated_at_column` function with immutable search_path
    - Sets search_path to empty string to prevent search_path injection attacks

  4. Notes
    - Auth DB Connection Strategy is a Supabase configuration setting 
      that must be changed in the Supabase Dashboard, not via migrations
*/

DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can upload own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;

CREATE POLICY "Users can view own files"
  ON files
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can upload own files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own files"
  ON files
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP INDEX IF EXISTS idx_files_user_id;
DROP INDEX IF EXISTS idx_files_created_at;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;