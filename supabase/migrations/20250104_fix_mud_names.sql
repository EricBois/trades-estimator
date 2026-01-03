-- Fix joint compound names - remove color references
-- These should be named by type, not by lid color

UPDATE contractor_materials
SET name = 'All-Purpose'
WHERE id = '00000000-0000-0000-0001-000000000001';

UPDATE contractor_materials
SET name = 'Lightweight All-Purpose'
WHERE id = '00000000-0000-0000-0001-000000000002';

-- Rename Topping to Finishing Compound
UPDATE contractor_materials
SET name = 'Finishing Compound',
    description = 'For final coat, smooth finish'
WHERE id = '00000000-0000-0000-0001-000000000003';

-- Add Topping Compound as a separate material
INSERT INTO contractor_materials (id, contractor_id, name, category, trade, unit, unit_size, base_price, description, is_active)
VALUES ('00000000-0000-0000-0001-000000000007', NULL, 'Topping Compound', 'mud', 'drywall_finishing', 'bucket', '4.5 gal', 20.00, 'Ultra-smooth final coat', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  trade = EXCLUDED.trade,
  unit = EXCLUDED.unit,
  unit_size = EXCLUDED.unit_size,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description;
