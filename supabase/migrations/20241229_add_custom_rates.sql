-- Add custom_rates JSONB column to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS custom_rates JSONB DEFAULT NULL;

-- Example structure for custom_rates:
-- {
--   "drywall_finishing": {
--     "sqft_standard": 0.50,
--     "sqft_premium": 0.90,
--     "linear_joints": 1.35,
--     "linear_corners": 4.35
--   }
-- }

COMMENT ON COLUMN profiles.custom_rates IS 'Custom pricing rates per trade type (JSONB)';
