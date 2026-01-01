import {
  DRYWALL_SHEET_SIZES,
  DRYWALL_SHEET_TYPES,
  CEILING_HEIGHT_FACTORS,
  HANGING_ADDONS,
} from "./constants";
import {
  DrywallHangingRates,
  DrywallHangingAddonPrices,
} from "@/hooks/useProfile";

// Input mode
export type HangingInputMode = "calculator" | "direct" | "labor_only";

// Pricing method
export type HangingPricingMethod = "per_sheet" | "per_sqft";

// Sheet type IDs
export type DrywallSheetTypeId = (typeof DRYWALL_SHEET_TYPES)[number]["id"];

// Sheet size
export type DrywallSheetSize = (typeof DRYWALL_SHEET_SIZES)[number]["value"];

// Ceiling height factor
export type CeilingHeightFactor =
  (typeof CEILING_HEIGHT_FACTORS)[number]["value"];

// Hanging addon IDs
export type HangingAddonId = (typeof HANGING_ADDONS)[number]["id"];

// Complexity levels
export type HangingComplexity = "simple" | "standard" | "complex";

// Room shape
export type RoomShape = "rectangular" | "l_shape" | "custom";

// Wall segment for custom rooms
export interface WallSegment {
  id: string;
  lengthFeet: number;
  lengthInches: number;
  label: string;
  sqft: number; // calculated
}

// L-shape dimensions
export interface LShapeDimensions {
  // Main section
  mainLengthFeet: number;
  mainLengthInches: number;
  mainWidthFeet: number;
  mainWidthInches: number;
  // Extension section
  extLengthFeet: number;
  extLengthInches: number;
  extWidthFeet: number;
  extWidthInches: number;
}

// Opening (door/window)
export interface HangingOpening {
  id: string;
  presetId: string | "custom";
  label: string;
  width: number; // inches
  height: number; // inches
  quantity: number;
  sqft: number; // calculated per opening
  totalSqft: number; // sqft * quantity
}

// Room for calculator mode
export interface HangingRoom {
  id: string;
  name: string;
  shape: RoomShape;
  // Rectangular dimensions (used when shape="rectangular")
  lengthFeet: number;
  lengthInches: number;
  widthFeet: number;
  widthInches: number;
  heightFeet: number;
  heightInches: number;
  // L-shape dimensions (used when shape="l_shape")
  lShapeDimensions?: LShapeDimensions;
  // Custom walls (used when shape="custom")
  customWalls: WallSegment[];
  customCeilingSqft?: number;
  // Common fields
  includeCeiling: boolean;
  doors: HangingOpening[];
  windows: HangingOpening[];
  // Calculated values
  wallSqft: number;
  ceilingSqft: number;
  openingsSqft: number;
  totalSqft: number;
}

// Sheet entry (for direct mode or calculated result)
export interface HangingSheetEntry {
  id: string;
  typeId: DrywallSheetTypeId;
  size: DrywallSheetSize;
  quantity: number;
  materialCost: number; // per sheet (base calculated cost)
  laborCost: number; // per sheet (base calculated cost)
  totalPerSheet: number;
  subtotal: number;
  // Material toggle
  includeMaterial: boolean;
  // Override fields
  materialCostOverride?: number;
  laborCostOverride?: number;
  hasOverride: boolean;
}

// Addon selection
export interface HangingSelectedAddon {
  id: HangingAddonId;
  quantity: number;
  total: number;
  // Override fields
  priceOverride?: number;
  hasOverride: boolean;
}

// Complete estimate data
export interface DrywallHangingEstimateData {
  inputMode: HangingInputMode;
  pricingMethod: HangingPricingMethod;
  clientSuppliesMaterials: boolean; // When true, all sheets labor-only
  directSqft: number; // For labor_only mode - direct sqft entry
  rooms: HangingRoom[];
  sheets: HangingSheetEntry[];
  ceilingFactor: CeilingHeightFactor;
  wasteFactor: number;
  complexity: HangingComplexity;
  addons: HangingSelectedAddon[];
}

// Totals breakdown
export interface HangingEstimateTotals {
  totalSqft: number;
  sheetsNeeded: number;
  materialSubtotal: number;
  laborSubtotal: number;
  addonsSubtotal: number;
  subtotal: number;
  complexityMultiplier: number;
  complexityAdjustment: number;
  total: number;
  // Per-unit costs for display
  costPerSqft: number;
  costPerSheet: number;
}

// Actions for the hook
export interface DrywallHangingEstimateActions {
  // Mode & pricing
  setInputMode: (mode: HangingInputMode) => void;
  setPricingMethod: (method: HangingPricingMethod) => void;
  setClientSuppliesMaterials: (value: boolean) => void;
  setDirectSqft: (sqft: number) => void;
  // Room management (calculator mode)
  addRoom: (name?: string) => string;
  updateRoom: (
    id: string,
    updates: Partial<
      Omit<
        HangingRoom,
        "id" | "wallSqft" | "ceilingSqft" | "openingsSqft" | "totalSqft"
      >
    >
  ) => void;
  removeRoom: (id: string) => void;
  // Custom wall management
  addCustomWall: (roomId: string) => void;
  updateCustomWall: (
    roomId: string,
    wallId: string,
    updates: Partial<Omit<WallSegment, "id" | "sqft">>
  ) => void;
  removeCustomWall: (roomId: string, wallId: string) => void;
  // Opening management
  addOpening: (
    roomId: string,
    type: "doors" | "windows",
    presetId: string,
    quantity?: number
  ) => void;
  addCustomOpening: (
    roomId: string,
    type: "doors" | "windows",
    width: number,
    height: number,
    label: string,
    quantity?: number
  ) => void;
  updateOpening: (
    roomId: string,
    openingId: string,
    updates: Partial<Omit<HangingOpening, "id" | "sqft" | "totalSqft">>
  ) => void;
  removeOpening: (roomId: string, openingId: string) => void;
  // Sheet management
  addSheet: (
    typeId: DrywallSheetTypeId,
    size?: DrywallSheetSize,
    quantity?: number
  ) => void;
  updateSheet: (
    id: string,
    updates: Partial<
      Omit<HangingSheetEntry, "id" | "totalPerSheet" | "subtotal">
    >
  ) => void;
  removeSheet: (id: string) => void;
  calculateSheetsFromRooms: () => void;
  // Set sqft directly (for project wizard integration)
  setSqft: (totalSqft: number) => void;
  // Settings
  setCeilingFactor: (factor: CeilingHeightFactor) => void;
  setWasteFactor: (factor: number) => void;
  setComplexity: (complexity: HangingComplexity) => void;
  // Addons
  toggleAddon: (addonId: HangingAddonId, quantity?: number) => void;
  updateAddonQuantity: (addonId: HangingAddonId, quantity: number) => void;
  removeAddon: (addonId: HangingAddonId) => void;
  // Material toggle and overrides
  setSheetIncludeMaterial: (id: string, include: boolean) => void;
  setSheetMaterialCostOverride: (
    id: string,
    override: number | undefined
  ) => void;
  setSheetLaborCostOverride: (id: string, override: number | undefined) => void;
  setAddonPriceOverride: (
    addonId: HangingAddonId,
    override: number | undefined
  ) => void;
  // Reset
  reset: () => void;
}

// Full hook return type
export interface UseDrywallHangingEstimateReturn
  extends DrywallHangingEstimateData,
    DrywallHangingEstimateActions {
  totals: HangingEstimateTotals;
  // User's default rates (from settings or industry defaults)
  defaultRates: DrywallHangingRates;
  // User's default add-on prices (from settings or defaults)
  defaultAddonPrices: DrywallHangingAddonPrices;
  // User's hourly rate
  hourlyRate: number;
}
