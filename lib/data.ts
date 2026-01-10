import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Estimate, Template } from "@/hooks";
import type { Client } from "@/hooks/useClients";
import type { Project, ProjectStatus } from "@/lib/project/types";

// Transform database row to Estimate
function toEstimate(e: {
  id: string;
  contractor_id: string;
  client_id: string | null;
  template_type: string;
  template_id: string | null;
  name?: string | null;
  homeowner_name: string;
  homeowner_email: string;
  homeowner_phone: string | null;
  project_description: string | null;
  parameters: unknown;
  range_low: number;
  range_high: number;
  status: string | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  project_id: string | null;
}): Estimate {
  return {
    id: e.id,
    contractorId: e.contractor_id,
    clientId: e.client_id,
    templateType: e.template_type,
    templateId: e.template_id,
    name: e.name ?? null,
    homeownerName: e.homeowner_name,
    homeownerEmail: e.homeowner_email,
    homeownerPhone: e.homeowner_phone,
    projectDescription: e.project_description,
    parameters: e.parameters as Record<string, unknown> | null,
    rangeLow: e.range_low,
    rangeHigh: e.range_high,
    status: e.status ?? "draft",
    expiresAt: e.expires_at,
    createdAt: e.created_at ?? new Date().toISOString(),
    updatedAt: e.updated_at ?? new Date().toISOString(),
    projectId: e.project_id,
  };
}

// Transform database row to Template
function toTemplate(t: {
  id: string;
  contractor_id: string | null;
  template_name: string;
  trade_type: string;
  description: string | null;
  base_labor_hours: number;
  base_material_cost: number;
  complexity_multipliers: unknown;
  required_fields: unknown;
}): Template {
  return {
    id: t.id,
    contractorId: t.contractor_id,
    templateName: t.template_name,
    tradeType: t.trade_type,
    description: t.description,
    baseLaborHours: t.base_labor_hours,
    baseMaterialCost: t.base_material_cost,
    complexityMultipliers: t.complexity_multipliers as Record<
      string,
      number
    > | null,
    requiredFields: t.required_fields as Record<string, unknown> | null,
  };
}

// Transform profile row
function toProfile(p: {
  id: string;
  company_name: string;
  hourly_rate: number | null;
  trade_type: string;
  service_areas: string[] | null;
  hidden_template_ids: string[] | null;
  templates_onboarded: boolean | null;
  custom_rates: unknown;
  created_at: string | null;
  updated_at: string | null;
}) {
  return {
    id: p.id,
    email: null,
    companyName: p.company_name,
    hourlyRate: p.hourly_rate,
    preferredTradeTypes: p.trade_type ? [p.trade_type] : null,
    hiddenTemplateIds: p.hidden_template_ids ?? [],
    templatesOnboarded: p.templates_onboarded ?? false,
    customRates: p.custom_rates as {
      drywall_finishing?: {
        sqft_standard?: number;
        sqft_premium?: number;
        linear_joints?: number;
        linear_corners?: number;
      };
    } | null,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// Get current user and profile, redirect to login if not authenticated
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile ? toProfile(profile) : null };
}

// Get estimates for authenticated user
export async function getEstimates(): Promise<Estimate[]> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimates")
    .select("*")
    .eq("contractor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data?.map(toEstimate) ?? [];
}

// Get single estimate
export async function getEstimate(id: string): Promise<Estimate | null> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimates")
    .select("*")
    .eq("id", id)
    .eq("contractor_id", user.id)
    .single();

  if (error) return null;
  return toEstimate(data);
}

// Get templates (only user's own templates, not global)
export async function getTemplates(): Promise<Template[]> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimate_templates")
    .select("*")
    .eq("contractor_id", user.id)
    .order("trade_type", { ascending: true })
    .order("template_name", { ascending: true });

  if (error) throw error;
  return data?.map(toTemplate) ?? [];
}

// Get single template (only user's own)
export async function getTemplate(id: string): Promise<Template | null> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimate_templates")
    .select("*")
    .eq("id", id)
    .eq("contractor_id", user.id)
    .single();

  if (error) return null;
  return toTemplate(data);
}

// Get dashboard stats
export async function getDashboardStats() {
  const { user, profile } = await getAuthenticatedUser();
  const supabase = await createClient();

  // Fetch estimates and projects in parallel
  const [estimatesResult, projectsResult] = await Promise.all([
    supabase
      .from("estimates")
      .select("*")
      .eq("contractor_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .eq("contractor_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const allEstimates = estimatesResult.data?.map(toEstimate) ?? [];
  const allProjects = projectsResult.data?.map(toProject) ?? [];

  const stats = {
    totalProjects: allProjects.length,
    totalEstimates: allEstimates.length,
    accepted: allProjects.filter((p) => p.status === "accepted").length,
    sent: allProjects.filter((p) => p.status === "sent").length,
  };

  // Get recent projects (up to 5)
  const recentProjects = allProjects.slice(0, 5);

  // Get standalone estimates (no project) for display
  const standaloneEstimates = allEstimates.filter((e) => !e.projectId).slice(0, 5);

  return { stats, recentProjects, standaloneEstimates, allEstimates, profile };
}

// Get default templates only (contractor_id = null)
export async function getDefaultTemplates(): Promise<Template[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimate_templates")
    .select("*")
    .is("contractor_id", null)
    .order("trade_type", { ascending: true })
    .order("template_name", { ascending: true });

  if (error) throw error;
  return data?.map(toTemplate) ?? [];
}

// Transform database row to Project
function toProject(row: {
  id: string;
  contractor_id: string;
  client_id: string | null;
  name: string;
  homeowner_name: string;
  homeowner_email: string;
  homeowner_phone: string | null;
  project_description: string | null;
  status: string | null;
  range_low: number | null;
  range_high: number | null;
  created_at: string | null;
  updated_at: string | null;
  expires_at: string | null;
  viewed_at: string | null;
}): Project {
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

// Get projects for authenticated user
export async function getProjects(): Promise<Project[]> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("contractor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data?.map(toProject) ?? [];
}

// Transform database row to Client
function toClient(c: {
  id: string;
  contractor_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}): Client {
  return {
    id: c.id,
    contractorId: c.contractor_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    street: c.street,
    city: c.city,
    state: c.state,
    zip: c.zip,
    notes: c.notes,
    createdAt: c.created_at ?? new Date().toISOString(),
    updatedAt: c.updated_at ?? new Date().toISOString(),
  };
}

// Get clients for authenticated user
export async function getClients(): Promise<Client[]> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("contractor_id", user.id)
    .order("name", { ascending: true });

  if (error) throw error;
  return data?.map(toClient) ?? [];
}

// Get single client
export async function getClient(id: string): Promise<Client | null> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("contractor_id", user.id)
    .single();

  if (error) return null;
  return toClient(data);
}

// Get estimates for a specific client
export async function getClientEstimates(clientId: string): Promise<Estimate[]> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("estimates")
    .select("*")
    .eq("contractor_id", user.id)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data?.map(toEstimate) ?? [];
}

// Get projects for a specific client
export async function getClientProjects(clientId: string): Promise<Project[]> {
  const { user } = await getAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("contractor_id", user.id)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data?.map(toProject) ?? [];
}
