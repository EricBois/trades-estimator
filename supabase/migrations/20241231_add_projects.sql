-- Migration: Add multi-trade projects support
-- This migration adds tables for grouping multiple trade estimates into projects

-- Projects table - groups multiple trade estimates
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  homeowner_name TEXT NOT NULL,
  homeowner_email TEXT NOT NULL,
  homeowner_phone TEXT,
  project_description TEXT,
  status TEXT DEFAULT 'draft',
  range_low NUMERIC DEFAULT 0,
  range_high NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ
);

-- Project rooms - shared room data across all trades
CREATE TABLE project_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shape TEXT DEFAULT 'rectangular',
  length_feet INTEGER DEFAULT 0,
  length_inches INTEGER DEFAULT 0,
  width_feet INTEGER DEFAULT 0,
  width_inches INTEGER DEFAULT 0,
  height_feet INTEGER DEFAULT 8,
  height_inches INTEGER DEFAULT 0,
  l_shape_dimensions JSONB,
  custom_walls JSONB DEFAULT '[]',
  custom_ceiling_sqft NUMERIC,
  doors JSONB DEFAULT '[]',
  windows JSONB DEFAULT '[]',
  wall_sqft NUMERIC DEFAULT 0,
  ceiling_sqft NUMERIC DEFAULT 0,
  openings_sqft NUMERIC DEFAULT 0,
  total_sqft NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project trades - trade configurations per project
CREATE TABLE project_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trade_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  parameters JSONB,
  range_low NUMERIC DEFAULT 0,
  range_high NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, trade_type)
);

-- Project room overrides - per-trade room adjustments
CREATE TABLE project_room_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_room_id UUID NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
  trade_type TEXT NOT NULL,
  include_ceiling BOOLEAN,
  include_walls BOOLEAN DEFAULT true,
  excluded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_room_id, trade_type)
);

-- Add project_id to estimates table
ALTER TABLE estimates ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_projects_contractor_id ON projects(contractor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_rooms_project_id ON project_rooms(project_id);
CREATE INDEX idx_project_trades_project_id ON project_trades(project_id);
CREATE INDEX idx_project_room_overrides_room_id ON project_room_overrides(project_room_id);
CREATE INDEX idx_estimates_project_id ON estimates(project_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_room_overrides ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (contractor_id = auth.uid());

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (contractor_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (contractor_id = auth.uid());

-- RLS policies for project_rooms (through project ownership)
CREATE POLICY "Users can view rooms of their projects"
  ON project_rooms FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

CREATE POLICY "Users can create rooms in their projects"
  ON project_rooms FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

CREATE POLICY "Users can update rooms in their projects"
  ON project_rooms FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

CREATE POLICY "Users can delete rooms in their projects"
  ON project_rooms FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

-- RLS policies for project_trades
CREATE POLICY "Users can view trades of their projects"
  ON project_trades FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

CREATE POLICY "Users can create trades in their projects"
  ON project_trades FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

CREATE POLICY "Users can update trades in their projects"
  ON project_trades FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

CREATE POLICY "Users can delete trades in their projects"
  ON project_trades FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE contractor_id = auth.uid()));

-- RLS policies for project_room_overrides
CREATE POLICY "Users can view overrides of their project rooms"
  ON project_room_overrides FOR SELECT
  USING (project_room_id IN (
    SELECT pr.id FROM project_rooms pr
    JOIN projects p ON pr.project_id = p.id
    WHERE p.contractor_id = auth.uid()
  ));

CREATE POLICY "Users can create overrides in their project rooms"
  ON project_room_overrides FOR INSERT
  WITH CHECK (project_room_id IN (
    SELECT pr.id FROM project_rooms pr
    JOIN projects p ON pr.project_id = p.id
    WHERE p.contractor_id = auth.uid()
  ));

CREATE POLICY "Users can update overrides in their project rooms"
  ON project_room_overrides FOR UPDATE
  USING (project_room_id IN (
    SELECT pr.id FROM project_rooms pr
    JOIN projects p ON pr.project_id = p.id
    WHERE p.contractor_id = auth.uid()
  ));

CREATE POLICY "Users can delete overrides in their project rooms"
  ON project_room_overrides FOR DELETE
  USING (project_room_id IN (
    SELECT pr.id FROM project_rooms pr
    JOIN projects p ON pr.project_id = p.id
    WHERE p.contractor_id = auth.uid()
  ));
