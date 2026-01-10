"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Project, ProjectStatus } from "@/lib/project/types";
import { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

const supabase = createClient();

// Convert database row to Project
function toProject(row: Tables<"projects">): Project {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_id,
    name: row.name,
    homeownerName: row.homeowner_name,
    homeownerEmail: row.homeowner_email,
    homeownerPhone: row.homeowner_phone,
    projectDescription: row.project_description,
    status: (row.status ?? "draft") as ProjectStatus,
    rangeLow: row.range_low ?? 0,
    rangeHigh: row.range_high ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    expiresAt: row.expires_at,
    viewedAt: row.viewed_at,
  };
}

// Input for creating a project
export interface CreateProjectInput {
  contractorId: string;
  clientId?: string;
  name: string;
  homeownerName?: string;
  homeownerEmail?: string;
  homeownerPhone?: string;
  projectDescription?: string;
}

// Input for updating a project
export interface UpdateProjectInput {
  id: string;
  clientId?: string;
  name?: string;
  homeownerName?: string;
  homeownerEmail?: string;
  homeownerPhone?: string | null;
  projectDescription?: string | null;
  status?: ProjectStatus;
  rangeLow?: number;
  rangeHigh?: number;
  expiresAt?: string | null;
}

// Fetch all projects for a contractor
export function useProjects(contractorId: string | undefined) {
  return useQuery({
    queryKey: ["projects", contractorId],
    queryFn: async () => {
      if (!contractorId) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("contractor_id", contractorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []).map(toProject);
    },
    enabled: !!contractorId,
  });
}

// Fetch a single project by ID
export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return toProject(data);
    },
    enabled: !!projectId,
  });
}

// Create a new project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const insert: TablesInsert<"projects"> = {
        contractor_id: input.contractorId,
        client_id: input.clientId ?? null,
        name: input.name,
        homeowner_name: input.homeownerName ?? "",
        homeowner_email: input.homeownerEmail ?? "",
        homeowner_phone: input.homeownerPhone ?? null,
        project_description: input.projectDescription ?? null,
        status: "draft",
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(insert)
        .select()
        .single();

      if (error) throw error;
      return toProject(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", data.contractorId],
      });
    },
  });
}

// Update a project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProjectInput) => {
      const update: TablesUpdate<"projects"> = {};

      if (input.clientId !== undefined) update.client_id = input.clientId;
      if (input.name !== undefined) update.name = input.name;
      if (input.homeownerName !== undefined)
        update.homeowner_name = input.homeownerName;
      if (input.homeownerEmail !== undefined)
        update.homeowner_email = input.homeownerEmail;
      if (input.homeownerPhone !== undefined)
        update.homeowner_phone = input.homeownerPhone;
      if (input.projectDescription !== undefined)
        update.project_description = input.projectDescription;
      if (input.status !== undefined) update.status = input.status;
      if (input.rangeLow !== undefined) update.range_low = input.rangeLow;
      if (input.rangeHigh !== undefined) update.range_high = input.rangeHigh;
      if (input.expiresAt !== undefined) update.expires_at = input.expiresAt;

      update.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("projects")
        .update(update)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return toProject(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", data.contractorId],
      });
      queryClient.invalidateQueries({ queryKey: ["project", data.id] });
    },
  });
}

// Delete a project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // First get the project to know the contractor ID for invalidation
      const { data: project } = await supabase
        .from("projects")
        .select("contractor_id")
        .eq("id", projectId)
        .single();

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;
      return { projectId, contractorId: project?.contractor_id };
    },
    onSuccess: (data) => {
      if (data.contractorId) {
        queryClient.invalidateQueries({
          queryKey: ["projects", data.contractorId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["project", data.projectId] });
    },
  });
}
