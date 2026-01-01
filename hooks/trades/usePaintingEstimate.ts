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

export function usePaintingEstimate(): UsePaintingEstimateReturn {
  const { profile } = useAuth();

  // State
  const [coatCount, setCoatCount] = useState<PaintingCoatCount>(2);
  const [paintQuality, setPaintQuality] = useState<PaintingQuality>("standard");
  const [surfacePrep, setSurfacePrep] = useState<PaintingSurfacePrep>("light");
  const [complexity, setComplexity] = useState<PaintingComplexity>("standard");
  const [addons, setAddons] = useState<PaintingSelectedAddon[]>([]);
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

        return [...prev, { id: addonId, quantity, total }];
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

          const price = getUserPaintingAddonPrice(addonId, customRates);
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

  // Reset all state
  const reset = useCallback(() => {
    setCoatCount(2);
    setPaintQuality("standard");
    setSurfacePrep("light");
    setComplexity("standard");
    setAddons([]);
    setTotalSqft(0);
    setWallSqft(0);
    setCeilingSqft(0);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    return calculatePaintingEstimate({
      wallSqft,
      ceilingSqft,
      coatCount,
      paintQuality,
      surfacePrep,
      complexity,
      addons,
      rates: defaultRates,
    });
  }, [
    wallSqft,
    ceilingSqft,
    coatCount,
    paintQuality,
    surfacePrep,
    complexity,
    addons,
    defaultRates,
  ]);

  return {
    // Data
    coatCount,
    paintQuality,
    surfacePrep,
    complexity,
    addons,
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
    setTotalSqft,
    setWallSqft,
    setCeilingSqft,
    setFromRooms,
    reset,
  };
}
