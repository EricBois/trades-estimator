"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DRYWALL_ADDONS,
  DRYWALL_COMPLEXITY_MULTIPLIERS,
  DRYWALL_FINISH_LEVELS,
  getRateRange,
} from "@/lib/trades/drywallFinishing/constants";
import {
  getUserDrywallRate,
  getUserDrywallRates,
  getUserAddonPrice,
  getUserAddonPrices,
  DrywallRateType,
} from "@/lib/trades/drywallFinishing/rates";
import { CustomRates } from "@/hooks/useProfile";
import {
  DrywallLineItem,
  DrywallSelectedAddon,
  DrywallFinishLevel,
  DrywallComplexity,
  DrywallLineItemType,
  DrywallAddonId,
  DrywallEstimateTotals,
  UseDrywallFinishingEstimateReturn,
} from "@/lib/trades/drywallFinishing/types";

// Generate unique ID for line items
function generateId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useDrywallFinishingEstimate(): UseDrywallFinishingEstimateReturn {
  const { profile } = useAuth();

  // State
  const [finishLevel, setFinishLevel] = useState<DrywallFinishLevel>(4);
  const [lineItems, setLineItems] = useState<DrywallLineItem[]>([]);
  const [addons, setAddons] = useState<DrywallSelectedAddon[]>([]);
  const [complexity, setComplexity] = useState<DrywallComplexity>("standard");

  // Get hourly rate from profile or use default
  const hourlyRate = profile?.hourly_rate ?? 75;

  // Get custom rates from profile (cast from Json to CustomRates)
  const customRates = profile?.custom_rates as CustomRates | null | undefined;

  // Get user's default rates (with fallback to industry defaults)
  const defaultRates = useMemo(
    () => getUserDrywallRates(customRates),
    [customRates]
  );

  // Get user's default add-on prices (with fallback to defaults)
  const defaultAddonPrices = useMemo(
    () => getUserAddonPrices(customRates),
    [customRates]
  );

  // Helper to get the user's rate for a line item type
  const getRateForType = useCallback(
    (type: DrywallLineItemType): number => {
      if (type === "hourly") return hourlyRate;
      if (type === "addon") return 0;
      // For sqft and linear types, use user's custom rate or industry default
      return getUserDrywallRate(type as DrywallRateType, customRates);
    },
    [hourlyRate, customRates]
  );

  // Add a new line item
  const addLineItem = useCallback(
    (type: DrywallLineItemType) => {
      const rate = getRateForType(type);
      const newItem: DrywallLineItem = {
        id: generateId(),
        type,
        description: "",
        quantity: type === "hourly" ? 1 : 100, // Default 1 hour or 100 sqft
        rate,
        total: type === "hourly" ? rate : rate * 100,
      };
      setLineItems((prev) => [...prev, newItem]);
    },
    [getRateForType]
  );

  // Update a line item
  const updateLineItem = useCallback(
    (id: string, updates: Partial<Omit<DrywallLineItem, "id" | "total">>) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, ...updates };
          // Recalculate total
          updated.total = updated.quantity * updated.rate;
          return updated;
        })
      );
    },
    []
  );

  // Remove a line item
  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Toggle an addon (add/remove)
  const toggleAddon = useCallback(
    (addonId: DrywallAddonId, quantity: number = 1) => {
      setAddons((prev) => {
        const existing = prev.find((a) => a.id === addonId);
        if (existing) {
          // Remove it
          return prev.filter((a) => a.id !== addonId);
        }
        // Add it
        const addonDef = DRYWALL_ADDONS.find((a) => a.id === addonId);
        if (!addonDef) return prev;

        // Use custom price from settings or default
        const price = getUserAddonPrice(addonId, customRates);
        const total =
          addonDef.unit === "sqft" || addonDef.unit === "each"
            ? price * quantity
            : price;

        return [...prev, { id: addonId, quantity, total }];
      });
    },
    [customRates]
  );

  // Remove an addon
  const removeAddon = useCallback((addonId: DrywallAddonId) => {
    setAddons((prev) => prev.filter((a) => a.id !== addonId));
  }, []);

  // Update addon quantity
  const updateAddonQuantity = useCallback(
    (addonId: DrywallAddonId, quantity: number) => {
      setAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== addonId) return addon;
          const addonDef = DRYWALL_ADDONS.find((a) => a.id === addonId);
          if (!addonDef) return addon;

          // Use custom price from settings or default
          const price = getUserAddonPrice(addonId, customRates);
          const total =
            addonDef.unit === "sqft" || addonDef.unit === "each"
              ? price * quantity
              : price;

          return { ...addon, quantity, total };
        })
      );
    },
    [customRates]
  );

  // Set sqft directly and create/update a sqft line item (for project wizard)
  const setSqft = useCallback(
    (totalSqft: number) => {
      if (totalSqft <= 0) {
        return;
      }

      // Get rate from finish level
      const finishLevelInfo = DRYWALL_FINISH_LEVELS.find(
        (l) => l.value === finishLevel
      );
      const rate = finishLevelInfo?.sqftRate ?? 0.55; // Default to level 4 rate

      // Create or update a sqft_standard line item
      setLineItems((prev) => {
        // Find existing sqft line item
        const existingIndex = prev.findIndex(
          (item) =>
            item.type === "sqft_standard" || item.type === "sqft_premium"
        );

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: totalSqft,
            rate,
            total: totalSqft * rate,
          };
          return updated;
        }

        // Create new sqft line item
        const newItem: DrywallLineItem = {
          id: generateId(),
          type: "sqft_standard",
          description: "Wall & Ceiling Finishing",
          quantity: totalSqft,
          rate,
          total: totalSqft * rate,
        };
        return [newItem, ...prev];
      });
    },
    [finishLevel]
  );

  // Reset all state
  const reset = useCallback(() => {
    setFinishLevel(4);
    setLineItems([]);
    setAddons([]);
    setComplexity("standard");
  }, []);

  // Calculate totals
  const totals = useMemo((): DrywallEstimateTotals => {
    // Line items subtotal
    const lineItemsSubtotal = lineItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // Addons subtotal
    const addonsSubtotal = addons.reduce((sum, addon) => sum + addon.total, 0);

    // Subtotal
    const subtotal = lineItemsSubtotal + addonsSubtotal;

    // Complexity adjustment
    const complexityMultiplier = DRYWALL_COMPLEXITY_MULTIPLIERS[complexity];
    const complexityAdjustment = subtotal * (complexityMultiplier - 1);

    // Total
    const total = subtotal + complexityAdjustment;

    // Calculate range based on rate ranges
    let rangeLow = 0;
    let rangeHigh = 0;

    for (const item of lineItems) {
      const rateRange = getRateRange(item.type);
      if (rateRange) {
        rangeLow += item.quantity * rateRange.low;
        rangeHigh += item.quantity * rateRange.high;
      } else if (item.type === "hourly") {
        // Hourly has fixed rate from profile
        rangeLow += item.total;
        rangeHigh += item.total;
      } else {
        // Unknown type, use actual
        rangeLow += item.total;
        rangeHigh += item.total;
      }
    }

    // Add addons to range (fixed pricing)
    rangeLow += addonsSubtotal;
    rangeHigh += addonsSubtotal;

    // Apply complexity to range
    rangeLow = rangeLow * complexityMultiplier;
    rangeHigh = rangeHigh * complexityMultiplier;

    return {
      lineItemsSubtotal,
      addonsSubtotal,
      subtotal,
      complexityMultiplier,
      complexityAdjustment,
      total,
      range: {
        low: Math.round(rangeLow),
        high: Math.round(rangeHigh),
      },
    };
  }, [lineItems, addons, complexity]);

  return {
    // Data
    finishLevel,
    lineItems,
    addons,
    complexity,
    totals,
    defaultRates,
    defaultAddonPrices,
    hourlyRate,
    // Actions
    setFinishLevel,
    addLineItem,
    updateLineItem,
    removeLineItem,
    toggleAddon,
    removeAddon,
    updateAddonQuantity,
    setComplexity,
    setSqft,
    reset,
  };
}
