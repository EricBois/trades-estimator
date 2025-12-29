// Drywall Finish Levels (Industry Standard)
// Level 0-2 are specialty/rare, we focus on 3-5 for residential/commercial
export const DRYWALL_FINISH_LEVELS = [
  {
    value: 3,
    label: "Level 3 - Standard",
    description: "Tape + 2 coats. Good for textured finishes.",
    sqftRate: 0.45,
  },
  {
    value: 4,
    label: "Level 4 - Light Texture",
    description: "Tape + 3 coats. Ready for light texture or flat paint.",
    sqftRate: 0.55,
  },
  {
    value: 5,
    label: "Level 5 - Smooth/Skim",
    description:
      "Skim coat finish. Required for gloss paint or critical lighting.",
    sqftRate: 0.95,
  },
] as const;

// Line item types with their units and default icons
export const DRYWALL_LINE_ITEM_TYPES = [
  { value: "hourly", label: "Hourly Work", unit: "hours", icon: "Clock" },
  {
    value: "sqft_standard",
    label: "Standard Area",
    unit: "sqft",
    icon: "Square",
  },
  {
    value: "sqft_premium",
    label: "Premium Area",
    unit: "sqft",
    icon: "Sparkles",
  },
  {
    value: "linear_joints",
    label: "Joints (Tape & Mud)",
    unit: "linear ft",
    icon: "Minus",
  },
  {
    value: "linear_corners",
    label: "Corner Bead",
    unit: "linear ft",
    icon: "CornerDownRight",
  },
  { value: "addon", label: "Add-on", unit: "each", icon: "Plus" },
] as const;

// Common add-ons with preset pricing
export const DRYWALL_ADDONS = [
  { id: "sanding", label: "Extra Sanding", price: 50, unit: "flat" },
  { id: "primer", label: "Prime Coat", price: 0.15, unit: "sqft" },
  { id: "repair_holes", label: "Hole Repair", price: 25, unit: "each" },
  { id: "texture_match", label: "Texture Matching", price: 75, unit: "flat" },
  {
    id: "high_ceiling",
    label: "High Ceiling Premium",
    price: 0.1,
    unit: "sqft",
  },
  { id: "dust_barrier", label: "Dust Barrier Setup", price: 100, unit: "flat" },
] as const;

// Industry-standard rate ranges (based on 2024 market research)
// These are contractor rates, not retail
export const DRYWALL_RATES = {
  sqft_standard: { low: 0.35, mid: 0.5, high: 0.65 },
  sqft_premium: { low: 0.75, mid: 0.9, high: 1.1 },
  linear_joints: { low: 1.22, mid: 1.35, high: 1.48 },
  linear_corners: { low: 3.96, mid: 4.35, high: 4.76 },
} as const;

// Complexity multipliers specific to drywall (matches WIZARD_COMPLEXITY_LEVELS)
export const DRYWALL_COMPLEXITY_MULTIPLIERS = {
  simple: 0.85,
  standard: 1.0,
  complex: 1.25,
} as const;

// Helper to get default rate for a line item type
export function getDefaultRate(type: string): number {
  switch (type) {
    case "sqft_standard":
      return DRYWALL_RATES.sqft_standard.mid;
    case "sqft_premium":
      return DRYWALL_RATES.sqft_premium.mid;
    case "linear_joints":
      return DRYWALL_RATES.linear_joints.mid;
    case "linear_corners":
      return DRYWALL_RATES.linear_corners.mid;
    default:
      return 0;
  }
}

// Get rate range for a line item type
export function getRateRange(
  type: string
): { low: number; mid: number; high: number } | null {
  const rateKey = type as keyof typeof DRYWALL_RATES;
  return DRYWALL_RATES[rateKey] ?? null;
}
