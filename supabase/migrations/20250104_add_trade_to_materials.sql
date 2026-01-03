-- Add trade column to contractor_materials for organizing materials by trade
-- Each material belongs to a specific trade with trade-specific categories

-- Add trade column (nullable initially for migration)
ALTER TABLE contractor_materials
ADD COLUMN IF NOT EXISTS trade TEXT;

-- Update existing materials to drywall_finishing (all current presets are for finishing)
UPDATE contractor_materials SET trade = 'drywall_finishing' WHERE trade IS NULL;

-- Add check constraint for valid trades
ALTER TABLE contractor_materials
ADD CONSTRAINT contractor_materials_trade_check CHECK (trade IN (
  'drywall_finishing',
  'drywall_hanging',
  'painting',
  'framing'
));

-- Make trade NOT NULL after setting defaults
ALTER TABLE contractor_materials
ALTER COLUMN trade SET NOT NULL;

-- Add index for trade filtering
CREATE INDEX IF NOT EXISTS idx_contractor_materials_trade ON contractor_materials(trade);

-- Update category constraint to include new categories for all trades
ALTER TABLE contractor_materials DROP CONSTRAINT IF EXISTS contractor_materials_category_check;
ALTER TABLE contractor_materials
ADD CONSTRAINT contractor_materials_category_check CHECK (category IN (
  -- Drywall Finishing categories
  'mud', 'tape', 'corner_bead', 'primer', 'other',
  -- Drywall Hanging categories
  'board', 'fastener', 'trim', 'insulation',
  -- Painting categories
  'paint', 'supplies',
  -- Framing categories
  'lumber', 'hardware'
));

-- Seed Drywall Hanging preset materials
INSERT INTO contractor_materials (id, contractor_id, name, category, trade, unit, unit_size, base_price, description, is_active)
VALUES
  -- Boards
  ('00000000-0000-0001-0001-000000000001', NULL, 'Standard 1/2" Drywall (4x8)', 'board', 'drywall_hanging', 'sheet', '4x8 ft', 12.00, 'Standard gypsum board, 32 sqft', true),
  ('00000000-0000-0001-0001-000000000002', NULL, 'Standard 1/2" Drywall (4x10)', 'board', 'drywall_hanging', 'sheet', '4x10 ft', 15.00, 'Standard gypsum board, 40 sqft', true),
  ('00000000-0000-0001-0001-000000000003', NULL, 'Standard 1/2" Drywall (4x12)', 'board', 'drywall_hanging', 'sheet', '4x12 ft', 18.00, 'Standard gypsum board, 48 sqft', true),
  ('00000000-0000-0001-0001-000000000004', NULL, 'Standard 5/8" Drywall (4x8)', 'board', 'drywall_hanging', 'sheet', '4x8 ft', 14.00, 'Thicker board for ceilings, 32 sqft', true),
  ('00000000-0000-0001-0001-000000000005', NULL, 'Lightweight 1/2" Drywall (4x8)', 'board', 'drywall_hanging', 'sheet', '4x8 ft', 14.00, 'Easier to handle, 32 sqft', true),
  ('00000000-0000-0001-0001-000000000006', NULL, 'Moisture Resistant 1/2" (4x8)', 'board', 'drywall_hanging', 'sheet', '4x8 ft', 16.00, 'Green board for humid areas', true),
  ('00000000-0000-0001-0001-000000000007', NULL, 'Fire-Rated 5/8" Type X (4x8)', 'board', 'drywall_hanging', 'sheet', '4x8 ft', 18.00, '1-hour fire rating', true),
  ('00000000-0000-0001-0001-000000000008', NULL, 'Mold Resistant 1/2" (4x8)', 'board', 'drywall_hanging', 'sheet', '4x8 ft', 18.00, 'Purple board, mold resistant', true),

  -- Fasteners
  ('00000000-0000-0001-0002-000000000001', NULL, 'Drywall Screws 1-1/4"', 'fastener', 'drywall_hanging', 'box', '1 lb', 8.00, 'For 1/2" drywall', true),
  ('00000000-0000-0001-0002-000000000002', NULL, 'Drywall Screws 1-5/8"', 'fastener', 'drywall_hanging', 'box', '1 lb', 8.00, 'For 5/8" drywall', true),
  ('00000000-0000-0001-0002-000000000003', NULL, 'Drywall Screws 2"', 'fastener', 'drywall_hanging', 'box', '1 lb', 9.00, 'For double layer', true),

  -- Trim
  ('00000000-0000-0001-0003-000000000001', NULL, 'Metal Corner Bead', 'trim', 'drywall_hanging', 'piece', '8 ft', 3.50, 'Standard galvanized', true),
  ('00000000-0000-0001-0003-000000000002', NULL, 'Vinyl Corner Bead', 'trim', 'drywall_hanging', 'piece', '8 ft', 2.50, 'Won''t dent or rust', true),
  ('00000000-0000-0001-0003-000000000003', NULL, 'Paper-Faced Corner Bead', 'trim', 'drywall_hanging', 'piece', '8 ft', 4.00, 'Easy to finish', true),
  ('00000000-0000-0001-0003-000000000004', NULL, 'L-Bead Trim', 'trim', 'drywall_hanging', 'piece', '10 ft', 4.00, 'For exposed edges', true),
  ('00000000-0000-0001-0003-000000000005', NULL, 'J-Bead Trim', 'trim', 'drywall_hanging', 'piece', '10 ft', 3.50, 'For meeting other surfaces', true),

  -- Insulation
  ('00000000-0000-0001-0004-000000000001', NULL, 'R-13 Fiberglass Batt', 'insulation', 'drywall_hanging', 'roll', '40 sqft', 25.00, '3.5" thick for 2x4 walls', true),
  ('00000000-0000-0001-0004-000000000002', NULL, 'R-19 Fiberglass Batt', 'insulation', 'drywall_hanging', 'roll', '48 sqft', 35.00, '6.25" thick for 2x6 walls', true),
  ('00000000-0000-0001-0004-000000000003', NULL, 'Vapor Barrier 10x100', 'insulation', 'drywall_hanging', 'roll', '1000 sqft', 45.00, '6 mil poly sheeting', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  trade = EXCLUDED.trade,
  unit = EXCLUDED.unit,
  unit_size = EXCLUDED.unit_size,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description;

-- Seed Painting preset materials
INSERT INTO contractor_materials (id, contractor_id, name, category, trade, unit, unit_size, base_price, description, is_active)
VALUES
  -- Paint
  ('00000000-0000-0002-0001-000000000001', NULL, 'Interior Latex - Standard', 'paint', 'painting', 'gallon', NULL, 35.00, 'Builder grade, good coverage', true),
  ('00000000-0000-0002-0001-000000000002', NULL, 'Interior Latex - Premium', 'paint', 'painting', 'gallon', NULL, 55.00, 'Better coverage and durability', true),
  ('00000000-0000-0002-0001-000000000003', NULL, 'Interior Latex - Specialty', 'paint', 'painting', 'gallon', NULL, 75.00, 'Low-VOC, designer brands', true),
  ('00000000-0000-0002-0001-000000000004', NULL, 'Ceiling Paint - Flat White', 'paint', 'painting', 'gallon', NULL, 30.00, 'Ultra-flat finish', true),
  ('00000000-0000-0002-0001-000000000005', NULL, 'Exterior Latex - Standard', 'paint', 'painting', 'gallon', NULL, 40.00, 'Weather resistant', true),
  ('00000000-0000-0002-0001-000000000006', NULL, 'Exterior Latex - Premium', 'paint', 'painting', 'gallon', NULL, 65.00, 'Extended durability', true),
  ('00000000-0000-0002-0001-000000000007', NULL, 'Trim Paint - Semi-Gloss', 'paint', 'painting', 'quart', NULL, 18.00, 'For doors and trim', true),
  ('00000000-0000-0002-0001-000000000008', NULL, 'Cabinet Paint', 'paint', 'painting', 'quart', NULL, 25.00, 'Self-leveling, durable', true),

  -- Primer
  ('00000000-0000-0002-0002-000000000001', NULL, 'PVA Primer', 'primer', 'painting', 'gallon', NULL, 18.00, 'For new drywall', true),
  ('00000000-0000-0002-0002-000000000002', NULL, 'Stain-Blocking Primer', 'primer', 'painting', 'gallon', NULL, 45.00, 'Shellac-based, blocks stains', true),
  ('00000000-0000-0002-0002-000000000003', NULL, 'Bonding Primer', 'primer', 'painting', 'gallon', NULL, 35.00, 'For slick surfaces', true),
  ('00000000-0000-0002-0002-000000000004', NULL, 'Exterior Primer', 'primer', 'painting', 'gallon', NULL, 25.00, 'For exterior surfaces', true),

  -- Supplies
  ('00000000-0000-0002-0003-000000000001', NULL, 'Painter''s Tape 1.5"', 'supplies', 'painting', 'roll', '60 yd', 6.00, 'Blue tape, clean removal', true),
  ('00000000-0000-0002-0003-000000000002', NULL, 'Painter''s Tape 2"', 'supplies', 'painting', 'roll', '60 yd', 8.00, 'Blue tape, wider', true),
  ('00000000-0000-0002-0003-000000000003', NULL, 'Drop Cloth Canvas 9x12', 'supplies', 'painting', 'piece', NULL, 25.00, 'Reusable canvas', true),
  ('00000000-0000-0002-0003-000000000004', NULL, 'Drop Cloth Plastic 9x12', 'supplies', 'painting', 'piece', NULL, 5.00, 'Disposable plastic', true),
  ('00000000-0000-0002-0003-000000000005', NULL, 'Roller Cover 9" - 3/8"', 'supplies', 'painting', 'piece', NULL, 6.00, 'For smooth surfaces', true),
  ('00000000-0000-0002-0003-000000000006', NULL, 'Roller Cover 9" - 1/2"', 'supplies', 'painting', 'piece', NULL, 7.00, 'For semi-smooth', true),
  ('00000000-0000-0002-0003-000000000007', NULL, 'Roller Cover 9" - 3/4"', 'supplies', 'painting', 'piece', NULL, 8.00, 'For textured surfaces', true),
  ('00000000-0000-0002-0003-000000000008', NULL, 'Paint Brush 2.5" Angled', 'supplies', 'painting', 'piece', NULL, 12.00, 'For cutting in', true),
  ('00000000-0000-0002-0003-000000000009', NULL, 'Paint Brush 4" Flat', 'supplies', 'painting', 'piece', NULL, 15.00, 'For larger areas', true),
  ('00000000-0000-0002-0003-000000000010', NULL, 'Caulk - Paintable', 'supplies', 'painting', 'tube', '10 oz', 5.00, 'Acrylic latex', true),
  ('00000000-0000-0002-0003-000000000011', NULL, 'Wood Filler', 'supplies', 'painting', 'container', '8 oz', 8.00, 'For nail holes', true),
  ('00000000-0000-0002-0003-000000000012', NULL, 'Sandpaper 220-grit', 'supplies', 'painting', 'pack', '10 sheets', 8.00, 'For between coats', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  trade = EXCLUDED.trade,
  unit = EXCLUDED.unit,
  unit_size = EXCLUDED.unit_size,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description;

-- Seed Framing preset materials
INSERT INTO contractor_materials (id, contractor_id, name, category, trade, unit, unit_size, base_price, description, is_active)
VALUES
  -- Lumber
  ('00000000-0000-0003-0001-000000000001', NULL, '2x4x8 Stud', 'lumber', 'framing', 'piece', '8 ft', 4.50, 'Standard wall stud', true),
  ('00000000-0000-0003-0001-000000000002', NULL, '2x4x10 Stud', 'lumber', 'framing', 'piece', '10 ft', 6.00, 'Longer stud', true),
  ('00000000-0000-0003-0001-000000000003', NULL, '2x4x12', 'lumber', 'framing', 'piece', '12 ft', 7.50, 'For plates and blocking', true),
  ('00000000-0000-0003-0001-000000000004', NULL, '2x6x8 Stud', 'lumber', 'framing', 'piece', '8 ft', 7.00, 'Exterior wall stud', true),
  ('00000000-0000-0003-0001-000000000005', NULL, '2x6x10', 'lumber', 'framing', 'piece', '10 ft', 9.00, 'Longer 2x6', true),
  ('00000000-0000-0003-0001-000000000006', NULL, '2x6x12', 'lumber', 'framing', 'piece', '12 ft', 11.00, 'For headers/plates', true),
  ('00000000-0000-0003-0001-000000000007', NULL, '2x10x12', 'lumber', 'framing', 'piece', '12 ft', 18.00, 'For headers', true),
  ('00000000-0000-0003-0001-000000000008', NULL, '2x12x12', 'lumber', 'framing', 'piece', '12 ft', 24.00, 'For large headers', true),
  ('00000000-0000-0003-0001-000000000009', NULL, 'LVL Header 1-3/4x9-1/4', 'lumber', 'framing', 'linear ft', NULL, 12.00, 'Engineered lumber', true),
  ('00000000-0000-0003-0001-000000000010', NULL, 'LVL Header 1-3/4x11-7/8', 'lumber', 'framing', 'linear ft', NULL, 15.00, 'Larger engineered', true),
  ('00000000-0000-0003-0001-000000000011', NULL, 'Metal Stud 3-5/8"', 'lumber', 'framing', 'piece', '8 ft', 8.00, 'Steel framing', true),
  ('00000000-0000-0003-0001-000000000012', NULL, 'Metal Track 3-5/8"', 'lumber', 'framing', 'piece', '10 ft', 6.00, 'Steel track', true),

  -- Fasteners
  ('00000000-0000-0003-0002-000000000001', NULL, 'Framing Nails 3"', 'fastener', 'framing', 'box', '5 lb', 25.00, '16d common nails', true),
  ('00000000-0000-0003-0002-000000000002', NULL, 'Framing Nails 3-1/2"', 'fastener', 'framing', 'box', '5 lb', 28.00, '16d sinkers', true),
  ('00000000-0000-0003-0002-000000000003', NULL, 'Structural Screws 3"', 'fastener', 'framing', 'box', '100 ct', 35.00, 'GRK/Spax type', true),
  ('00000000-0000-0003-0002-000000000004', NULL, 'Structural Screws 4"', 'fastener', 'framing', 'box', '100 ct', 45.00, 'For headers', true),
  ('00000000-0000-0003-0002-000000000005', NULL, 'Lag Bolts 3/8x4"', 'fastener', 'framing', 'box', '25 ct', 20.00, 'Heavy duty', true),

  -- Hardware
  ('00000000-0000-0003-0003-000000000001', NULL, 'Joist Hanger 2x6', 'hardware', 'framing', 'piece', NULL, 2.50, 'Simpson LUS26', true),
  ('00000000-0000-0003-0003-000000000002', NULL, 'Joist Hanger 2x8', 'hardware', 'framing', 'piece', NULL, 3.00, 'Simpson LUS28', true),
  ('00000000-0000-0003-0003-000000000003', NULL, 'Joist Hanger 2x10', 'hardware', 'framing', 'piece', NULL, 3.50, 'Simpson LUS210', true),
  ('00000000-0000-0003-0003-000000000004', NULL, 'Hurricane Tie', 'hardware', 'framing', 'piece', NULL, 1.50, 'Simpson H2.5A', true),
  ('00000000-0000-0003-0003-000000000005', NULL, 'Angle Bracket', 'hardware', 'framing', 'piece', NULL, 2.00, 'For blocking', true),
  ('00000000-0000-0003-0003-000000000006', NULL, 'Post Base', 'hardware', 'framing', 'piece', NULL, 12.00, 'For post connections', true),
  ('00000000-0000-0003-0003-000000000007', NULL, 'Strap Tie 12"', 'hardware', 'framing', 'piece', NULL, 3.00, 'For double studs', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  trade = EXCLUDED.trade,
  unit = EXCLUDED.unit,
  unit_size = EXCLUDED.unit_size,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description;

COMMENT ON COLUMN contractor_materials.trade IS 'The trade this material belongs to: drywall_finishing, drywall_hanging, painting, framing';
