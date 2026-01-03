-- Fix RLS delete policy for contractor_materials
-- Run this if delete is being blocked even when user owns the material

-- Drop and recreate the delete policy
DROP POLICY IF EXISTS "Users can delete own materials" ON contractor_materials;

CREATE POLICY "Users can delete own materials" ON contractor_materials
  FOR DELETE USING (auth.uid() = contractor_id);

-- Verify the policy was created
-- SELECT * FROM pg_policies WHERE tablename = 'contractor_materials';
