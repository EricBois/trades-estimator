"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Custom rates structure for different trades
export interface DrywallFinishingRates {
  sqft_standard?: number;
  sqft_premium?: number;
  linear_joints?: number;
  linear_corners?: number;
}

// Add-on prices (can be flat rate or per-unit)
export interface DrywallAddonPrices {
  sanding?: number; // flat
  primer?: number; // per sqft
  repair_holes?: number; // per each
  texture_match?: number; // flat
  high_ceiling?: number; // per sqft
  dust_barrier?: number; // flat
}

// Drywall hanging (installation) rates
export interface DrywallHangingRates {
  labor_per_sheet?: number; // $/sheet
  labor_per_sqft?: number; // $/sqft
  material_markup?: number; // percentage (0-100)
  default_waste_factor?: number; // decimal (0.10 = 10%)
}

// Drywall hanging add-on prices
export interface DrywallHangingAddonPrices {
  delivery?: number; // flat
  stocking?: number; // per sqft
  debris_removal?: number; // flat
  corner_bead?: number; // per linear ft
  insulation?: number; // per sqft
  vapor_barrier?: number; // per sqft
}

export interface CustomRates {
  drywall_finishing?: DrywallFinishingRates;
  drywall_addons?: DrywallAddonPrices;
  drywall_hanging?: DrywallHangingRates;
  drywall_hanging_addons?: DrywallHangingAddonPrices;
}

export interface UpdateProfileInput {
  id: string;
  companyName?: string;
  hourlyRate?: number | null;
  tradeType?: string;
  serviceAreas?: string[] | null;
  preferredTradeTypes?: string[] | null;
  hiddenTemplateIds?: string[];
  templatesOnboarded?: boolean;
  customRates?: CustomRates | null;
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
      if (input.customRates !== undefined) {
        updates.custom_rates = input.customRates;
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
