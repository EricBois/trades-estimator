-- Migration: Add clients table for client management
-- Clients belong to contractors and can be linked to estimates and projects

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  -- Address fields
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  -- Additional info
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add client_id to estimates (nullable for backwards compatibility)
ALTER TABLE estimates ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Add client_id to projects (nullable for backwards compatibility)
ALTER TABLE projects ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_clients_contractor_id ON clients(contractor_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_estimates_client_id ON estimates(client_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for clients
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (contractor_id = auth.uid());

CREATE POLICY "Users can create their own clients"
  ON clients FOR INSERT
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (contractor_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (contractor_id = auth.uid());
