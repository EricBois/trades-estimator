// Framing trade types

export interface FramingEstimateData {
  linearFeet: number;
  sqft: number;
  complexity: "simple" | "standard" | "complex";
  studSpacing: 16 | 24;
  includeCeiling: boolean;
  includeFloor: boolean;
}

export interface FramingAddon {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  total: number;
}

export interface FramingEstimateTotals {
  laborCost: number;
  materialCost: number;
  addonsCost: number;
  subtotal: number;
  complexityAdjustment: number;
  total: number;
}
