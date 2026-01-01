import {
  PAINTING_RATES,
  getCoatMultiplier,
  getQualityMultiplier,
  getPrepCostPerSqft,
  getComplexityMultiplier,
} from "./constants";
import {
  PaintingCoatCount,
  PaintingQuality,
  PaintingSurfacePrep,
  PaintingComplexity,
  PaintingSelectedAddon,
  PaintingEstimateTotals,
} from "./types";
import { PaintingRates } from "@/hooks/useProfile";

export interface CalculatePaintingParams {
  wallSqft: number;
  ceilingSqft: number;
  coatCount: PaintingCoatCount;
  paintQuality: PaintingQuality;
  surfacePrep: PaintingSurfacePrep;
  complexity: PaintingComplexity;
  addons: PaintingSelectedAddon[];
  rates: PaintingRates;
}

/**
 * Calculate painting estimate totals
 */
export function calculatePaintingEstimate(
  params: CalculatePaintingParams
): PaintingEstimateTotals {
  const {
    wallSqft,
    ceilingSqft,
    coatCount,
    paintQuality,
    surfacePrep,
    complexity,
    addons,
    rates,
  } = params;

  const totalSqft = wallSqft + ceilingSqft;

  // Get multipliers
  const coatMultiplier = getCoatMultiplier(coatCount);
  const qualityMultiplier = getQualityMultiplier(paintQuality);
  const prepCostPerSqft = getPrepCostPerSqft(surfacePrep);
  const complexityMultiplier = getComplexityMultiplier(complexity);

  // Get rates (with fallbacks)
  const laborRate = rates.labor_per_sqft ?? PAINTING_RATES.labor_per_sqft.mid;
  const materialRate =
    rates.material_per_sqft ?? PAINTING_RATES.material_per_sqft.mid;
  const ceilingModifier =
    rates.ceiling_modifier ?? PAINTING_RATES.ceiling_modifier.mid;

  // Calculate labor
  // Walls at base rate, ceilings at modified rate
  const wallLabor = wallSqft * laborRate * coatMultiplier;
  const ceilingLabor =
    ceilingSqft * laborRate * coatMultiplier * ceilingModifier;
  const laborSubtotal = wallLabor + ceilingLabor;

  // Calculate materials
  // Materials affected by coat count and quality
  const baseMaterialCost = totalSqft * materialRate * coatMultiplier;
  const materialSubtotal = baseMaterialCost * qualityMultiplier;

  // Calculate prep costs
  const prepSubtotal = totalSqft * prepCostPerSqft;

  // Calculate addons
  const addonsSubtotal = addons.reduce((sum, addon) => sum + addon.total, 0);

  // Subtotal before complexity
  const subtotal =
    laborSubtotal + materialSubtotal + prepSubtotal + addonsSubtotal;

  // Apply complexity multiplier
  const complexityAdjustment = subtotal * (complexityMultiplier - 1);
  const total = subtotal + complexityAdjustment;

  // Calculate cost per sqft
  const costPerSqft = totalSqft > 0 ? total / totalSqft : 0;

  // Calculate range (±15% for painting)
  const rangeLow = total * 0.85;
  const rangeHigh = total * 1.15;

  return {
    totalSqft,
    wallSqft,
    ceilingSqft,
    laborSubtotal,
    materialSubtotal,
    prepSubtotal,
    addonsSubtotal,
    subtotal,
    complexityMultiplier,
    complexityAdjustment,
    total,
    costPerSqft,
    rangeLow,
    rangeHigh,
  };
}

/**
 * Calculate range using low/high industry rates
 */
export function calculatePaintingRange(
  params: Omit<CalculatePaintingParams, "rates">
): { rangeLow: number; rangeHigh: number } {
  const lowRates: PaintingRates = {
    labor_per_sqft: PAINTING_RATES.labor_per_sqft.low,
    material_per_sqft: PAINTING_RATES.material_per_sqft.low,
    ceiling_modifier: PAINTING_RATES.ceiling_modifier.low,
  };

  const highRates: PaintingRates = {
    labor_per_sqft: PAINTING_RATES.labor_per_sqft.high,
    material_per_sqft: PAINTING_RATES.material_per_sqft.high,
    ceiling_modifier: PAINTING_RATES.ceiling_modifier.high,
  };

  const lowTotals = calculatePaintingEstimate({ ...params, rates: lowRates });
  const highTotals = calculatePaintingEstimate({ ...params, rates: highRates });

  return {
    rangeLow: lowTotals.total,
    rangeHigh: highTotals.total,
  };
}
