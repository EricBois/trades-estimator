"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface UpdateProfileInput {
  id: string;
  companyName?: string;
  hourlyRate?: number | null;
  tradeType?: string;
  serviceAreas?: string[] | null;
  preferredTradeTypes?: string[] | null;
  hiddenTemplateIds?: string[];
  templatesOnboarded?: boolean;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const updates: Record<string, unknown> = {};

      if (input.companyName !== undefined) {
        updates.company_name = input.companyName;
      }
      if (input.hourlyRate !== undefined) {
        updates.hourly_rate = input.hourlyRate;
      }
      if (input.tradeType !== undefined) {
        updates.trade_type = input.tradeType;
      }
      if (input.serviceAreas !== undefined) {
        updates.service_areas = input.serviceAreas;
      }
      if (input.preferredTradeTypes !== undefined) {
        updates.preferred_trade_types = input.preferredTradeTypes;
      }
      if (input.hiddenTemplateIds !== undefined) {
        updates.hidden_template_ids = input.hiddenTemplateIds;
      }
      if (input.templatesOnboarded !== undefined) {
        updates.templates_onboarded = input.templatesOnboarded;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

