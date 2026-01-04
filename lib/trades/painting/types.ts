import {
  PAINT_COAT_OPTIONS,
  PAINT_QUALITY_OPTIONS,
  SURFACE_PREP_OPTIONS,
  PAINTING_ADDONS,
} from "./constants";
import { PaintingRates, PaintingAddonPrices } from "@/hooks/useProfile";
import { TradeRoomView } from "@/lib/project/types";
import { CustomAddon, AddonUnit } from "@/lib/trades/shared/types";

// Coat count
export type PaintingCoatCount = (typeof PAINT_COAT_OPTIONS)[number]["value"];

// Paint quality
export type PaintingQuality = (typeof PAINT_QUALITY_OPTIONS)[number]["value"];

// Surface prep level
export type PaintingSurfacePrep =
  (typeof SURFACE_PREP_OPTIONS)[number]["value"];

// Addon IDs
export type PaintingAddonId = (typeof PAINTING_ADDONS)[number]["id"];

// Complexity levels
export type PaintingComplexity = "simple" | "standard" | "complex";

// Addon selection
export interface PaintingSelectedAddon {
  id: PaintingAddonId;
  quantity: number;
  total: number;
  // Override fields
  priceOverride?: number;
  hasOverride: boolean;
}

// Complete estimate data
export interface PaintingEstimateData {
  coatCount: PaintingCoatCount;
  paintQuality: PaintingQuality;
  surfacePrep: PaintingSurfacePrep;
  complexity: PaintingComplexity;
  addons: PaintingSelectedAddon[];
  customAddons: CustomAddon[];
  // Square footage can come from shared project rooms or direct entry
  totalSqft: number;
  ceilingSqft: number;
  wallSqft: number;
  // Direct hours entry
  directHours: number;
}

// Totals breakdown
export interface PaintingEstimateTotals {
  totalSqft: number;
  wallSqft: number;
  ceilingSqft: number;
  // Base costs
  laborSubtotal: number;
  materialSubtotal: number;
  prepSubtotal: number;
  // Addons
  addonsSubtotal: number;
  // Before complexity
  subtotal: number;
  // Complexity adjustment
  complexityMultiplier: number;
  complexityAdjustment: number;
  // Final
  total: number;
  // Per-unit costs for display
  costPerSqft: number;
  // Range
  rangeLow: number;
  rangeHigh: number;
}

// Actions for the hook
export interface PaintingEstimateActions {
  setCoatCount: (count: PaintingCoatCount) => void;
  setPaintQuality: (quality: PaintingQuality) => void;
  setSurfacePrep: (prep: PaintingSurfacePrep) => void;
  setComplexity: (complexity: PaintingComplexity) => void;
  setDirectHours: (hours: number) => void;
  // Addon management
  toggleAddon: (addonId: PaintingAddonId, quantity?: number) => void;
  updateAddonQuantity: (addonId: PaintingAddonId, quantity: number) => void;
  removeAddon: (addonId: PaintingAddonId) => void;
  setAddonPriceOverride: (
    addonId: PaintingAddonId,
    override: number | undefined
  ) => void;
  // Custom addon management
  addCustomAddon: (
    name: string,
    price: number,
    unit: AddonUnit,
    quantity?: number
  ) => void;
  updateCustomAddon: (
    id: string,
    updates: Partial<Omit<CustomAddon, "id" | "isCustom" | "total">>
  ) => void;
  removeCustomAddon: (id: string) => void;
  // Square footage (for standalone or override)
  setTotalSqft: (sqft: number) => void;
  setWallSqft: (sqft: number) => void;
  setCeilingSqft: (sqft: number) => void;
  // Set from shared project rooms
  setFromRooms: (rooms: TradeRoomView[]) => void;
  // Reset
  reset: () => void;
}

// Full hook return
export interface UsePaintingEstimateReturn
  extends PaintingEstimateData,
    PaintingEstimateActions {
  totals: PaintingEstimateTotals;
  defaultRates: PaintingRates;
  defaultAddonPrices: PaintingAddonPrices;
  hourlyRate: number;
}
