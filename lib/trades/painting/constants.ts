// Painting trade constants

// Paint coat options
export const PAINT_COAT_OPTIONS = [
  {
    value: 1,
    label: "1 Coat",
    description: "Touch-up or color refresh on existing paint",
    multiplier: 0.7,
  },
  {
    value: 2,
    label: "2 Coats",
    description: "Standard coverage - primer + 1 coat or 2 finish coats",
    multiplier: 1.0,
  },
  {
    value: 3,
    label: "3 Coats",
    description:
      "Full coverage - primer + 2 coats for new drywall or color changes",
    multiplier: 1.35,
  },
] as const;

// Paint quality tiers
export const PAINT_QUALITY_OPTIONS = [
  {
    value: "standard",
    label: "Standard",
    description: "Builder-grade paint, good for rentals or quick refreshes",
    materialMultiplier: 1.0,
  },
  {
    value: "premium",
    label: "Premium",
    description: "Higher quality paint with better coverage and durability",
    materialMultiplier: 1.4,
  },
  {
    value: "specialty",
    label: "Specialty",
    description: "Designer or specialty paint (low-VOC, anti-microbial, etc.)",
    materialMultiplier: 2.0,
  },
] as const;

// Surface preparation levels
export const SURFACE_PREP_OPTIONS = [
  {
    value: "none",
    label: "Minimal",
    description: "Clean walls, minor touch-up only",
    additionalCostPerSqft: 0,
  },
  {
    value: "light",
    label: "Light Prep",
    description: "Fill small holes, light sanding, tape removal",
    additionalCostPerSqft: 0.15,
  },
  {
    value: "heavy",
    label: "Heavy Prep",
    description: "Extensive repairs, texture matching, priming",
    additionalCostPerSqft: 0.35,
  },
] as const;

// Painting add-ons
export const PAINTING_ADDONS = [
  {
    id: "trim_paint",
    label: "Trim & Baseboards",
    price: 2.5,
    unit: "linear_ft",
  },
  { id: "door_paint", label: "Door Painting", price: 75, unit: "each" },
  { id: "cabinet_paint", label: "Cabinet Painting", price: 150, unit: "each" },
  { id: "ceiling_texture", label: "Ceiling Texture", price: 0.5, unit: "sqft" },
  {
    id: "accent_wall",
    label: "Accent Wall (different color)",
    price: 0.25,
    unit: "sqft",
  },
  {
    id: "wallpaper_removal",
    label: "Wallpaper Removal",
    price: 1.5,
    unit: "sqft",
  },
  {
    id: "high_ceiling",
    label: "High Ceiling Premium (10ft+)",
    price: 0.2,
    unit: "sqft",
  },
  {
    id: "furniture_moving",
    label: "Furniture Moving",
    price: 100,
    unit: "flat",
  },
] as const;

// Industry-standard painting rates (2024 market research)
// These are contractor rates per sqft of wall/ceiling coverage
export const PAINTING_RATES = {
  // Labor rates per sqft (includes standard 2-coat coverage)
  labor_per_sqft: { low: 1.25, mid: 1.75, high: 2.5 },
  // Material rates per sqft (paint + supplies)
  material_per_sqft: { low: 0.35, mid: 0.5, high: 0.75 },
  // Ceiling rate modifier (ceilings often cost more)
  ceiling_modifier: { low: 1.1, mid: 1.2, high: 1.35 },
} as const;

// Complexity multipliers for painting
export const PAINTING_COMPLEXITY_MULTIPLIERS = {
  simple: 0.85, // Open rooms, easy access
  standard: 1.0, // Normal residential
  complex: 1.3, // Lots of trim, tight spaces, high detail
} as const;

// Helper to get coat multiplier
export function getCoatMultiplier(coats: number): number {
  const option = PAINT_COAT_OPTIONS.find((o) => o.value === coats);
  return option?.multiplier ?? 1.0;
}

// Helper to get quality multiplier
export function getQualityMultiplier(quality: string): number {
  const option = PAINT_QUALITY_OPTIONS.find((o) => o.value === quality);
  return option?.materialMultiplier ?? 1.0;
}

// Helper to get prep cost per sqft
export function getPrepCostPerSqft(prep: string): number {
  const option = SURFACE_PREP_OPTIONS.find((o) => o.value === prep);
  return option?.additionalCostPerSqft ?? 0;
}

// Helper to get complexity multiplier
export function getComplexityMultiplier(complexity: string): number {
  const key = complexity as keyof typeof PAINTING_COMPLEXITY_MULTIPLIERS;
  return PAINTING_COMPLEXITY_MULTIPLIERS[key] ?? 1.0;
}
