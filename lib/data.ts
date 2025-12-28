import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Estimate, Template } from "@/hooks";

// Transform database row to Estimate
function toEstimate(e: {
  id: string;
  contractor_id: string;
  template_type: string;
  template_id: string | null;
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
}): Estimate {
  return {
    id: e.id,
    contractorId: e.contractor_id,
    templateType: e.template_type,
    templateId: e.template_id,
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
    complexityMultipliers: t.complexity_multipliers as Record<string, number> | null,
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
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// Get current user and profile, redirect to login if not authenticated
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const { data: estimates } = await supabase
    .from("estimates")
    .select("*")
    .eq("contractor_id", user.id)
    .order("created_at", { ascending: false });

  const allEstimates = estimates?.map(toEstimate) ?? [];

  const stats = {
    total: allEstimates.length,
    draft: allEstimates.filter(e => e.status === "draft").length,
    sent: allEstimates.filter(e => e.status === "sent").length,
    accepted: allEstimates.filter(e => e.status === "accepted").length,
    declined: allEstimates.filter(e => e.status === "declined").length,
    viewed: allEstimates.filter(e => e.status === "viewed").length,
  };

  const recentEstimates = allEstimates.slice(0, 5);

  return { stats, recentEstimates, profile };
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
