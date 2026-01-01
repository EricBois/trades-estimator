import { DRYWALL_LINE_ITEM_TYPES, DRYWALL_ADDONS } from "./constants";
import { DrywallFinishingRates, DrywallAddonPrices } from "@/hooks/useProfile";

// Line item type values
export type DrywallLineItemType =
  (typeof DRYWALL_LINE_ITEM_TYPES)[number]["value"];

// Add-on IDs
export type DrywallAddonId = (typeof DRYWALL_ADDONS)[number]["id"];

// Finish levels (3, 4, or 5)
export type DrywallFinishLevel = 3 | 4 | 5;

// Complexity levels (matches WIZARD_COMPLEXITY_LEVELS values)
export type DrywallComplexity = "simple" | "standard" | "complex";

// A single line item in the estimate
export interface DrywallLineItem {
  id: string;
  type: DrywallLineItemType;
  description: string;
  quantity: number;
  rate: number; // per-unit rate
  total: number; // quantity * rate
}

// Selected add-on with quantity (for sqft-based add-ons)
export interface DrywallSelectedAddon {
  id: DrywallAddonId;
  quantity: number;
  total: number;
}

// Complete drywall estimate data
export interface DrywallEstimateData {
  finishLevel: DrywallFinishLevel;
  lineItems: DrywallLineItem[];
  addons: DrywallSelectedAddon[];
  complexity: DrywallComplexity;
}

// Calculated totals
export interface DrywallEstimateTotals {
  lineItemsSubtotal: number;
  addonsSubtotal: number;
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
  addLineItem: (type: DrywallLineItemType) => void;
  updateLineItem: (
    id: string,
    updates: Partial<Omit<DrywallLineItem, "id" | "total">>
  ) => void;
  removeLineItem: (id: string) => void;
  toggleAddon: (addonId: DrywallAddonId, quantity?: number) => void;
  removeAddon: (addonId: DrywallAddonId) => void;
  updateAddonQuantity: (addonId: DrywallAddonId, quantity: number) => void;
  setComplexity: (complexity: DrywallComplexity) => void;
  // Set sqft directly (for project wizard integration)
  setSqft: (totalSqft: number) => void;
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
