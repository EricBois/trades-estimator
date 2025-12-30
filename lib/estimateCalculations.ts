import { COMPLEXITY_LEVELS } from "./constants";

interface Template {
  baseLaborHours: number;
  baseMaterialCost: number;
  complexityMultipliers: Record<string, number> | null;
}

interface CalculateEstimateRangeParams {
  template: Template | null;
  parameters: Record<string, string | number>;
  complexity: string;
  hourlyRate: number;
}

interface EstimateRange {
  low: number;
  high: number;
  total: number;
}

export function calculateEstimateRange({
  template,
  parameters,
  complexity,
  hourlyRate,
}: CalculateEstimateRangeParams): EstimateRange | null {
  if (!template) return null;

  const complexityLevel = COMPLEXITY_LEVELS.find((c) => c.value === complexity);
  const multiplier = complexityLevel?.multiplier ?? 1.0;

  const laborCost = template.baseLaborHours * hourlyRate * multiplier;
  const materialCost = template.baseMaterialCost * multiplier;

  const baseCost = laborCost + materialCost;

  // Apply parameter-based adjustments
  let adjustedCost = baseCost;
  if (
    template.complexityMultipliers &&
    typeof template.complexityMultipliers === "object"
  ) {
    const multipliers = template.complexityMultipliers;
    Object.entries(parameters).forEach(([key, value]) => {
      if (multipliers[key] && typeof value === "number") {
        adjustedCost += value * multipliers[key];
      }
    });
  }

  // Total is the calculated cost, range kept for backwards compatibility
  const total = adjustedCost;
  const low = adjustedCost;
  const high = adjustedCost;

  return { low, high, total };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
