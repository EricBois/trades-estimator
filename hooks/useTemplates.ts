"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/database.types";

const supabase = createClient();

export interface Template {
  id: string;
  contractorId: string | null;
  templateName: string;
  tradeType: string;
  description: string | null;
  baseLaborHours: number;
  baseMaterialCost: number;
  pricingModel: string;
  unitPrice: number;
  complexityMultipliers: Record<string, number> | null;
  requiredFields: Record<string, unknown> | null;
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async (): Promise<Template[]> => {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Only fetch user's own templates
      const { data, error } = await supabase
        .from("estimate_templates")
        .select("*")
        .eq("contractor_id", user.id)
        .order("trade_type")
        .order("template_name");

      if (error) throw error;

      return (data ?? []).map((t) => ({
        id: t.id,
        contractorId: (t as { contractor_id?: string }).contractor_id ?? null,
        templateName: t.template_name,
        tradeType: t.trade_type,
        description: t.description,
        baseLaborHours: t.base_labor_hours,
        baseMaterialCost: t.base_material_cost,
        pricingModel: t.pricing_model ?? "hourly",
        unitPrice: t.unit_price ?? 0,
        complexityMultipliers: t.complexity_multipliers as Record<string, number> | null,
        requiredFields: t.required_fields as Record<string, unknown> | null,
      }));
    },
  });
}

export function useTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ["template", templateId],
    queryFn: async (): Promise<Template | null> => {
      if (!templateId) return null;

      const { data, error } = await supabase
        .from("estimate_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        contractorId: (data as { contractor_id?: string }).contractor_id ?? null,
        templateName: data.template_name,
        tradeType: data.trade_type,
        description: data.description,
        baseLaborHours: data.base_labor_hours,
        baseMaterialCost: data.base_material_cost,
        pricingModel: data.pricing_model ?? "hourly",
        unitPrice: data.unit_price ?? 0,
        complexityMultipliers: data.complexity_multipliers as Record<string, number> | null,
        requiredFields: data.required_fields as Record<string, unknown> | null,
      };
    },
    enabled: !!templateId,
  });
}

export interface CreateTemplateInput {
  contractorId: string;
  templateName: string;
  tradeType: string;
  description?: string;
  baseLaborHours: number;
  baseMaterialCost: number;
  complexityMultipliers?: Record<string, number>;
  requiredFields?: Record<string, unknown>;
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTemplateInput): Promise<Template> => {
      const { data, error } = await supabase
        .from("estimate_templates")
        .insert({
          contractor_id: input.contractorId,
          template_name: input.templateName,
          trade_type: input.tradeType,
          description: input.description ?? null,
          base_labor_hours: input.baseLaborHours,
          base_material_cost: input.baseMaterialCost,
          complexity_multipliers: (input.complexityMultipliers ?? null) as Json,
          required_fields: (input.requiredFields ?? null) as Json,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        contractorId: (data as { contractor_id?: string }).contractor_id ?? null,
        templateName: data.template_name,
        tradeType: data.trade_type,
        description: data.description,
        baseLaborHours: data.base_labor_hours,
        baseMaterialCost: data.base_material_cost,
        pricingModel: data.pricing_model ?? "hourly",
        unitPrice: data.unit_price ?? 0,
        complexityMultipliers: data.complexity_multipliers as Record<string, number> | null,
        requiredFields: data.required_fields as Record<string, unknown> | null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CreateTemplateInput> & { id: string }): Promise<Template> => {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.templateName !== undefined) {
        dbUpdates.template_name = updates.templateName;
      }
      if (updates.tradeType !== undefined) {
        dbUpdates.trade_type = updates.tradeType;
      }
      if (updates.description !== undefined) {
        dbUpdates.description = updates.description;
      }
      if (updates.baseLaborHours !== undefined) {
        dbUpdates.base_labor_hours = updates.baseLaborHours;
      }
      if (updates.baseMaterialCost !== undefined) {
        dbUpdates.base_material_cost = updates.baseMaterialCost;
      }
      if (updates.complexityMultipliers !== undefined) {
        dbUpdates.complexity_multipliers = updates.complexityMultipliers;
      }
      if (updates.requiredFields !== undefined) {
        dbUpdates.required_fields = updates.requiredFields;
      }

      const { data, error } = await supabase
        .from("estimate_templates")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        contractorId: (data as { contractor_id?: string }).contractor_id ?? null,
        templateName: data.template_name,
        tradeType: data.trade_type,
        description: data.description,
        baseLaborHours: data.base_labor_hours,
        baseMaterialCost: data.base_material_cost,
        pricingModel: data.pricing_model ?? "hourly",
        unitPrice: data.unit_price ?? 0,
        complexityMultipliers: data.complexity_multipliers as Record<string, number> | null,
        requiredFields: data.required_fields as Record<string, unknown> | null,
      };
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", template.id] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("estimate_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}
