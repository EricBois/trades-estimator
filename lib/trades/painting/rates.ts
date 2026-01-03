import {
  PAINTING_RATES,
  PAINTING_ADDONS,
  PAINTING_COMPLEXITY_MULTIPLIERS,
} from "./constants";
import {
  CustomRates,
  PaintingRates,
  PaintingAddonPrices,
  TradeComplexity,
} from "@/hooks/useProfile";

// Rate type keys that can be customized
export type PaintingRateType = keyof typeof PAINTING_RATES;

/**
 * Get user's custom labor rate or fall back to industry mid rate
 */
export function getUserPaintingLaborRate(
  customRates: CustomRates | null | undefined
): number {
  const userRate = customRates?.painting?.labor_per_sqft;
  if (userRate !== undefined && userRate !== null) {
    return userRate;
  }
  return PAINTING_RATES.labor_per_sqft.mid;
}

/**
 * Get user's custom material rate or fall back to industry mid rate
 */
export function getUserPaintingMaterialRate(
  customRates: CustomRates | null | undefined
): number {
  const userRate = customRates?.painting?.material_per_sqft;
  if (userRate !== undefined && userRate !== null) {
    return userRate;
  }
  return PAINTING_RATES.material_per_sqft.mid;
}

/**
 * Get user's custom ceiling modifier or fall back to industry mid
 */
export function getUserCeilingModifier(
  customRates: CustomRates | null | undefined
): number {
  const userModifier = customRates?.painting?.ceiling_modifier;
  if (userModifier !== undefined && userModifier !== null) {
    return userModifier;
  }
  return PAINTING_RATES.ceiling_modifier.mid;
}

/**
 * Get all user rates with fallbacks to industry defaults
 */
export function getUserPaintingRates(
  customRates: CustomRates | null | undefined
): PaintingRates {
  return {
    labor_per_sqft: getUserPaintingLaborRate(customRates),
    material_per_sqft: getUserPaintingMaterialRate(customRates),
    ceiling_modifier: getUserCeilingModifier(customRates),
  };
}

/**
 * Get user's custom add-on price or fall back to default
 */
export function getUserPaintingAddonPrice(
  addonId: string,
  customRates: CustomRates | null | undefined
): number {
  const userPrice =
    customRates?.painting_addons?.[addonId as keyof PaintingAddonPrices];
  if (userPrice !== undefined && userPrice !== null) {
    return userPrice;
  }
  // Fall back to default from constants
  const addon = PAINTING_ADDONS.find((a) => a.id === addonId);
  return addon?.price ?? 0;
}

/**
 * Get all user add-on prices with fallbacks to defaults
 */
export function getUserPaintingAddonPrices(
  customRates: CustomRates | null | undefined
): PaintingAddonPrices {
  return {
    trim_paint: getUserPaintingAddonPrice("trim_paint", customRates),
    door_paint: getUserPaintingAddonPrice("door_paint", customRates),
    cabinet_paint: getUserPaintingAddonPrice("cabinet_paint", customRates),
    ceiling_texture: getUserPaintingAddonPrice("ceiling_texture", customRates),
    accent_wall: getUserPaintingAddonPrice("accent_wall", customRates),
    wallpaper_removal: getUserPaintingAddonPrice(
      "wallpaper_removal",
      customRates
    ),
    high_ceiling: getUserPaintingAddonPrice("high_ceiling", customRates),
    furniture_moving: getUserPaintingAddonPrice(
      "furniture_moving",
      customRates
    ),
  };
}

/**
 * Get default add-on price from constants
 */
export function getDefaultPaintingAddonPrice(addonId: string): number {
  const addon = PAINTING_ADDONS.find((a) => a.id === addonId);
  return addon?.price ?? 0;
}

/**
 * Check if a rate has been customized by the user
 */
export function isPaintingRateCustomized(
  rateType: keyof PaintingRates,
  customRates: CustomRates | null | undefined
): boolean {
  const userRate = customRates?.painting?.[rateType];
  return userRate !== undefined && userRate !== null;
}

/**
 * Check if an add-on price has been customized
 */
export function isPaintingAddonPriceCustomized(
  addonId: string,
  customRates: CustomRates | null | undefined
): boolean {
  const userPrice =
    customRates?.painting_addons?.[addonId as keyof PaintingAddonPrices];
  return userPrice !== undefined && userPrice !== null;
}

/**
 * Get rate range info for display in settings
 */
export function getPaintingRateRangeInfo(rateType: PaintingRateType): {
  low: number;
  mid: number;
  high: number;
  label: string;
  unit: string;
} {
  const range = PAINTING_RATES[rateType];
  const labels: Record<PaintingRateType, { label: string; unit: string }> = {
    labor_per_sqft: { label: "Labor Rate", unit: "$/sqft" },
    material_per_sqft: { label: "Material Rate", unit: "$/sqft" },
    ceiling_modifier: { label: "Ceiling Modifier", unit: "multiplier" },
  };

  return {
    ...range,
    ...labels[rateType],
  };
}

/**
 * Get user's custom complexity multipliers or fall back to defaults
 */
export function getUserPaintingComplexity(
  customRates: CustomRates | null | undefined
): TradeComplexity {
  const userComplexity = customRates?.painting_complexity;
  return {
    simple: userComplexity?.simple ?? PAINTING_COMPLEXITY_MULTIPLIERS.simple,
    standard:
      userComplexity?.standard ?? PAINTING_COMPLEXITY_MULTIPLIERS.standard,
    complex: userComplexity?.complex ?? PAINTING_COMPLEXITY_MULTIPLIERS.complex,
  };
}

/**
 * Get the complexity multiplier for a specific complexity level
 */
export function getPaintingComplexityMultiplier(
  complexity: "simple" | "standard" | "complex",
  customRates: CustomRates | null | undefined
): number {
  const userComplexity = getUserPaintingComplexity(customRates);
  return (
    userComplexity[complexity] ?? PAINTING_COMPLEXITY_MULTIPLIERS[complexity]
  );
}
