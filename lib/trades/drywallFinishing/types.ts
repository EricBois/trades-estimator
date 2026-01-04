import {
  DRYWALL_LINE_ITEM_TYPES,
  DRYWALL_ADDONS,
  FINISHING_MUD_TYPES,
  FINISHING_TAPE_TYPES,
  FINISHING_CORNER_BEAD_TYPES,
  FINISHING_OTHER_MATERIALS,
  FINISHING_MATERIAL_CATEGORIES,
} from "./constants";
import { DrywallFinishingRates, DrywallAddonPrices } from "@/hooks/useProfile";
import { CustomAddon, AddonUnit } from "@/lib/trades/shared/types";

// Line item type values
export type DrywallLineItemType =
  (typeof DRYWALL_LINE_ITEM_TYPES)[number]["value"];

// Add-on IDs
export type DrywallAddonId = (typeof DRYWALL_ADDONS)[number]["id"];

// Finish levels (3, 4, or 5)
export type DrywallFinishLevel = 3 | 4 | 5;

// Complexity levels (matches WIZARD_COMPLEXITY_LEVELS values)
export type DrywallComplexity = "simple" | "standard" | "complex";

// ============================================
// FINISHING MATERIALS TYPES
// ============================================

// Material type IDs
export type FinishingMudTypeId = (typeof FINISHING_MUD_TYPES)[number]["id"];
export type FinishingTapeTypeId = (typeof FINISHING_TAPE_TYPES)[number]["id"];
export type FinishingCornerBeadTypeId =
  (typeof FINISHING_CORNER_BEAD_TYPES)[number]["id"];
export type FinishingOtherMaterialId =
  (typeof FINISHING_OTHER_MATERIALS)[number]["id"];
export type FinishingMaterialCategory =
  (typeof FINISHING_MATERIAL_CATEGORIES)[number]["id"];

// Union of all material IDs
export type FinishingMaterialId =
  | FinishingMudTypeId
  | FinishingTapeTypeId
  | FinishingCornerBeadTypeId
  | FinishingOtherMaterialId;

// A material entry in the estimate
export interface FinishingMaterialEntry {
  id: string; // unique instance id
  materialId: FinishingMaterialId | string; // preset ID or custom material UUID
  isCustom: boolean; // true for custom materials from database
  category: FinishingMaterialCategory;
  name: string; // display name (from preset or custom material)
  unit: string; // unit of measurement
  quantity: number;
  unitPrice: number; // base price from constants or custom material
  // Override fields
  priceOverride?: number;
  hasOverride: boolean;
  // Calculated
  subtotal: number;
}

// A single line item in the estimate
export interface DrywallLineItem {
  id: string;
  type: DrywallLineItemType;
  description: string;
  quantity: number;
  // Material/labor split
  materialRate: number; // per-unit material cost
  laborRate: number; // per-unit labor cost
  rate: number; // materialRate + laborRate (for display/backwards compat)
  // Material toggle
  includeMaterial: boolean;
  // Override fields
  materialRateOverride?: number;
  laborRateOverride?: number;
  hasOverride: boolean;
  // Calculated totals
  materialTotal: number; // materialRate * quantity (if includeMaterial)
  laborTotal: number; // laborRate * quantity
  total: number; // materialTotal + laborTotal
}

// Selected add-on with quantity (for sqft-based add-ons)
export interface DrywallSelectedAddon {
  id: DrywallAddonId;
  quantity: number;
  total: number;
  // Override fields
  priceOverride?: number;
  hasOverride: boolean;
}

// Complete drywall estimate data
export interface DrywallEstimateData {
  finishLevel: DrywallFinishLevel;
  lineItems: DrywallLineItem[];
  addons: DrywallSelectedAddon[];
  customAddons: CustomAddon[];
  materials: FinishingMaterialEntry[]; // Manual material entries
  complexity: DrywallComplexity;
  directHours: number; // For labor-only mode - direct hours entry
}

// Calculated totals
export interface DrywallEstimateTotals {
  // Material/labor breakdown
  materialSubtotal: number; // From line items with includeMaterial
  laborSubtotal: number;
  lineItemsSubtotal: number;
  addonsSubtotal: number;
  materialsSubtotal: number; // From manual material entries
  subtotal: number;
  complexityMultiplier: number;
  complexityAdjustment: number;
  total: number;
  // Range for estimates (using rate ranges)
  range: {
    low: number;
    high: number;
  };
}

// Full drywall estimate with totals
export interface DrywallEstimate extends DrywallEstimateData {
  totals: DrywallEstimateTotals;
}

// Actions for the hook
export interface DrywallEstimateActions {
  setFinishLevel: (level: DrywallFinishLevel) => void;
  setDirectHours: (hours: number) => void;
  addLineItem: (type: DrywallLineItemType) => void;
  updateLineItem: (
    id: string,
    updates: Partial<
      Omit<DrywallLineItem, "id" | "total" | "materialTotal" | "laborTotal">
    >
  ) => void;
  removeLineItem: (id: string) => void;
  toggleAddon: (addonId: DrywallAddonId, quantity?: number) => void;
  removeAddon: (addonId: DrywallAddonId) => void;
  updateAddonQuantity: (addonId: DrywallAddonId, quantity: number) => void;
  setAddonPriceOverride: (
    addonId: DrywallAddonId,
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
  setComplexity: (complexity: DrywallComplexity) => void;
  // Set sqft directly (for project wizard integration)
  setSqft: (totalSqft: number) => void;
  // Material toggle and overrides
  setLineItemIncludeMaterial: (id: string, include: boolean) => void;
  setLineItemMaterialOverride: (
    id: string,
    override: number | undefined
  ) => void;
  setLineItemLaborOverride: (id: string, override: number | undefined) => void;
  // Manual material management
  addMaterial: (materialId: FinishingMaterialId, quantity?: number) => void;
  addCustomMaterial: (
    customMaterialId: string,
    name: string,
    category: FinishingMaterialCategory,
    unit: string,
    basePrice: number,
    quantity?: number
  ) => void;
  updateMaterial: (
    id: string,
    updates: Partial<Omit<FinishingMaterialEntry, "id" | "subtotal">>
  ) => void;
  removeMaterial: (id: string) => void;
  setMaterialPriceOverride: (id: string, override: number | undefined) => void;
  reset: () => void;
}

// Full hook return type
export interface UseDrywallFinishingEstimateReturn
  extends DrywallEstimate,
    DrywallEstimateActions {
  // User's default rates (from settings or industry defaults)
  defaultRates: DrywallFinishingRates;
  // User's default add-on prices (from settings or defaults)
  defaultAddonPrices: DrywallAddonPrices;
  // User's hourly rate
  hourlyRate: number;
}
