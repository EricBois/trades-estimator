-- Add contractor_materials table for custom materials
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contractor_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mud', 'tape', 'corner_bead', 'primer', 'other')),
  unit TEXT NOT NULL,
  unit_size TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by contractor
CREATE INDEX IF NOT EXISTS idx_contractor_materials_contractor
ON contractor_materials(contractor_id);

-- Index for active materials lookup
CREATE INDEX IF NOT EXISTS idx_contractor_materials_active
ON contractor_materials(contractor_id, is_active);

-- Row-level security
ALTER TABLE contractor_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own materials
CREATE POLICY "Users can view own materials" ON contractor_materials
  FOR SELECT USING (auth.uid() = contractor_id);

-- Policy: Users can insert their own materials
CREATE POLICY "Users can insert own materials" ON contractor_materials
  FOR INSERT WITH CHECK (auth.uid() = contractor_id);

-- Policy: Users can update their own materials
CREATE POLICY "Users can update own materials" ON contractor_materials
  FOR UPDATE USING (auth.uid() = contractor_id);

-- Policy: Users can delete their own materials
CREATE POLICY "Users can delete own materials" ON contractor_materials
  FOR DELETE USING (auth.uid() = contractor_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_contractor_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contractor_materials_updated_at
  BEFORE UPDATE ON contractor_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_contractor_materials_updated_at();

COMMENT ON TABLE contractor_materials IS 'Custom materials added by contractors for use in estimates';
COMMENT ON COLUMN contractor_materials.category IS 'Material category: mud, tape, corner_bead, primer, other';
COMMENT ON COLUMN contractor_materials.unit IS 'Unit of measurement (e.g., box, roll, gallon)';
COMMENT ON COLUMN contractor_materials.unit_size IS 'Optional size description (e.g., 4.5 gal, 500 ft)';
