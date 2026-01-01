-- Add preset_id column to track contractor overrides of preset materials
-- When preset_id is set, this is a contractor's override of a preset (not deletable)
-- When preset_id is NULL and contractor_id is set, this is a fully custom material (deletable)

-- Add preset_id column
ALTER TABLE contractor_materials
ADD COLUMN IF NOT EXISTS preset_id UUID REFERENCES contractor_materials(id) ON DELETE SET NULL;

-- Add index for looking up overrides
CREATE INDEX IF NOT EXISTS idx_contractor_materials_preset_override
ON contractor_materials(contractor_id, preset_id) WHERE preset_id IS NOT NULL;

-- Update delete policy to prevent deleting preset overrides
DROP POLICY IF EXISTS "Users can delete own materials" ON contractor_materials;

-- Users can only delete their own CUSTOM materials (not preset overrides)
CREATE POLICY "Users can delete own custom materials" ON contractor_materials
  FOR DELETE USING (
    auth.uid() = contractor_id
    AND preset_id IS NULL  -- Can't delete preset overrides, only custom materials
  );

COMMENT ON COLUMN contractor_materials.preset_id IS 'If set, this is a contractor override of the referenced preset material. Overrides cannot be deleted, only have their price edited.';
