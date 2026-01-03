// Framing trade constants

// Industry-standard framing rates
export const FRAMING_RATES = {
  // Labor rates per linear ft of wall
  labor_per_linear_ft: { low: 5, mid: 8, high: 12 },
  // Labor rates per sqft (for floor/ceiling framing)
  labor_per_sqft: { low: 2.5, mid: 4, high: 6 },
  // Material markup percentage
  material_markup: { low: 10, mid: 15, high: 25 },
} as const;

// Framing add-ons
export const FRAMING_ADDONS = [
  { id: "blocking", label: "Blocking", price: 15, unit: "each" },
  {
    id: "header_upgrade",
    label: "Header Upgrade (LVL)",
    price: 75,
    unit: "each",
  },
  { id: "fire_blocking", label: "Fire Blocking", price: 2, unit: "linear_ft" },
  { id: "demolition", label: "Demolition", price: 1.5, unit: "sqft" },
] as const;

// Complexity multipliers for framing
export const FRAMING_COMPLEXITY_MULTIPLIERS = {
  simple: 0.85, // Straight walls, standard layout
  standard: 1.0, // Normal residential
  complex: 1.3, // Angled walls, headers, tight spaces
} as const;

// Stud spacing options
export const STUD_SPACING_OPTIONS = [
  { value: 16, label: '16" O.C.', description: "Standard residential spacing" },
  {
    value: 24,
    label: '24" O.C.',
    description: "Common for non-load bearing walls",
  },
] as const;

// Helper to get complexity multiplier
export function getComplexityMultiplier(complexity: string): number {
  const key = complexity as keyof typeof FRAMING_COMPLEXITY_MULTIPLIERS;
  return FRAMING_COMPLEXITY_MULTIPLIERS[key] ?? 1.0;
}
