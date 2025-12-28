-- Add pricing_model column to estimate_templates table
-- This allows templates to specify how they should be priced

ALTER TABLE estimate_templates
ADD COLUMN pricing_model text DEFAULT 'hourly' CHECK (pricing_model IN ('hourly', 'per_sqft', 'per_linear_ft', 'custom'));

-- Add comment to explain the column
COMMENT ON COLUMN estimate_templates.pricing_model IS 'Pricing method: hourly (time-based), per_sqft (square footage), per_linear_ft (linear footage), or custom (mixed/other)';

-- Add unit_price column for per-unit pricing models
ALTER TABLE estimate_templates
ADD COLUMN unit_price numeric DEFAULT 0;

COMMENT ON COLUMN estimate_templates.unit_price IS 'Price per unit (per sqft, per linear ft, etc.) - used when pricing_model is not hourly';
