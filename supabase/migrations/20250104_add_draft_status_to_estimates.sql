-- Add 'draft' to the estimates status check constraint
-- First drop the existing constraint, then recreate with 'draft' included
ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_status_check;

ALTER TABLE estimates ADD CONSTRAINT estimates_status_check
  CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'declined'));
