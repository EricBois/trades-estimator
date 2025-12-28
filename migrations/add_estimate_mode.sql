-- Add estimate_mode column to estimates table
-- This migration adds support for ballpark vs exact estimate modes

-- Add the estimate_mode column with default value of 'ballpark'
ALTER TABLE estimates
ADD COLUMN estimate_mode text DEFAULT 'ballpark' CHECK (estimate_mode IN ('ballpark', 'exact'));

-- Add comment to explain the column
COMMENT ON COLUMN estimates.estimate_mode IS 'Determines the precision level: ballpark (wider range ±25%) or exact (narrow range ±10%)';
