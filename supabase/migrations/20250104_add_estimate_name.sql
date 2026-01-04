-- Add name column to estimates table for naming regular estimates
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS name TEXT;

-- Create index for searching by name
CREATE INDEX IF NOT EXISTS idx_estimates_name ON estimates(name);
