// Shared types for trade addons

export const ADDON_UNITS = ["flat", "sqft", "linear_ft", "each"] as const;
export type AddonUnit = (typeof ADDON_UNITS)[number];

// Custom addon created by user during estimate
export interface CustomAddon {
  id: string;
  name: string;
  price: number;
  unit: AddonUnit;
  quantity: number;
  total: number;
  isCustom: true;
}
