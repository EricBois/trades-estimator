"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/database.types";

const supabase = createClient();

export interface Estimate {
  id: string;
  contractorId: string;
  templateType: string;
  templateId: string | null;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string | null;
  projectDescription: string | null;
  parameters: Record<string, unknown> | null;
  rangeLow: number;
  rangeHigh: number;
  estimateMode: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  estimate_mode: string | null;
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
    estimateMode: e.estimate_mode ?? "ballpark",
    status: e.status ?? "draft",
    expiresAt: e.expires_at,
    createdAt: e.created_at ?? new Date().toISOString(),
    updatedAt: e.updated_at ?? new Date().toISOString(),
  };
}

export function useEstimates(contractorId: string | undefined) {
  return useQuery({
    queryKey: ["estimates", contractorId],
    queryFn: async (): Promise<Estimate[]> => {
      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .eq("contractor_id", contractorId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map(toEstimate);
    },
    enabled: !!contractorId,
  });
}

export function useEstimate(estimateId: string | undefined) {
  return useQuery({
    queryKey: ["estimate", estimateId],
    queryFn: async (): Promise<Estimate | null> => {
      if (!estimateId) return null;

      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .eq("id", estimateId)
        .single();

      if (error) throw error;

      return toEstimate(data);
    },
    enabled: !!estimateId,
  });
}

export interface CreateEstimateInput {
  contractorId: string;
  templateType: string;
  templateId?: string;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone?: string;
  projectDescription?: string;
  parameters?: Record<string, unknown>;
  rangeLow: number;
  rangeHigh: number;
  estimateMode?: string;
  expiresAt?: string;
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEstimateInput): Promise<Estimate> => {
      const { data, error } = await supabase
        .from("estimates")
        .insert({
          contractor_id: input.contractorId,
          template_type: input.templateType,
          template_id: input.templateId ?? null,
          homeowner_name: input.homeownerName,
          homeowner_email: input.homeownerEmail,
          homeowner_phone: input.homeownerPhone ?? null,
          project_description: input.projectDescription ?? null,
          parameters: (input.parameters ?? null) as Json,
          range_low: input.rangeLow,
          range_high: input.rangeHigh,
          estimate_mode: input.estimateMode ?? "ballpark",
          status: "draft",
          expires_at: input.expiresAt ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return toEstimate(data);
    },
    onSuccess: (estimate) => {
      queryClient.invalidateQueries({
        queryKey: ["estimates", estimate.contractorId],
      });
    },
  });
}

export function useUpdateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Estimate> & { id: string }): Promise<Estimate> => {
      const { data, error } = await supabase
        .from("estimates")
        .update({
          homeowner_name: updates.homeownerName,
          homeowner_email: updates.homeownerEmail,
          homeowner_phone: updates.homeownerPhone,
          project_description: updates.projectDescription,
          parameters: updates.parameters as Json,
          range_low: updates.rangeLow,
          range_high: updates.rangeHigh,
          estimate_mode: updates.estimateMode,
          status: updates.status,
          expires_at: updates.expiresAt,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return toEstimate(data);
    },
    onSuccess: (estimate) => {
      queryClient.invalidateQueries({
        queryKey: ["estimates", estimate.contractorId],
      });
      queryClient.invalidateQueries({
        queryKey: ["estimate", estimate.id],
      });
    },
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      // Get the estimate first to know the contractor ID
      const { data: estimate } = await supabase
        .from("estimates")
        .select("contractor_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("estimates").delete().eq("id", id);

      if (error) throw error;

      return estimate?.contractor_id ?? "";
    },
    onSuccess: (contractorId) => {
      queryClient.invalidateQueries({
        queryKey: ["estimates", contractorId],
      });
    },
  });
}
