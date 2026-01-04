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

// Ceiling height multiplier settings
export interface CeilingHeightMultipliers {
  standard?: number; // default 1.0 (8' ceilings)
  nine_ft?: number; // default 1.1
  ten_ft?: number; // default 1.15
  cathedral?: number; // default 1.35
}

// What the ceiling height multiplier applies to
export type CeilingMultiplierAppliesTo = "all" | "ceiling_only" | "walls_only";

// Drywall hanging (installation) rates
export interface DrywallHangingRates {
  labor_per_sqft?: number; // $/sqft
  material_markup?: number; // percentage (0-100)
  default_waste_factor?: number; // decimal (0.10 = 10%)
  ceiling_height_multipliers?: CeilingHeightMultipliers;
  ceiling_multiplier_applies_to?: CeilingMultiplierAppliesTo;
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

// Painting rates
export interface PaintingRates {
  labor_per_sqft?: number; // $/sqft
  material_per_sqft?: number; // $/sqft
  ceiling_modifier?: number; // multiplier for ceiling work
}

// Painting add-on prices
export interface PaintingAddonPrices {
  trim_paint?: number; // per linear ft
  door_paint?: number; // per each
  cabinet_paint?: number; // per each
  ceiling_texture?: number; // per sqft
  accent_wall?: number; // per sqft
  wallpaper_removal?: number; // per sqft
  high_ceiling?: number; // per sqft
  furniture_moving?: number; // flat
}

// Complexity multipliers per trade
export interface TradeComplexity {
  simple?: number; // default: 0.85
  standard?: number; // default: 1.0
  complex?: number; // default: 1.3
}

// Framing rates
export interface FramingRates {
  labor_per_linear_ft?: number; // $/linear ft of wall
  labor_per_sqft?: number; // $/sqft for header/floor framing
  material_markup?: number; // percentage (0-100)
}

// Framing add-on prices
export interface FramingAddonPrices {
  blocking?: number; // per piece
  header_upgrade?: number; // per header
  fire_blocking?: number; // per linear ft
  demolition?: number; // per sqft
}

// Preset material price overrides (material ID -> custom price)
export interface FinishingMaterialPrices {
  [materialId: string]: number;
}

export interface CustomRates {
  drywall_finishing?: DrywallFinishingRates;
  drywall_addons?: DrywallAddonPrices;
  drywall_hanging?: DrywallHangingRates;
  drywall_hanging_addons?: DrywallHangingAddonPrices;
  painting?: PaintingRates;
  painting_addons?: PaintingAddonPrices;
  // Preset material price overrides
  finishing_material_prices?: FinishingMaterialPrices;
  // Complexity multipliers per trade
  drywall_hanging_complexity?: TradeComplexity;
  drywall_finishing_complexity?: TradeComplexity;
  painting_complexity?: TradeComplexity;
  framing_complexity?: TradeComplexity;
  // Framing trade
  framing?: FramingRates;
  framing_addons?: FramingAddonPrices;
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
