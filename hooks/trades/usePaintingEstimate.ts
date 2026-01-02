"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PAINTING_ADDONS } from "@/lib/trades/painting/constants";
import {
  getUserPaintingRates,
  getUserPaintingAddonPrices,
  getUserPaintingAddonPrice,
} from "@/lib/trades/painting/rates";
import { calculatePaintingEstimate } from "@/lib/trades/painting/calculator";
import { CustomRates } from "@/hooks/useProfile";
import {
  PaintingCoatCount,
  PaintingQuality,
  PaintingSurfacePrep,
  PaintingComplexity,
  PaintingSelectedAddon,
  PaintingAddonId,
  UsePaintingEstimateReturn,
} from "@/lib/trades/painting/types";
import { TradeRoomView } from "@/lib/project/types";
import { CustomAddon, AddonUnit } from "@/lib/trades/shared/types";

// Generate unique ID
function generateId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function usePaintingEstimate(): UsePaintingEstimateReturn {
  const { profile } = useAuth();

  // State
  const [coatCount, setCoatCount] = useState<PaintingCoatCount>(2);
  const [paintQuality, setPaintQuality] = useState<PaintingQuality>("standard");
  const [surfacePrep, setSurfacePrep] = useState<PaintingSurfacePrep>("light");
  const [complexity, setComplexity] = useState<PaintingComplexity>("standard");
  const [addons, setAddons] = useState<PaintingSelectedAddon[]>([]);
  const [customAddons, setCustomAddons] = useState<CustomAddon[]>([]);
  const [totalSqft, setTotalSqft] = useState<number>(0);
  const [wallSqft, setWallSqft] = useState<number>(0);
  const [ceilingSqft, setCeilingSqft] = useState<number>(0);

  // Get hourly rate from profile
  const hourlyRate = profile?.hourly_rate ?? 75;

  // Get custom rates from profile
  const customRates = profile?.custom_rates as CustomRates | null | undefined;

  // Get user's default rates
  const defaultRates = useMemo(
    () => getUserPaintingRates(customRates),
    [customRates]
  );

  // Get user's default add-on prices
  const defaultAddonPrices = useMemo(
    () => getUserPaintingAddonPrices(customRates),
    [customRates]
  );

  // Set square footage from shared project rooms
  const setFromRooms = useCallback((rooms: TradeRoomView[]) => {
    const walls = rooms.reduce((sum, room) => sum + room.effectiveWallSqft, 0);
    const ceilings = rooms.reduce(
      (sum, room) => sum + room.effectiveCeilingSqft,
      0
    );
    setWallSqft(walls);
    setCeilingSqft(ceilings);
    setTotalSqft(walls + ceilings);
  }, []);

  // Addon management
  const toggleAddon = useCallback(
    (addonId: PaintingAddonId, quantity: number = 1) => {
      setAddons((prev) => {
        const existing = prev.find((a) => a.id === addonId);
        if (existing) {
          // Remove it
          return prev.filter((a) => a.id !== addonId);
        }
        // Add it
        const addonDef = PAINTING_ADDONS.find((a) => a.id === addonId);
        if (!addonDef) return prev;

        const price = getUserPaintingAddonPrice(addonId, customRates);
        const total = addonDef.unit === "flat" ? price : price * quantity;

        return [...prev, { id: addonId, quantity, total, hasOverride: false }];
      });
    },
    [customRates]
  );

  const updateAddonQuantity = useCallback(
    (addonId: PaintingAddonId, quantity: number) => {
      setAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== addonId) return addon;
          const addonDef = PAINTING_ADDONS.find((a) => a.id === addonId);
          if (!addonDef) return addon;

          const price = addon.priceOverride ?? getUserPaintingAddonPrice(addonId, customRates);
          const total = addonDef.unit === "flat" ? price : price * quantity;

          return { ...addon, quantity, total };
        })
      );
    },
    [customRates]
  );

  const removeAddon = useCallback((addonId: PaintingAddonId) => {
    setAddons((prev) => prev.filter((a) => a.id !== addonId));
  }, []);

  const setAddonPriceOverride = useCallback(
    (addonId: PaintingAddonId, override: number | undefined) => {
      setAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== addonId) return addon;
          const addonDef = PAINTING_ADDONS.find((a) => a.id === addonId);
          if (!addonDef) return addon;

          const price = override ?? getUserPaintingAddonPrice(addonId, customRates);
          const total = addonDef.unit === "flat" ? price : price * addon.quantity;

          return {
            ...addon,
            priceOverride: override,
            hasOverride: override !== undefined,
            total,
          };
        })
      );
    },
    [customRates]
  );

  // Custom addon management
  const addCustomAddon = useCallback(
    (name: string, price: number, unit: AddonUnit, quantity: number = 1) => {
      const total = unit === "flat" ? price : price * quantity;
      const newAddon: CustomAddon = {
        id: generateId(),
        name,
        price,
        unit,
        quantity,
        total,
        isCustom: true,
      };
      setCustomAddons((prev) => [...prev, newAddon]);
    },
    []
  );

  const updateCustomAddon = useCallback(
    (id: string, updates: Partial<Omit<CustomAddon, "id" | "isCustom" | "total">>) => {
      setCustomAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== id) return addon;
          const updated = { ...addon, ...updates };
          updated.total = updated.unit === "flat" ? updated.price : updated.price * updated.quantity;
          return updated;
        })
      );
    },
    []
  );

  const removeCustomAddon = useCallback((id: string) => {
    setCustomAddons((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setCoatCount(2);
    setPaintQuality("standard");
    setSurfacePrep("light");
    setComplexity("standard");
    setAddons([]);
    setCustomAddons([]);
    setTotalSqft(0);
    setWallSqft(0);
    setCeilingSqft(0);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const baseTotals = calculatePaintingEstimate({
      wallSqft,
      ceilingSqft,
      coatCount,
      paintQuality,
      surfacePrep,
      complexity,
      addons,
      rates: defaultRates,
    });

    // Add custom addons to totals
    const customAddonsTotal = customAddons.reduce((sum, a) => sum + a.total, 0);
    if (customAddonsTotal > 0) {
      const newAddonsSubtotal = baseTotals.addonsSubtotal + customAddonsTotal;
      const newSubtotal = baseTotals.subtotal + customAddonsTotal;
      const newComplexityAdjustment = newSubtotal * (baseTotals.complexityMultiplier - 1);
      const newTotal = newSubtotal + newComplexityAdjustment;
      const newCostPerSqft = baseTotals.totalSqft > 0 ? newTotal / baseTotals.totalSqft : 0;

      return {
        ...baseTotals,
        addonsSubtotal: newAddonsSubtotal,
        subtotal: newSubtotal,
        complexityAdjustment: newComplexityAdjustment,
        total: newTotal,
        costPerSqft: newCostPerSqft,
        rangeLow: newTotal * 0.85,
        rangeHigh: newTotal * 1.15,
      };
    }

    return baseTotals;
  }, [
    wallSqft,
    ceilingSqft,
    coatCount,
    paintQuality,
    surfacePrep,
    complexity,
    addons,
    customAddons,
    defaultRates,
  ]);

  return {
    // Data
    coatCount,
    paintQuality,
    surfacePrep,
    complexity,
    addons,
    customAddons,
    totalSqft,
    wallSqft,
    ceilingSqft,
    totals,
    defaultRates,
    defaultAddonPrices,
    hourlyRate,
    // Actions
    setCoatCount,
    setPaintQuality,
    setSurfacePrep,
    setComplexity,
    toggleAddon,
    updateAddonQuantity,
    removeAddon,
    setAddonPriceOverride,
    addCustomAddon,
    updateCustomAddon,
    removeCustomAddon,
    setTotalSqft,
    setWallSqft,
    setCeilingSqft,
    setFromRooms,
    reset,
  };
}
