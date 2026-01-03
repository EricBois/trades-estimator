import {
  DRYWALL_RATES,
  DRYWALL_ADDONS,
  getMaterialRate,
  getLaborRate,
  DRYWALL_COMPLEXITY_MULTIPLIERS,
} from "./constants";
import {
  CustomRates,
  DrywallFinishingRates,
  DrywallAddonPrices,
  TradeComplexity,
} from "@/hooks/useProfile";

// Rate type keys that can be customized
export type DrywallRateType = keyof typeof DRYWALL_RATES;

// Add-on ID type
export type DrywallAddonId = (typeof DRYWALL_ADDONS)[number]["id"];

/**
 * Get user's custom rate or fall back to industry mid rate
 */
export function getUserDrywallRate(
  rateType: DrywallRateType,
  customRates: CustomRates | null | undefined
): number {
  const userRate = customRates?.drywall_finishing?.[rateType];
  if (userRate !== undefined && userRate !== null) {
    return userRate;
  }
  return DRYWALL_RATES[rateType].mid;
}

/**
 * Get all user rates with fallbacks to industry defaults
 */
export function getUserDrywallRates(
  customRates: CustomRates | null | undefined
): DrywallFinishingRates {
  return {
    sqft_standard: getUserDrywallRate("sqft_standard", customRates),
    sqft_premium: getUserDrywallRate("sqft_premium", customRates),
    linear_joints: getUserDrywallRate("linear_joints", customRates),
    linear_corners: getUserDrywallRate("linear_corners", customRates),
  };
}

/**
 * Get user's custom add-on price or fall back to default
 */
export function getUserAddonPrice(
  addonId: string,
  customRates: CustomRates | null | undefined
): number {
  const userPrice =
    customRates?.drywall_addons?.[addonId as keyof DrywallAddonPrices];
  if (userPrice !== undefined && userPrice !== null) {
    return userPrice;
  }
  // Fall back to default from constants
  const addon = DRYWALL_ADDONS.find((a) => a.id === addonId);
  return addon?.price ?? 0;
}

/**
 * Get all user add-on prices with fallbacks to defaults
 */
export function getUserAddonPrices(
  customRates: CustomRates | null | undefined
): DrywallAddonPrices {
  return {
    sanding: getUserAddonPrice("sanding", customRates),
    primer: getUserAddonPrice("primer", customRates),
    repair_holes: getUserAddonPrice("repair_holes", customRates),
    texture_match: getUserAddonPrice("texture_match", customRates),
    high_ceiling: getUserAddonPrice("high_ceiling", customRates),
    dust_barrier: getUserAddonPrice("dust_barrier", customRates),
  };
}

/**
 * Get default add-on price from constants
 */
export function getDefaultAddonPrice(addonId: string): number {
  const addon = DRYWALL_ADDONS.find((a) => a.id === addonId);
  return addon?.price ?? 0;
}

/**
 * Check if a rate has been customized by the user
 */
export function isRateCustomized(
  rateType: DrywallRateType,
  customRates: CustomRates | null | undefined
): boolean {
  const userRate = customRates?.drywall_finishing?.[rateType];
  return userRate !== undefined && userRate !== null;
}

/**
 * Check if an add-on price has been customized
 */
export function isAddonPriceCustomized(
  addonId: string,
  customRates: CustomRates | null | undefined
): boolean {
  const userPrice =
    customRates?.drywall_addons?.[addonId as keyof DrywallAddonPrices];
  return userPrice !== undefined && userPrice !== null;
}

/**
 * Get the default (industry mid) rate for comparison
 */
export function getDefaultRate(rateType: DrywallRateType): number {
  return DRYWALL_RATES[rateType].mid;
}

/**
 * Get rate range info for display in settings
 */
export function getRateRangeInfo(rateType: DrywallRateType): {
  low: number;
  mid: number;
  high: number;
  label: string;
  unit: string;
} {
  const range = DRYWALL_RATES[rateType];
  const labels: Record<DrywallRateType, { label: string; unit: string }> = {
    sqft_standard: { label: "Standard Area", unit: "$/sqft" },
    sqft_premium: { label: "Premium Area", unit: "$/sqft" },
    linear_joints: { label: "Joints (Tape & Mud)", unit: "$/linear ft" },
    linear_corners: { label: "Corner Bead", unit: "$/linear ft" },
  };

  return {
    ...range,
    ...labels[rateType],
  };
}

/**
 * Get user's custom material rate for a line item type or fall back to industry default
 */
export function getUserMaterialRate(
  rateType: DrywallRateType,
  customRates: CustomRates | null | undefined
): number {
  // Check if user has custom material rate (future: could add drywall_finishing_material to profile)
  const userRate = customRates?.drywall_finishing?.[rateType];
  if (userRate !== undefined && userRate !== null) {
    // If user has a combined rate, calculate material portion (~30%)
    return userRate * 0.3;
  }
  return getMaterialRate(rateType);
}

/**
 * Get user's custom labor rate for a line item type or fall back to industry default
 */
export function getUserLaborRate(
  rateType: DrywallRateType,
  customRates: CustomRates | null | undefined
): number {
  // Check if user has custom labor rate
  const userRate = customRates?.drywall_finishing?.[rateType];
  if (userRate !== undefined && userRate !== null) {
    // If user has a combined rate, calculate labor portion (~70%)
    return userRate * 0.7;
  }
  return getLaborRate(rateType);
}

/**
 * Get effective material rate respecting override
 */
export function getEffectiveMaterialRate(
  rateType: DrywallRateType,
  customRates: CustomRates | null | undefined,
  override?: number
): number {
  if (override !== undefined) {
    return override;
  }
  return getUserMaterialRate(rateType, customRates);
}

/**
 * Get effective labor rate respecting override
 */
export function getEffectiveLaborRate(
  rateType: DrywallRateType,
  customRates: CustomRates | null | undefined,
  override?: number
): number {
  if (override !== undefined) {
    return override;
  }
  return getUserLaborRate(rateType, customRates);
}

/**
 * Get user's custom complexity multipliers or fall back to defaults
 */
export function getUserFinishingComplexity(
  customRates: CustomRates | null | undefined
): TradeComplexity {
  const userComplexity = customRates?.drywall_finishing_complexity;
  return {
    simple: userComplexity?.simple ?? DRYWALL_COMPLEXITY_MULTIPLIERS.simple,
    standard:
      userComplexity?.standard ?? DRYWALL_COMPLEXITY_MULTIPLIERS.standard,
    complex: userComplexity?.complex ?? DRYWALL_COMPLEXITY_MULTIPLIERS.complex,
  };
}

/**
 * Get the complexity multiplier for a specific complexity level
 */
export function getFinishingComplexityMultiplier(
  complexity: "simple" | "standard" | "complex",
  customRates: CustomRates | null | undefined
): number {
  const userComplexity = getUserFinishingComplexity(customRates);
  return (
    userComplexity[complexity] ?? DRYWALL_COMPLEXITY_MULTIPLIERS[complexity]
  );
}
