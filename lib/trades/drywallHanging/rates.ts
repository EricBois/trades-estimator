import {
  HANGING_RATES,
  HANGING_ADDONS,
  getSheetType,
  HANGING_COMPLEXITY_MULTIPLIERS,
  DRYWALL_SHEET_SIZES,
  getCeilingFactor,
} from "./constants";
import {
  CustomRates,
  DrywallHangingRates,
  DrywallHangingAddonPrices,
  TradeComplexity,
  CeilingMultiplierAppliesTo,
} from "@/hooks/useProfile";
import { DrywallSheetTypeId, CeilingHeightFactor } from "./types";

// Rate type keys that can be customized
export type HangingRateType = keyof typeof HANGING_RATES;

/**
 * Get user's custom labor rate per sqft or fall back to industry mid rate
 */
export function getUserLaborPerSqft(
  customRates: CustomRates | null | undefined
): number {
  const userRate = customRates?.drywall_hanging?.labor_per_sqft;
  if (userRate !== undefined && userRate !== null) {
    return userRate;
  }
  return HANGING_RATES.labor_per_sqft.mid;
}

/**
 * Get user's material markup percentage or fall back to industry mid
 */
export function getUserMaterialMarkup(
  customRates: CustomRates | null | undefined
): number {
  const userRate = customRates?.drywall_hanging?.material_markup;
  if (userRate !== undefined && userRate !== null) {
    return userRate;
  }
  return HANGING_RATES.material_markup.mid;
}

/**
 * Get user's default waste factor or fall back to 12%
 */
export function getUserDefaultWasteFactor(
  customRates: CustomRates | null | undefined
): number {
  const userRate = customRates?.drywall_hanging?.default_waste_factor;
  if (userRate !== undefined && userRate !== null) {
    return userRate;
  }
  return 0.12; // 12% default
}

/**
 * Get all user hanging rates with fallbacks to industry defaults
 */
export function getUserHangingRates(
  customRates: CustomRates | null | undefined
): DrywallHangingRates {
  return {
    labor_per_sqft: getUserLaborPerSqft(customRates),
    material_markup: getUserMaterialMarkup(customRates),
    default_waste_factor: getUserDefaultWasteFactor(customRates),
  };
}

/**
 * Get user's custom add-on price or fall back to default
 */
export function getUserHangingAddonPrice(
  addonId: string,
  customRates: CustomRates | null | undefined
): number {
  const userPrice =
    customRates?.drywall_hanging_addons?.[
      addonId as keyof DrywallHangingAddonPrices
    ];
  if (userPrice !== undefined && userPrice !== null) {
    return userPrice;
  }
  // Fall back to default from constants
  const addon = HANGING_ADDONS.find((a) => a.id === addonId);
  return addon?.price ?? 0;
}

/**
 * Get all user add-on prices with fallbacks to defaults
 */
export function getUserHangingAddonPrices(
  customRates: CustomRates | null | undefined
): DrywallHangingAddonPrices {
  return {
    delivery: getUserHangingAddonPrice("delivery", customRates),
    stocking: getUserHangingAddonPrice("stocking", customRates),
    debris_removal: getUserHangingAddonPrice("debris_removal", customRates),
    corner_bead: getUserHangingAddonPrice("corner_bead", customRates),
    insulation: getUserHangingAddonPrice("insulation", customRates),
    vapor_barrier: getUserHangingAddonPrice("vapor_barrier", customRates),
  };
}

/**
 * Get default add-on price from constants
 */
export function getDefaultHangingAddonPrice(addonId: string): number {
  const addon = HANGING_ADDONS.find((a) => a.id === addonId);
  return addon?.price ?? 0;
}

/**
 * Get material cost for a sheet type with user's markup applied
 */
export function getSheetMaterialCost(
  typeId: DrywallSheetTypeId,
  customRates: CustomRates | null | undefined
): number {
  const sheetType = getSheetType(typeId);
  if (!sheetType) return 0;

  const baseCost = sheetType.materialCost;
  const markup = getUserMaterialMarkup(customRates);
  return baseCost * (1 + markup / 100);
}

/**
 * Get labor cost for a sheet type
 * Calculates from labor_per_sqft × sheet sqft × difficulty multiplier
 * Default sheet size is 4x8 (32 sqft)
 */
export function getSheetLaborCost(
  typeId: DrywallSheetTypeId,
  customRates: CustomRates | null | undefined,
  sheetSize: string = "4x8"
): number {
  const sheetType = getSheetType(typeId);
  if (!sheetType) return 0;

  // Get the sqft for this sheet size (default to 4x8 = 32 sqft)
  const size = DRYWALL_SHEET_SIZES.find((s) => s.value === sheetSize);
  const sqft = size?.sqft ?? 32;

  // Calculate: labor_per_sqft × sqft × difficulty multiplier
  const laborPerSqft = getUserLaborPerSqft(customRates);
  const difficultyMultiplier = sheetType.laborMultiplier;

  return laborPerSqft * sqft * difficultyMultiplier;
}

/**
 * Check if a rate has been customized by the user
 */
export function isHangingRateCustomized(
  rateType: "labor_per_sqft" | "material_markup" | "default_waste_factor",
  customRates: CustomRates | null | undefined
): boolean {
  const userRate = customRates?.drywall_hanging?.[rateType];
  return userRate !== undefined && userRate !== null;
}

/**
 * Check if an add-on price has been customized
 */
export function isHangingAddonPriceCustomized(
  addonId: string,
  customRates: CustomRates | null | undefined
): boolean {
  const userPrice =
    customRates?.drywall_hanging_addons?.[
      addonId as keyof DrywallHangingAddonPrices
    ];
  return userPrice !== undefined && userPrice !== null;
}

/**
 * Get rate range info for display in settings
 */
export function getHangingRateRangeInfo(rateType: HangingRateType): {
  low: number;
  mid: number;
  high: number;
  label: string;
  unit: string;
} {
  const range = HANGING_RATES[rateType];
  const labels: Record<HangingRateType, { label: string; unit: string }> = {
    labor_per_sqft: { label: "Labor per Sqft", unit: "$/sqft" },
    material_markup: { label: "Material Markup", unit: "%" },
  };

  return {
    ...range,
    ...labels[rateType],
  };
}

/**
 * Get effective material cost for a sheet, respecting override
 */
export function getEffectiveSheetMaterialCost(
  typeId: DrywallSheetTypeId,
  customRates: CustomRates | null | undefined,
  override?: number
): number {
  if (override !== undefined) {
    return override;
  }
  return getSheetMaterialCost(typeId, customRates);
}

/**
 * Get effective labor cost for a sheet, respecting override
 */
export function getEffectiveSheetLaborCost(
  typeId: DrywallSheetTypeId,
  customRates: CustomRates | null | undefined,
  override?: number,
  sheetSize: string = "4x8"
): number {
  if (override !== undefined) {
    return override;
  }
  return getSheetLaborCost(typeId, customRates, sheetSize);
}

/**
 * Get effective addon price, respecting override
 */
export function getEffectiveAddonPrice(
  addonId: string,
  customRates: CustomRates | null | undefined,
  override?: number
): number {
  if (override !== undefined) {
    return override;
  }
  return getUserHangingAddonPrice(addonId, customRates);
}

/**
 * Get user's custom complexity multipliers or fall back to defaults
 */
export function getUserHangingComplexity(
  customRates: CustomRates | null | undefined
): TradeComplexity {
  const userComplexity = customRates?.drywall_hanging_complexity;
  return {
    simple: userComplexity?.simple ?? HANGING_COMPLEXITY_MULTIPLIERS.simple,
    standard:
      userComplexity?.standard ?? HANGING_COMPLEXITY_MULTIPLIERS.standard,
    complex: userComplexity?.complex ?? HANGING_COMPLEXITY_MULTIPLIERS.complex,
  };
}

/**
 * Get the complexity multiplier for a specific complexity level
 */
export function getHangingComplexityMultiplier(
  complexity: "simple" | "standard" | "complex",
  customRates: CustomRates | null | undefined
): number {
  const userComplexity = getUserHangingComplexity(customRates);
  return (
    userComplexity[complexity] ?? HANGING_COMPLEXITY_MULTIPLIERS[complexity]
  );
}

/**
 * Get user's custom ceiling height multiplier or fall back to constant default
 */
export function getUserCeilingHeightMultiplier(
  heightFactor: CeilingHeightFactor,
  customRates: CustomRates | null | undefined
): number {
  const customMultipliers =
    customRates?.drywall_hanging?.ceiling_height_multipliers;
  if (customMultipliers) {
    const customValue = customMultipliers[heightFactor];
    if (customValue !== undefined && customValue !== null) {
      return customValue;
    }
  }
  // Fall back to constants
  return getCeilingFactor(heightFactor)?.multiplier ?? 1;
}

/**
 * Get what the ceiling height multiplier applies to (all, ceiling_only, walls_only)
 */
export function getCeilingMultiplierAppliesTo(
  customRates: CustomRates | null | undefined
): CeilingMultiplierAppliesTo {
  return customRates?.drywall_hanging?.ceiling_multiplier_applies_to ?? "all";
}

/**
 * Get all ceiling height multipliers with fallbacks to defaults
 */
export function getUserCeilingHeightMultipliers(
  customRates: CustomRates | null | undefined
): Record<CeilingHeightFactor, number> {
  return {
    standard: getUserCeilingHeightMultiplier("standard", customRates),
    nine_ft: getUserCeilingHeightMultiplier("nine_ft", customRates),
    ten_ft: getUserCeilingHeightMultiplier("ten_ft", customRates),
    cathedral: getUserCeilingHeightMultiplier("cathedral", customRates),
  };
}
