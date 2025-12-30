import { HANGING_RATES, HANGING_ADDONS, getSheetType } from "./constants";
import {
  CustomRates,
  DrywallHangingRates,
  DrywallHangingAddonPrices,
} from "@/hooks/useProfile";
import { DrywallSheetTypeId } from "./types";

// Rate type keys that can be customized
export type HangingRateType = keyof typeof HANGING_RATES;

/**
 * Get user's custom labor rate per sheet or fall back to industry mid rate
 */
export function getUserLaborPerSheet(
  customRates: CustomRates | null | undefined
): number {
  const userRate = customRates?.drywall_hanging?.labor_per_sheet;
  if (userRate !== undefined && userRate !== null) {
    return userRate;
  }
  return HANGING_RATES.labor_per_sheet.mid;
}

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
    labor_per_sheet: getUserLaborPerSheet(customRates),
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
 * Get labor cost for a sheet type (uses user's per-sheet rate or default from sheet type)
 */
export function getSheetLaborCost(
  typeId: DrywallSheetTypeId,
  customRates: CustomRates | null | undefined
): number {
  // If user has a custom labor_per_sheet rate, use it
  const userLaborRate = customRates?.drywall_hanging?.labor_per_sheet;
  if (userLaborRate !== undefined && userLaborRate !== null) {
    return userLaborRate;
  }

  // Otherwise use the default labor cost from the sheet type
  const sheetType = getSheetType(typeId);
  return sheetType?.laborCost ?? HANGING_RATES.labor_per_sheet.mid;
}

/**
 * Check if a rate has been customized by the user
 */
export function isHangingRateCustomized(
  rateType:
    | "labor_per_sheet"
    | "labor_per_sqft"
    | "material_markup"
    | "default_waste_factor",
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
    labor_per_sheet: { label: "Labor per Sheet", unit: "$/sheet" },
    labor_per_sqft: { label: "Labor per Sqft", unit: "$/sqft" },
    material_markup: { label: "Material Markup", unit: "%" },
  };

  return {
    ...range,
    ...labels[rateType],
  };
}
