-- Update contractor_materials to support preset (global) materials
-- Preset materials have contractor_id = NULL

-- Make contractor_id nullable for preset materials
ALTER TABLE contractor_materials
ALTER COLUMN contractor_id DROP NOT NULL;

-- Add index for preset materials lookup
CREATE INDEX IF NOT EXISTS idx_contractor_materials_presets
ON contractor_materials(category) WHERE contractor_id IS NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own materials" ON contractor_materials;
DROP POLICY IF EXISTS "Users can insert own materials" ON contractor_materials;
DROP POLICY IF EXISTS "Users can update own materials" ON contractor_materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON contractor_materials;

-- New policies that include preset materials (contractor_id IS NULL)

-- Users can view their own materials AND all preset materials
CREATE POLICY "Users can view materials" ON contractor_materials
  FOR SELECT USING (contractor_id IS NULL OR auth.uid() = contractor_id);

-- Users can only insert their own materials (not presets)
CREATE POLICY "Users can insert own materials" ON contractor_materials
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- Users can only update their own materials (not presets)
CREATE POLICY "Users can update own materials" ON contractor_materials
  FOR UPDATE USING (auth.uid() = contractor_id);

-- Users can only delete their own materials (not presets)
CREATE POLICY "Users can delete own materials" ON contractor_materials
  FOR DELETE USING (auth.uid() = contractor_id);

-- Seed preset materials (mud compounds)
INSERT INTO contractor_materials (id, contractor_id, name, category, unit, unit_size, base_price, description, is_active)
VALUES
  -- Mud/Compound
  ('00000000-0000-0000-0001-000000000001', NULL, 'All-Purpose (Green)', 'mud', 'bucket', '4.5 gal', 18.00, 'Standard pre-mixed compound for all coats', true),
  ('00000000-0000-0000-0001-000000000002', NULL, 'Lightweight (Blue)', 'mud', 'bucket', '4.5 gal', 22.00, 'Easier to sand, less shrinkage', true),
  ('00000000-0000-0000-0001-000000000003', NULL, 'Topping Compound', 'mud', 'bucket', '4.5 gal', 20.00, 'Final coat only, ultra-smooth', true),
  ('00000000-0000-0000-0001-000000000004', NULL, 'Hot Mud 20', 'mud', 'bag', '18 lb', 12.00, 'Setting compound, 20-min working time', true),
  ('00000000-0000-0000-0001-000000000005', NULL, 'Hot Mud 45', 'mud', 'bag', '18 lb', 12.00, 'Setting compound, 45-min working time', true),
  ('00000000-0000-0000-0001-000000000006', NULL, 'Hot Mud 90', 'mud', 'bag', '18 lb', 12.00, 'Setting compound, 90-min working time', true),

  -- Tape
  ('00000000-0000-0000-0002-000000000001', NULL, 'Paper Tape', 'tape', 'roll', '500 ft', 5.50, 'Standard paper drywall tape', true),
  ('00000000-0000-0000-0002-000000000002', NULL, 'Mesh Tape (Self-Adhesive)', 'tape', 'roll', '300 ft', 8.00, 'Fiberglass mesh, easy to apply', true),
  ('00000000-0000-0000-0002-000000000003', NULL, 'Paper-Faced Metal Tape', 'tape', 'roll', '100 ft', 15.00, 'For inside corners, metal reinforced', true),

  -- Corner Bead
  ('00000000-0000-0000-0003-000000000001', NULL, 'Metal Corner Bead', 'corner_bead', 'piece', '8 ft', 3.50, 'Standard galvanized steel, nail-on', true),
  ('00000000-0000-0000-0003-000000000002', NULL, 'Vinyl Corner Bead', 'corner_bead', 'piece', '8 ft', 2.50, 'Plastic, won''t dent or rust', true),
  ('00000000-0000-0000-0003-000000000003', NULL, 'Paper-Faced Corner Bead', 'corner_bead', 'piece', '8 ft', 4.00, 'Easy to finish, no nail pops', true),
  ('00000000-0000-0000-0003-000000000004', NULL, 'Bullnose Corner Bead', 'corner_bead', 'piece', '8 ft', 5.50, 'Rounded corner profile', true),
  ('00000000-0000-0000-0003-000000000005', NULL, 'L-Bead (Trim)', 'corner_bead', 'piece', '10 ft', 4.00, 'Edge trim for exposed drywall edges', true),
  ('00000000-0000-0000-0003-000000000006', NULL, 'J-Bead (Trim)', 'corner_bead', 'piece', '10 ft', 3.50, 'Trim for drywall meeting other surfaces', true),

  -- Other materials
  ('00000000-0000-0000-0004-000000000001', NULL, 'PVA Primer', 'other', 'gallon', NULL, 14.00, 'Drywall primer, seals mud', true),
  ('00000000-0000-0000-0004-000000000002', NULL, 'Shellac Primer', 'other', 'gallon', NULL, 45.00, 'Stain-blocking primer', true),
  ('00000000-0000-0000-0004-000000000003', NULL, 'Sandpaper 120-grit', 'other', 'pack', '25 sheets', 12.00, 'For first sanding pass', true),
  ('00000000-0000-0000-0004-000000000004', NULL, 'Sandpaper 150-grit', 'other', 'pack', '25 sheets', 12.00, 'For final sanding', true),
  ('00000000-0000-0000-0004-000000000005', NULL, 'Sanding Sponge', 'other', 'piece', NULL, 4.50, 'For detail sanding', true),
  ('00000000-0000-0000-0004-000000000006', NULL, 'Spray Texture', 'other', 'can', '20 oz', 12.00, 'Aerosol texture for patches', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  unit_size = EXCLUDED.unit_size,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description;

COMMENT ON TABLE contractor_materials IS 'Materials for estimates. contractor_id=NULL means preset/global material, otherwise contractor-specific.';
