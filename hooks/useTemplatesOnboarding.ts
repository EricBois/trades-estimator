"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/database.types";
import type { Template } from "./useTemplates";

const supabase = createClient();

export interface TemplateCustomization {
  templateName?: string;
  tradeType?: string;
  description?: string | null;
  baseLaborHours?: number;
  baseMaterialCost?: number;
  complexityMultipliers?: Record<string, number> | null;
  requiredFields?: Record<string, unknown> | null;
}

export interface SelectedTemplate {
  originalTemplate: Template;
  customizations: TemplateCustomization;
}

export interface CompleteOnboardingInput {
  profileId: string;
  selectedTemplates: SelectedTemplate[];
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, selectedTemplates }: CompleteOnboardingInput): Promise<void> => {
      // Clone selected templates with customizations
      if (selectedTemplates.length > 0) {
        const templatesToInsert = selectedTemplates.map(({ originalTemplate, customizations }) => ({
          contractor_id: profileId,
          template_name: customizations.templateName ?? originalTemplate.templateName,
          trade_type: customizations.tradeType ?? originalTemplate.tradeType,
          description: customizations.description !== undefined
            ? customizations.description
            : originalTemplate.description,
          base_labor_hours: customizations.baseLaborHours ?? originalTemplate.baseLaborHours,
          base_material_cost: customizations.baseMaterialCost ?? originalTemplate.baseMaterialCost,
          complexity_multipliers: (customizations.complexityMultipliers !== undefined
            ? customizations.complexityMultipliers
            : originalTemplate.complexityMultipliers) as Json,
          required_fields: (customizations.requiredFields !== undefined
            ? customizations.requiredFields
            : originalTemplate.requiredFields) as Json,
        }));

        const { error: insertError } = await supabase
          .from("estimate_templates")
          .insert(templatesToInsert);

        if (insertError) {
          console.error("Insert error details:", insertError.message, insertError.details, insertError.hint);
          throw new Error(`Failed to clone templates: ${insertError.message}`);
        }
      }

      // Mark profile as onboarded
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ templates_onboarded: true })
        .eq("id", profileId);

      if (updateError) {
        console.error("Update error details:", updateError.message, updateError.details, updateError.hint);
        throw new Error(`Failed to mark onboarding complete: ${updateError.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useSkipOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string): Promise<void> => {
      const { error } = await supabase
        .from("profiles")
        .update({ templates_onboarded: true })
        .eq("id", profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
