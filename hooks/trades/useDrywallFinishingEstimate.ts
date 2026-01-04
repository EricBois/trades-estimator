"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DRYWALL_ADDONS,
  DRYWALL_COMPLEXITY_MULTIPLIERS,
  getFinishingMaterial,
} from "@/lib/trades/drywallFinishing/constants";
import {
  getUserDrywallRates,
  getUserAddonPrice,
  getUserAddonPrices,
  getUserMaterialRate,
  getUserLaborRate,
  DrywallRateType,
} from "@/lib/trades/drywallFinishing/rates";
import { getMaterialLaborRateRanges } from "@/lib/trades/drywallFinishing/constants";
import { CustomRates } from "@/hooks/useProfile";
import {
  DrywallLineItem,
  DrywallSelectedAddon,
  FinishingMaterialEntry,
  FinishingMaterialId,
  FinishingMaterialCategory,
  DrywallFinishLevel,
  DrywallComplexity,
  DrywallLineItemType,
  DrywallAddonId,
  DrywallEstimateTotals,
  UseDrywallFinishingEstimateReturn,
} from "@/lib/trades/drywallFinishing/types";
import { CustomAddon, AddonUnit } from "@/lib/trades/shared/types";

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
  const [customAddons, setCustomAddons] = useState<CustomAddon[]>([]);
  const [materials, setMaterials] = useState<FinishingMaterialEntry[]>([]);
  const [complexity, setComplexity] = useState<DrywallComplexity>("standard");
  const [directHours, setDirectHoursState] = useState<number>(0);

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

  // Helper to get the user's rates for a line item type
  const getRatesForType = useCallback(
    (
      type: DrywallLineItemType
    ): { materialRate: number; laborRate: number; rate: number } => {
      if (type === "hourly") {
        return { materialRate: 0, laborRate: hourlyRate, rate: hourlyRate };
      }
      if (type === "addon") {
        return { materialRate: 0, laborRate: 0, rate: 0 };
      }
      // For sqft and linear types, use material/labor split
      const materialRate = getUserMaterialRate(
        type as DrywallRateType,
        customRates
      );
      const laborRate = getUserLaborRate(type as DrywallRateType, customRates);
      return { materialRate, laborRate, rate: materialRate + laborRate };
    },
    [hourlyRate, customRates]
  );

  // Add a new line item
  const addLineItem = useCallback(
    (type: DrywallLineItemType) => {
      const { materialRate, laborRate, rate } = getRatesForType(type);
      const defaultQty = type === "hourly" ? 1 : 100;
      const materialTotal = materialRate * defaultQty;
      const laborTotal = laborRate * defaultQty;

      const newItem: DrywallLineItem = {
        id: generateId(),
        type,
        description: "",
        quantity: defaultQty,
        materialRate,
        laborRate,
        rate,
        includeMaterial: true,
        materialRateOverride: undefined,
        laborRateOverride: undefined,
        hasOverride: false,
        materialTotal,
        laborTotal,
        total: materialTotal + laborTotal,
      };
      setLineItems((prev) => [...prev, newItem]);
    },
    [getRatesForType]
  );

  // Update a line item
  const updateLineItem = useCallback(
    (
      id: string,
      updates: Partial<
        Omit<DrywallLineItem, "id" | "total" | "materialTotal" | "laborTotal">
      >
    ) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, ...updates };

          // Calculate effective rates
          const effectiveMaterialRate =
            updated.materialRateOverride ?? updated.materialRate;
          const effectiveLaborRate =
            updated.laborRateOverride ?? updated.laborRate;
          updated.rate =
            (updated.includeMaterial ? effectiveMaterialRate : 0) +
            effectiveLaborRate;

          // Recalculate totals
          updated.materialTotal = updated.includeMaterial
            ? effectiveMaterialRate * updated.quantity
            : 0;
          updated.laborTotal = effectiveLaborRate * updated.quantity;
          updated.total = updated.materialTotal + updated.laborTotal;
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

        return [...prev, { id: addonId, quantity, total, hasOverride: false }];
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

          // Use override or custom price from settings or default
          const price =
            addon.priceOverride ?? getUserAddonPrice(addonId, customRates);
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

  // Set addon price override
  const setAddonPriceOverride = useCallback(
    (addonId: DrywallAddonId, override: number | undefined) => {
      setAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== addonId) return addon;
          const addonDef = DRYWALL_ADDONS.find((a) => a.id === addonId);
          if (!addonDef) return addon;

          const price = override ?? getUserAddonPrice(addonId, customRates);
          const total =
            addonDef.unit === "sqft" || addonDef.unit === "each"
              ? price * addon.quantity
              : price;

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
    (
      id: string,
      updates: Partial<Omit<CustomAddon, "id" | "isCustom" | "total">>
    ) => {
      setCustomAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== id) return addon;
          const updated = { ...addon, ...updates };
          updated.total =
            updated.unit === "flat"
              ? updated.price
              : updated.price * updated.quantity;
          return updated;
        })
      );
    },
    []
  );

  const removeCustomAddon = useCallback((id: string) => {
    setCustomAddons((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Set sqft directly and create/update a sqft line item (for project wizard)
  const setSqft = useCallback(
    (totalSqft: number) => {
      if (totalSqft <= 0) {
        return;
      }

      // Get rates (material/labor split)
      const { materialRate, laborRate, rate } =
        getRatesForType("sqft_standard");

      // Create or update a sqft_standard line item
      setLineItems((prev) => {
        // Find existing sqft line item
        const existingIndex = prev.findIndex(
          (item) =>
            item.type === "sqft_standard" || item.type === "sqft_premium"
        );

        if (existingIndex >= 0) {
          // Update existing - preserve material toggle and overrides
          const existing = prev[existingIndex];
          const updated = [...prev];
          const effectiveMaterialRate =
            existing.materialRateOverride ?? materialRate;
          const effectiveLaborRate = existing.laborRateOverride ?? laborRate;
          const materialTotal = existing.includeMaterial
            ? effectiveMaterialRate * totalSqft
            : 0;
          const laborTotal = effectiveLaborRate * totalSqft;

          updated[existingIndex] = {
            ...existing,
            quantity: totalSqft,
            materialRate,
            laborRate,
            rate:
              (existing.includeMaterial ? effectiveMaterialRate : 0) +
              effectiveLaborRate,
            materialTotal,
            laborTotal,
            total: materialTotal + laborTotal,
          };
          return updated;
        }

        // Create new sqft line item
        const materialTotal = materialRate * totalSqft;
        const laborTotal = laborRate * totalSqft;
        const newItem: DrywallLineItem = {
          id: generateId(),
          type: "sqft_standard",
          description: "Wall & Ceiling Finishing",
          quantity: totalSqft,
          materialRate,
          laborRate,
          rate,
          includeMaterial: true,
          materialRateOverride: undefined,
          laborRateOverride: undefined,
          hasOverride: false,
          materialTotal,
          laborTotal,
          total: materialTotal + laborTotal,
        };
        return [newItem, ...prev];
      });
    },
    [getRatesForType]
  );

  // Material toggle and override actions
  const setLineItemIncludeMaterial = useCallback(
    (id: string, include: boolean) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, includeMaterial: include };
          // Recalculate totals
          const effectiveMaterialRate =
            updated.materialRateOverride ?? updated.materialRate;
          const effectiveLaborRate =
            updated.laborRateOverride ?? updated.laborRate;
          updated.rate =
            (include ? effectiveMaterialRate : 0) + effectiveLaborRate;
          updated.materialTotal = include
            ? effectiveMaterialRate * updated.quantity
            : 0;
          updated.laborTotal = effectiveLaborRate * updated.quantity;
          updated.total = updated.materialTotal + updated.laborTotal;
          return updated;
        })
      );
    },
    []
  );

  const setLineItemMaterialOverride = useCallback(
    (id: string, override: number | undefined) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = {
            ...item,
            materialRateOverride: override,
            hasOverride:
              override !== undefined || item.laborRateOverride !== undefined,
          };
          // Recalculate totals
          const effectiveMaterialRate = override ?? item.materialRate;
          const effectiveLaborRate =
            updated.laborRateOverride ?? item.laborRate;
          updated.rate =
            (updated.includeMaterial ? effectiveMaterialRate : 0) +
            effectiveLaborRate;
          updated.materialTotal = updated.includeMaterial
            ? effectiveMaterialRate * updated.quantity
            : 0;
          updated.laborTotal = effectiveLaborRate * updated.quantity;
          updated.total = updated.materialTotal + updated.laborTotal;
          return updated;
        })
      );
    },
    []
  );

  const setLineItemLaborOverride = useCallback(
    (id: string, override: number | undefined) => {
      setLineItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = {
            ...item,
            laborRateOverride: override,
            hasOverride:
              item.materialRateOverride !== undefined || override !== undefined,
          };
          // Recalculate totals
          const effectiveMaterialRate =
            item.materialRateOverride ?? item.materialRate;
          const effectiveLaborRate = override ?? item.laborRate;
          updated.rate =
            (updated.includeMaterial ? effectiveMaterialRate : 0) +
            effectiveLaborRate;
          updated.materialTotal = updated.includeMaterial
            ? effectiveMaterialRate * updated.quantity
            : 0;
          updated.laborTotal = effectiveLaborRate * updated.quantity;
          updated.total = updated.materialTotal + updated.laborTotal;
          return updated;
        })
      );
    },
    []
  );

  // Material management actions
  const addMaterial = useCallback(
    (materialId: FinishingMaterialId, quantity: number = 1) => {
      const materialDef = getFinishingMaterial(materialId);
      if (!materialDef) return;

      // Check for user's price override from settings
      const overridePrice =
        customRates?.finishing_material_prices?.[materialId];
      const unitPrice = overridePrice ?? materialDef.price;

      const newEntry: FinishingMaterialEntry = {
        id: generateId(),
        materialId,
        isCustom: false,
        category: materialDef.category as FinishingMaterialCategory,
        name: materialDef.label,
        unit: materialDef.unit,
        quantity,
        unitPrice,
        priceOverride: undefined,
        hasOverride: false,
        subtotal: unitPrice * quantity,
      };
      setMaterials((prev) => [...prev, newEntry]);
    },
    [customRates]
  );

  // Add a custom material from the contractor_materials table
  const addCustomMaterial = useCallback(
    (
      customMaterialId: string,
      name: string,
      category: FinishingMaterialCategory,
      unit: string,
      basePrice: number,
      quantity: number = 1
    ) => {
      const newEntry: FinishingMaterialEntry = {
        id: generateId(),
        materialId: customMaterialId,
        isCustom: true,
        category,
        name,
        unit,
        quantity,
        unitPrice: basePrice,
        priceOverride: undefined,
        hasOverride: false,
        subtotal: basePrice * quantity,
      };
      setMaterials((prev) => [...prev, newEntry]);
    },
    []
  );

  const updateMaterial = useCallback(
    (
      id: string,
      updates: Partial<Omit<FinishingMaterialEntry, "id" | "subtotal">>
    ) => {
      setMaterials((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          const updated = { ...entry, ...updates };
          // Recalculate subtotal
          const effectivePrice = updated.priceOverride ?? updated.unitPrice;
          updated.subtotal = effectivePrice * updated.quantity;
          return updated;
        })
      );
    },
    []
  );

  const removeMaterial = useCallback((id: string) => {
    setMaterials((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const setMaterialPriceOverride = useCallback(
    (id: string, override: number | undefined) => {
      setMaterials((prev) =>
        prev.map((entry) => {
          if (entry.id !== id) return entry;
          const updated = {
            ...entry,
            priceOverride: override,
            hasOverride: override !== undefined,
          };
          // Recalculate subtotal
          const effectivePrice = override ?? entry.unitPrice;
          updated.subtotal = effectivePrice * updated.quantity;
          return updated;
        })
      );
    },
    []
  );

  // Direct hours setter
  const setDirectHours = useCallback((hours: number) => {
    setDirectHoursState(hours);
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setFinishLevel(4);
    setLineItems([]);
    setAddons([]);
    setCustomAddons([]);
    setMaterials([]);
    setComplexity("standard");
    setDirectHoursState(0);
  }, []);

  // Hydrate state from saved parameters (for editing existing estimates)
  const hydrateFromSaved = useCallback(
    (params: {
      finishLevel?: DrywallFinishLevel;
      lineItems?: DrywallLineItem[];
      addons?: DrywallSelectedAddon[];
      customAddons?: CustomAddon[];
      materials?: FinishingMaterialEntry[];
      complexity?: DrywallComplexity;
      directHours?: number;
    }) => {
      if (params.finishLevel !== undefined) setFinishLevel(params.finishLevel);
      if (params.lineItems) setLineItems(params.lineItems);
      if (params.addons) setAddons(params.addons);
      if (params.customAddons) setCustomAddons(params.customAddons);
      if (params.materials) setMaterials(params.materials);
      if (params.complexity) setComplexity(params.complexity);
      if (params.directHours !== undefined)
        setDirectHoursState(params.directHours);
    },
    []
  );

  // Calculate totals
  const totals = useMemo((): DrywallEstimateTotals => {
    // Material and labor subtotals (from line items)
    const materialSubtotal = lineItems.reduce(
      (sum, item) => sum + item.materialTotal,
      0
    );
    const lineItemsLabor = lineItems.reduce(
      (sum, item) => sum + item.laborTotal,
      0
    );
    // Add direct hours labor
    const hoursLabor = directHours * hourlyRate;
    const laborSubtotal = lineItemsLabor + hoursLabor;
    const lineItemsSubtotal = materialSubtotal + laborSubtotal;

    // Addons subtotal (including custom addons)
    const predefinedAddonsTotal = addons.reduce(
      (sum, addon) => sum + addon.total,
      0
    );
    const customAddonsTotal = customAddons.reduce(
      (sum, addon) => sum + addon.total,
      0
    );
    const addonsSubtotal = predefinedAddonsTotal + customAddonsTotal;

    // Manual materials subtotal
    const materialsSubtotal = materials.reduce(
      (sum, entry) => sum + entry.subtotal,
      0
    );

    // Subtotal (include manual materials)
    const subtotal = lineItemsSubtotal + addonsSubtotal + materialsSubtotal;

    // Complexity adjustment
    const complexityMultiplier = DRYWALL_COMPLEXITY_MULTIPLIERS[complexity];
    const complexityAdjustment = subtotal * (complexityMultiplier - 1);

    // Total
    const total = subtotal + complexityAdjustment;

    // Calculate range based on material/labor rate ranges
    let rangeLow = 0;
    let rangeHigh = 0;

    for (const item of lineItems) {
      const rateRanges = getMaterialLaborRateRanges(item.type);
      if (rateRanges) {
        // Use material/labor ranges, respecting includeMaterial
        const materialLow = item.includeMaterial
          ? rateRanges.material.low * item.quantity
          : 0;
        const materialHigh = item.includeMaterial
          ? rateRanges.material.high * item.quantity
          : 0;
        rangeLow += materialLow + rateRanges.labor.low * item.quantity;
        rangeHigh += materialHigh + rateRanges.labor.high * item.quantity;
      } else if (item.type === "hourly") {
        // Hourly has fixed rate from profile (labor only)
        rangeLow += item.laborTotal;
        rangeHigh += item.laborTotal;
      } else {
        // Unknown type, use actual
        rangeLow += item.total;
        rangeHigh += item.total;
      }
    }

    // Add addons to range (fixed pricing)
    rangeLow += addonsSubtotal;
    rangeHigh += addonsSubtotal;

    // Add manual materials to range (fixed pricing)
    rangeLow += materialsSubtotal;
    rangeHigh += materialsSubtotal;

    // Apply complexity to range
    rangeLow = rangeLow * complexityMultiplier;
    rangeHigh = rangeHigh * complexityMultiplier;

    return {
      materialSubtotal,
      laborSubtotal,
      lineItemsSubtotal,
      addonsSubtotal,
      materialsSubtotal,
      subtotal,
      complexityMultiplier,
      complexityAdjustment,
      total,
      range: {
        low: Math.round(rangeLow),
        high: Math.round(rangeHigh),
      },
    };
  }, [
    lineItems,
    addons,
    customAddons,
    materials,
    complexity,
    directHours,
    hourlyRate,
  ]);

  return {
    // Data
    finishLevel,
    lineItems,
    addons,
    customAddons,
    materials,
    complexity,
    directHours,
    totals,
    defaultRates,
    defaultAddonPrices,
    hourlyRate,
    // Actions
    setFinishLevel,
    setDirectHours,
    addLineItem,
    updateLineItem,
    removeLineItem,
    toggleAddon,
    removeAddon,
    updateAddonQuantity,
    setAddonPriceOverride,
    addCustomAddon,
    updateCustomAddon,
    removeCustomAddon,
    setComplexity,
    setSqft,
    setLineItemIncludeMaterial,
    setLineItemMaterialOverride,
    setLineItemLaborOverride,
    addMaterial,
    addCustomMaterial,
    updateMaterial,
    removeMaterial,
    setMaterialPriceOverride,
    reset,
    hydrateFromSaved,
  };
}
