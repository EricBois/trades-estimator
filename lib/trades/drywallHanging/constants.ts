// Sheet sizes (most common first)
export const DRYWALL_SHEET_SIZES = [
  { value: "4x8", label: "4' × 8'", sqft: 32, lengthFt: 8 },
  { value: "4x10", label: "4' × 10'", sqft: 40, lengthFt: 10 },
  { value: "4x12", label: "4' × 12'", sqft: 48, lengthFt: 12 },
] as const;

// Sheet types with thicknesses and default costs
export const DRYWALL_SHEET_TYPES = [
  {
    id: "standard_half",
    label: 'Standard 1/2"',
    thickness: 0.5,
    materialCost: 12,
    laborCost: 10,
    icon: "Square",
  },
  {
    id: "standard_5_8",
    label: 'Standard 5/8"',
    thickness: 0.625,
    materialCost: 15,
    laborCost: 11,
    icon: "Square",
  },
  {
    id: "lightweight_half",
    label: 'Lightweight 1/2"',
    thickness: 0.5,
    materialCost: 14,
    laborCost: 10,
    icon: "Feather",
  },
  {
    id: "moisture_half",
    label: 'Moisture Resistant 1/2"',
    thickness: 0.5,
    materialCost: 18,
    laborCost: 12,
    icon: "Droplet",
  },
  {
    id: "moisture_5_8",
    label: 'Moisture Resistant 5/8"',
    thickness: 0.625,
    materialCost: 20,
    laborCost: 13,
    icon: "Droplet",
  },
  {
    id: "fire_5_8",
    label: 'Fire-Rated (Type X) 5/8"',
    thickness: 0.625,
    materialCost: 16,
    laborCost: 12,
    icon: "Flame",
  },
  {
    id: "soundproof_5_8",
    label: 'Soundproof 5/8"',
    thickness: 0.625,
    materialCost: 55,
    laborCost: 15,
    icon: "Volume2",
  },
  {
    id: "mold_half",
    label: 'Mold Resistant 1/2"',
    thickness: 0.5,
    materialCost: 18,
    laborCost: 12,
    icon: "Shield",
  },
] as const;

// Standard opening presets
export const OPENING_PRESETS = {
  doors: [
    {
      id: "standard_door",
      label: 'Standard Door (36")',
      width: 36,
      height: 80,
      sqft: 20,
    },
    {
      id: "interior_door",
      label: 'Interior Door (32")',
      width: 32,
      height: 80,
      sqft: 17.8,
    },
    {
      id: "double_door",
      label: "Double Door",
      width: 72,
      height: 80,
      sqft: 40,
    },
    {
      id: "sliding_door",
      label: "Sliding Glass Door",
      width: 72,
      height: 80,
      sqft: 40,
    },
  ],
  windows: [
    {
      id: "small_window",
      label: "Small Window (2'×3')",
      width: 24,
      height: 36,
      sqft: 6,
    },
    {
      id: "medium_window",
      label: "Medium Window (3'×4')",
      width: 36,
      height: 48,
      sqft: 12,
    },
    {
      id: "large_window",
      label: "Large Window (4'×5')",
      width: 48,
      height: 60,
      sqft: 20,
    },
    {
      id: "picture_window",
      label: "Picture Window (6'×4')",
      width: 72,
      height: 48,
      sqft: 24,
    },
  ],
} as const;

// Ceiling height factors (labor multipliers for high ceilings)
export const CEILING_HEIGHT_FACTORS = [
  { value: "standard", label: "Standard (8')", multiplier: 1.0 },
  { value: "nine_ft", label: "9' Ceilings", multiplier: 1.1 },
  { value: "ten_ft", label: "10' Ceilings", multiplier: 1.15 },
  { value: "cathedral", label: "Cathedral/Vaulted", multiplier: 1.35 },
] as const;

// Waste factor options
export const WASTE_FACTORS = [
  { value: 0.1, label: "10% - Simple layouts" },
  { value: 0.12, label: "12% - Standard (Recommended)" },
  { value: 0.15, label: "15% - Complex layouts" },
] as const;

// Installation complexity (overall job complexity multiplier)
export const HANGING_COMPLEXITY_MULTIPLIERS = {
  simple: 0.85,
  standard: 1.0,
  complex: 1.25,
} as const;

// Add-ons specific to hanging
export const HANGING_ADDONS = [
  { id: "delivery", label: "Delivery", price: 75, unit: "flat" },
  { id: "stocking", label: "Stocking (carry in)", price: 0.1, unit: "sqft" },
  { id: "debris_removal", label: "Debris Removal", price: 150, unit: "flat" },
  { id: "corner_bead", label: "Corner Bead", price: 4.5, unit: "linear_ft" },
  { id: "insulation", label: "Insulation (R-13)", price: 1.2, unit: "sqft" },
  { id: "vapor_barrier", label: "Vapor Barrier", price: 0.4, unit: "sqft" },
] as const;

// Pricing methods
export const PRICING_METHODS = [
  {
    value: "per_sheet",
    label: "Per Sheet",
    description: "Price per sheet installed",
  },
  {
    value: "per_sqft",
    label: "Per Sqft",
    description: "Price per square foot",
  },
] as const;

// Room shapes
export const ROOM_SHAPES = [
  { value: "rectangular", label: "Rectangular", icon: "Square" },
  { value: "l_shape", label: "L-Shape", icon: "CornerUpRight" },
  { value: "custom", label: "Custom", icon: "Layers" },
] as const;

// Default L-shape dimensions
export const DEFAULT_L_SHAPE_DIMENSIONS = {
  mainLengthFeet: 12,
  mainLengthInches: 0,
  mainWidthFeet: 10,
  mainWidthInches: 0,
  extLengthFeet: 8,
  extLengthInches: 0,
  extWidthFeet: 6,
  extWidthInches: 0,
} as const;

// Industry rate ranges (for settings display)
export const HANGING_RATES = {
  labor_per_sheet: { low: 8, mid: 12, high: 18 },
  labor_per_sqft: { low: 0.5, mid: 0.85, high: 1.5 },
  material_markup: { low: 0, mid: 15, high: 30 }, // percentage
} as const;

// Helper to get sheet type by ID
export function getSheetType(id: string) {
  return DRYWALL_SHEET_TYPES.find((t) => t.id === id);
}

// Helper to get sheet size by value
export function getSheetSize(value: string) {
  return DRYWALL_SHEET_SIZES.find((s) => s.value === value);
}

// Helper to get opening preset
export function getOpeningPreset(type: "doors" | "windows", id: string) {
  return OPENING_PRESETS[type].find((p) => p.id === id);
}

// Helper to get ceiling height factor
export function getCeilingFactor(value: string) {
  return CEILING_HEIGHT_FACTORS.find((f) => f.value === value);
}

// Helper to get rate range for display
export function getHangingRateRange(rateType: keyof typeof HANGING_RATES) {
  return HANGING_RATES[rateType];
}
