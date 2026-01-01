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

// Material/labor rate split (industry standards ~30% material / 70% labor for finishing)
export const DRYWALL_MATERIAL_LABOR_RATES = {
  sqft_standard: {
    material: { low: 0.1, mid: 0.15, high: 0.2 },
    labor: { low: 0.25, mid: 0.35, high: 0.45 },
  },
  sqft_premium: {
    material: { low: 0.15, mid: 0.22, high: 0.3 },
    labor: { low: 0.6, mid: 0.68, high: 0.8 },
  },
  linear_joints: {
    material: { low: 0.4, mid: 0.47, high: 0.55 },
    labor: { low: 0.82, mid: 0.88, high: 0.93 },
  },
  linear_corners: {
    material: { low: 1.5, mid: 1.74, high: 2.0 },
    labor: { low: 2.46, mid: 2.61, high: 2.76 },
  },
} as const;

// Get material rate for a line item type
export function getMaterialRate(type: string): number {
  const rates =
    DRYWALL_MATERIAL_LABOR_RATES[
      type as keyof typeof DRYWALL_MATERIAL_LABOR_RATES
    ];
  return rates?.material.mid ?? 0;
}

// Get labor rate for a line item type
export function getLaborRate(type: string): number {
  const rates =
    DRYWALL_MATERIAL_LABOR_RATES[
      type as keyof typeof DRYWALL_MATERIAL_LABOR_RATES
    ];
  return rates?.labor.mid ?? 0;
}

// Get material/labor rate ranges for a line item type
export function getMaterialLaborRateRanges(type: string): {
  material: { low: number; mid: number; high: number };
  labor: { low: number; mid: number; high: number };
} | null {
  const rates =
    DRYWALL_MATERIAL_LABOR_RATES[
      type as keyof typeof DRYWALL_MATERIAL_LABOR_RATES
    ];
  return rates ?? null;
}

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

// ============================================
// FINISHING MATERIALS (for manual material entry)
// ============================================

// Joint compound (mud) types
export const FINISHING_MUD_TYPES = [
  {
    id: "all_purpose",
    label: "All-Purpose (Green)",
    description: "Standard pre-mixed compound for all coats",
    unit: "bucket",
    unitSize: "4.5 gal",
    unitWeight: 61, // lbs
    price: 18.0, // per bucket
    coverageSqft: 450, // sqft per bucket (varies by application)
  },
  {
    id: "lightweight",
    label: "Lightweight (Blue)",
    description: "Easier to sand, less shrinkage",
    unit: "bucket",
    unitSize: "4.5 gal",
    unitWeight: 36, // lbs
    price: 22.0,
    coverageSqft: 475,
  },
  {
    id: "topping",
    label: "Topping (Purple)",
    description: "Final coat only, smoothest finish",
    unit: "bucket",
    unitSize: "4.5 gal",
    unitWeight: 54, // lbs
    price: 20.0,
    coverageSqft: 500,
  },
  {
    id: "hot_mud_20",
    label: "Setting Compound - 20 min",
    description: "Fast-setting, great for repairs",
    unit: "bag",
    unitSize: "18 lb",
    unitWeight: 18,
    price: 12.0,
    coverageSqft: 75,
  },
  {
    id: "hot_mud_45",
    label: "Setting Compound - 45 min",
    description: "Medium-setting for larger repairs",
    unit: "bag",
    unitSize: "18 lb",
    unitWeight: 18,
    price: 12.0,
    coverageSqft: 75,
  },
  {
    id: "hot_mud_90",
    label: "Setting Compound - 90 min",
    description: "Slow-setting, more working time",
    unit: "bag",
    unitSize: "18 lb",
    unitWeight: 18,
    price: 12.0,
    coverageSqft: 75,
  },
] as const;

// Tape types
export const FINISHING_TAPE_TYPES = [
  {
    id: "paper_tape",
    label: "Paper Tape",
    description: "Standard paper drywall tape",
    unit: "roll",
    unitLength: 500, // feet per roll
    price: 5.5,
    coveragePerSqft: 0.37, // linear ft of tape per sqft of wall
  },
  {
    id: "mesh_tape",
    label: "Mesh Tape (Self-Adhesive)",
    description: "Fiberglass mesh, easy to apply",
    unit: "roll",
    unitLength: 300, // feet per roll
    price: 8.0,
    coveragePerSqft: 0.37,
  },
  {
    id: "paper_faced_metal",
    label: "Paper-Faced Metal Corner Tape",
    description: "For outside corners, flexible",
    unit: "roll",
    unitLength: 100, // feet per roll
    price: 25.0,
    coveragePerSqft: 0, // used for corners, not area
  },
] as const;

// Corner bead types
export const FINISHING_CORNER_BEAD_TYPES = [
  {
    id: "metal_corner",
    label: "Metal Corner Bead",
    description: "Standard galvanized steel, nail-on",
    unit: "piece",
    unitLength: 8, // feet per piece
    price: 3.5,
  },
  {
    id: "vinyl_corner",
    label: "Vinyl Corner Bead",
    description: "Plastic, won't dent or rust",
    unit: "piece",
    unitLength: 8,
    price: 2.5,
  },
  {
    id: "paper_faced_corner",
    label: "Paper-Faced Corner Bead",
    description: "Easy to finish, no nail pops",
    unit: "piece",
    unitLength: 8,
    price: 4.5,
  },
  {
    id: "bullnose_corner",
    label: "Bullnose Corner Bead",
    description: "Rounded profile for modern look",
    unit: "piece",
    unitLength: 8,
    price: 5.0,
  },
  {
    id: "j_bead",
    label: "J-Bead / L-Bead",
    description: "For edges and transitions",
    unit: "piece",
    unitLength: 10,
    price: 4.0,
  },
  {
    id: "archway_bead",
    label: "Flexible Archway Bead",
    description: "For curved surfaces and arches",
    unit: "piece",
    unitLength: 8,
    price: 12.0,
  },
] as const;

// Other finishing materials
export const FINISHING_OTHER_MATERIALS = [
  {
    id: "primer_pva",
    label: "PVA Primer",
    description: "Drywall primer, seals mud",
    unit: "gallon",
    price: 14.0,
    coverageSqft: 350,
  },
  {
    id: "primer_shellac",
    label: "Shellac Primer",
    description: "Stain-blocking primer",
    unit: "gallon",
    price: 45.0,
    coverageSqft: 300,
  },
  {
    id: "sandpaper_120",
    label: "Sandpaper 120-grit",
    description: "For first sanding pass",
    unit: "pack",
    price: 8.0,
  },
  {
    id: "sandpaper_150",
    label: "Sandpaper 150-grit",
    description: "For final sanding",
    unit: "pack",
    price: 8.0,
  },
  {
    id: "sanding_sponge",
    label: "Sanding Sponge",
    description: "For detail sanding",
    unit: "each",
    price: 4.0,
  },
] as const;

// Combined materials list for easy iteration
export const FINISHING_MATERIALS = [
  ...FINISHING_MUD_TYPES.map((m) => ({ ...m, category: "mud" as const })),
  ...FINISHING_TAPE_TYPES.map((m) => ({ ...m, category: "tape" as const })),
  ...FINISHING_CORNER_BEAD_TYPES.map((m) => ({
    ...m,
    category: "corner_bead" as const,
  })),
  ...FINISHING_OTHER_MATERIALS.map((m) => ({
    ...m,
    category: "other" as const,
  })),
] as const;

// Material categories for UI grouping
export const FINISHING_MATERIAL_CATEGORIES = [
  { id: "mud", label: "Joint Compound", icon: "Paintbrush" },
  { id: "tape", label: "Tape", icon: "Minus" },
  { id: "corner_bead", label: "Corner Bead", icon: "CornerDownRight" },
  { id: "other", label: "Other Materials", icon: "Package" },
] as const;

// Helper to get material by ID
export function getFinishingMaterial(materialId: string) {
  return FINISHING_MATERIALS.find((m) => m.id === materialId);
}

// Helper to get materials by category
export function getFinishingMaterialsByCategory(
  category: "mud" | "tape" | "corner_bead" | "other"
) {
  return FINISHING_MATERIALS.filter((m) => m.category === category);
}
