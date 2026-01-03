"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  HANGING_ADDONS,
  HANGING_COMPLEXITY_MULTIPLIERS,
  getSheetSize,
  getOpeningPreset,
  getCeilingFactor,
} from "@/lib/trades/drywallHanging/constants";
import {
  getUserHangingRates,
  getUserHangingAddonPrices,
  getUserHangingAddonPrice,
  getSheetMaterialCost,
  getSheetLaborCost,
  getUserDefaultWasteFactor,
  getUserLaborPerSqft,
} from "@/lib/trades/drywallHanging/rates";
import {
  calculateRoomSqft,
  calculateSheetsNeeded,
  calculateTotalRoomsSqft,
  createOpening,
  recalculateOpening,
} from "@/lib/trades/drywallHanging/calculator";
import { CustomRates } from "@/hooks/useProfile";
import {
  HangingInputMode,
  HangingPricingMethod,
  HangingRoom,
  HangingOpening,
  HangingSheetEntry,
  HangingSelectedAddon,
  HangingEstimateTotals,
  HangingComplexity,
  CeilingHeightFactor,
  DrywallSheetTypeId,
  DrywallSheetSize,
  HangingAddonId,
  UseDrywallHangingEstimateReturn,
  WallSegment,
  RoomShape,
} from "@/lib/trades/drywallHanging/types";
import { CustomAddon, AddonUnit } from "@/lib/trades/shared/types";

// Generate unique ID
function generateId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a default room
function createDefaultRoom(
  name: string = "Room 1",
  shape: RoomShape = "rectangular"
): HangingRoom {
  return {
    id: generateId(),
    name,
    shape,
    lengthFeet: 12,
    lengthInches: 0,
    widthFeet: 10,
    widthInches: 0,
    heightFeet: 8,
    heightInches: 0,
    lShapeDimensions:
      shape === "l_shape"
        ? {
            mainLengthFeet: 12,
            mainLengthInches: 0,
            mainWidthFeet: 10,
            mainWidthInches: 0,
            extLengthFeet: 8,
            extLengthInches: 0,
            extWidthFeet: 6,
            extWidthInches: 0,
          }
        : undefined,
    customWalls: [],
    customCeilingSqft: undefined,
    includeCeiling: false,
    doors: [],
    windows: [],
    wallSqft: 0,
    ceilingSqft: 0,
    openingsSqft: 0,
    totalSqft: 0,
  };
}

export function useDrywallHangingEstimate(): UseDrywallHangingEstimateReturn {
  const { profile } = useAuth();

  // State
  const [inputMode, setInputModeState] =
    useState<HangingInputMode>("calculator");
  const [pricingMethod, setPricingMethod] =
    useState<HangingPricingMethod>("per_sheet");
  const [clientSuppliesMaterials, setClientSuppliesMaterialsState] =
    useState<boolean>(false);
  const [directSqft, setDirectSqftState] = useState<number>(0);
  const [rooms, setRooms] = useState<HangingRoom[]>([]);
  const [sheets, setSheets] = useState<HangingSheetEntry[]>([]);
  const [ceilingFactor, setCeilingFactor] =
    useState<CeilingHeightFactor>("standard");
  const [wasteFactor, setWasteFactor] = useState<number>(0.12);
  const [complexity, setComplexity] = useState<HangingComplexity>("standard");
  const [addons, setAddons] = useState<HangingSelectedAddon[]>([]);
  const [customAddons, setCustomAddons] = useState<CustomAddon[]>([]);

  // Get hourly rate from profile
  const hourlyRate = profile?.hourly_rate ?? 75;

  // Get custom rates from profile
  const customRates = profile?.custom_rates as CustomRates | null | undefined;

  // Get user's default rates
  const defaultRates = useMemo(
    () => getUserHangingRates(customRates),
    [customRates]
  );

  // Get user's default add-on prices
  const defaultAddonPrices = useMemo(
    () => getUserHangingAddonPrices(customRates),
    [customRates]
  );

  // Helper to recalculate room and update it
  const updateRoomCalculations = useCallback(
    (room: HangingRoom): HangingRoom => {
      const calculated = calculateRoomSqft(room);
      return {
        ...room,
        wallSqft: calculated.wallSqft,
        ceilingSqft: calculated.ceilingSqft,
        openingsSqft: calculated.openingsSqft,
        totalSqft: calculated.totalSqft,
      };
    },
    []
  );

  // Room management
  const addRoom = useCallback(
    (name?: string): string => {
      const roomNumber = rooms.length + 1;
      const newRoom = createDefaultRoom(name ?? `Room ${roomNumber}`);
      const calculatedRoom = updateRoomCalculations(newRoom);
      setRooms((prev) => [...prev, calculatedRoom]);
      return calculatedRoom.id;
    },
    [rooms.length, updateRoomCalculations]
  );

  const updateRoom = useCallback(
    (
      id: string,
      updates: Partial<
        Omit<
          HangingRoom,
          "id" | "wallSqft" | "ceilingSqft" | "openingsSqft" | "totalSqft"
        >
      >
    ) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== id) return room;
          const updatedRoom = { ...room, ...updates };

          // Initialize lShapeDimensions when switching to L-shape
          if (updates.shape === "l_shape" && !updatedRoom.lShapeDimensions) {
            updatedRoom.lShapeDimensions = {
              mainLengthFeet: 12,
              mainLengthInches: 0,
              mainWidthFeet: 10,
              mainWidthInches: 0,
              extLengthFeet: 8,
              extLengthInches: 0,
              extWidthFeet: 6,
              extWidthInches: 0,
            };
          }

          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== id));
  }, []);

  // Opening management
  const addOpening = useCallback(
    (
      roomId: string,
      type: "doors" | "windows",
      presetId: string,
      quantity: number = 1
    ) => {
      const preset = getOpeningPreset(type, presetId);
      if (!preset) return;

      const opening: HangingOpening = {
        id: generateId(),
        ...createOpening(
          presetId,
          preset.label,
          preset.width,
          preset.height,
          quantity
        ),
      };

      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            [type]: [...room[type], opening],
          };
          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  const addCustomOpening = useCallback(
    (
      roomId: string,
      type: "doors" | "windows",
      width: number,
      height: number,
      label: string,
      quantity: number = 1
    ) => {
      const opening: HangingOpening = {
        id: generateId(),
        ...createOpening("custom", label, width, height, quantity),
      };

      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            [type]: [...room[type], opening],
          };
          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  const updateOpening = useCallback(
    (
      roomId: string,
      openingId: string,
      updates: Partial<Omit<HangingOpening, "id" | "sqft" | "totalSqft">>
    ) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;

          // Check both doors and windows
          const updateOpenings = (openings: HangingOpening[]) =>
            openings.map((o) => {
              if (o.id !== openingId) return o;
              const updated = { ...o, ...updates };
              return recalculateOpening(updated);
            });

          const updatedRoom = {
            ...room,
            doors: updateOpenings(room.doors),
            windows: updateOpenings(room.windows),
          };
          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  const removeOpening = useCallback(
    (roomId: string, openingId: string) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            doors: room.doors.filter((d) => d.id !== openingId),
            windows: room.windows.filter((w) => w.id !== openingId),
          };
          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  // Custom wall management
  const addCustomWall = useCallback(
    (roomId: string) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const wallNumber = room.customWalls.length + 1;
          const newWall: WallSegment = {
            id: generateId(),
            lengthFeet: 10,
            lengthInches: 0,
            label: `Wall ${wallNumber}`,
            sqft: 0,
          };
          const updatedRoom = {
            ...room,
            customWalls: [...room.customWalls, newWall],
          };
          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  const updateCustomWall = useCallback(
    (
      roomId: string,
      wallId: string,
      updates: Partial<Omit<WallSegment, "id" | "sqft">>
    ) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedWalls = room.customWalls.map((wall) => {
            if (wall.id !== wallId) return wall;
            return { ...wall, ...updates };
          });
          const updatedRoom = {
            ...room,
            customWalls: updatedWalls,
          };
          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  const removeCustomWall = useCallback(
    (roomId: string, wallId: string) => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== roomId) return room;
          const updatedRoom = {
            ...room,
            customWalls: room.customWalls.filter((w) => w.id !== wallId),
          };
          return updateRoomCalculations(updatedRoom);
        })
      );
    },
    [updateRoomCalculations]
  );

  // Sheet management
  const addSheet = useCallback(
    (
      typeId: DrywallSheetTypeId,
      size: DrywallSheetSize = "4x8",
      quantity: number = 1
    ) => {
      const materialCost = getSheetMaterialCost(typeId, customRates);
      const laborCost = getSheetLaborCost(typeId, customRates, size);
      // Respect global material setting
      const includeMaterial = !clientSuppliesMaterials;
      const totalPerSheet = (includeMaterial ? materialCost : 0) + laborCost;

      const newSheet: HangingSheetEntry = {
        id: generateId(),
        typeId,
        size,
        quantity,
        materialCost,
        laborCost,
        totalPerSheet,
        subtotal: totalPerSheet * quantity,
        includeMaterial,
        materialCostOverride: undefined,
        laborCostOverride: undefined,
        hasOverride: false,
      };

      setSheets((prev) => [...prev, newSheet]);
    },
    [customRates, clientSuppliesMaterials]
  );

  const updateSheet = useCallback(
    (
      id: string,
      updates: Partial<
        Omit<HangingSheetEntry, "id" | "totalPerSheet" | "subtotal">
      >
    ) => {
      setSheets((prev) =>
        prev.map((sheet) => {
          if (sheet.id !== id) return sheet;
          const updated = { ...sheet, ...updates };

          // Recalculate costs if type or size changed
          if (
            (updates.typeId && updates.typeId !== sheet.typeId) ||
            (updates.size && updates.size !== sheet.size)
          ) {
            const effectiveTypeId = updates.typeId ?? sheet.typeId;
            const effectiveSize = updates.size ?? sheet.size;
            updated.materialCost = getSheetMaterialCost(
              effectiveTypeId,
              customRates
            );
            updated.laborCost = getSheetLaborCost(
              effectiveTypeId,
              customRates,
              effectiveSize
            );
            // Clear overrides when type changes
            if (updates.typeId && updates.typeId !== sheet.typeId) {
              updated.materialCostOverride = undefined;
              updated.laborCostOverride = undefined;
              updated.hasOverride = false;
            }
          }

          // Calculate effective costs (respecting overrides and material toggle)
          const effectiveMaterial = updated.includeMaterial
            ? updated.materialCostOverride ?? updated.materialCost
            : 0;
          const effectiveLabor = updated.laborCostOverride ?? updated.laborCost;

          updated.totalPerSheet = effectiveMaterial + effectiveLabor;
          updated.subtotal = updated.totalPerSheet * updated.quantity;
          return updated;
        })
      );
    },
    [customRates]
  );

  const removeSheet = useCallback((id: string) => {
    setSheets((prev) => prev.filter((sheet) => sheet.id !== id));
  }, []);

  // Calculate sheets from rooms (calculator mode → generates sheet entries)
  const calculateSheetsFromRooms = useCallback(() => {
    if (rooms.length === 0) {
      setSheets([]);
      return;
    }

    const { grandTotalSqft } = calculateTotalRoomsSqft(rooms);

    // Preserve current selection or use defaults
    setSheets((prevSheets) => {
      const currentSheet = prevSheets[0];
      const typeId: DrywallSheetTypeId =
        currentSheet?.typeId ?? "standard_half";
      const size: DrywallSheetSize = currentSheet?.size ?? "4x8";
      const sheetId = currentSheet?.id ?? generateId();

      const sizeInfo = getSheetSize(size);
      if (!sizeInfo) return prevSheets;

      const sheetsNeeded = calculateSheetsNeeded(
        grandTotalSqft,
        size,
        wasteFactor
      );

      const materialCost = getSheetMaterialCost(typeId, customRates);
      const laborCost = getSheetLaborCost(typeId, customRates, size);
      // Respect global material setting for new sheets
      const includeMaterial =
        currentSheet?.includeMaterial ?? !clientSuppliesMaterials;
      const totalPerSheet = (includeMaterial ? materialCost : 0) + laborCost;

      return [
        {
          id: sheetId,
          typeId,
          size,
          quantity: sheetsNeeded,
          materialCost,
          laborCost,
          totalPerSheet,
          subtotal: totalPerSheet * sheetsNeeded,
          includeMaterial,
          materialCostOverride: currentSheet?.materialCostOverride,
          laborCostOverride: currentSheet?.laborCostOverride,
          hasOverride: currentSheet?.hasOverride ?? false,
        },
      ];
    });
  }, [rooms, wasteFactor, customRates, clientSuppliesMaterials]);

  // Set sqft directly and update sheets (for project wizard integration)
  const setSqft = useCallback(
    (totalSqft: number) => {
      if (totalSqft <= 0) {
        return;
      }

      // Preserve current selection or use defaults
      setSheets((prevSheets) => {
        const currentSheet = prevSheets[0];
        const typeId: DrywallSheetTypeId =
          currentSheet?.typeId ?? "standard_half";
        const size: DrywallSheetSize = currentSheet?.size ?? "4x8";
        const sheetId = currentSheet?.id ?? generateId();

        const sizeInfo = getSheetSize(size);
        if (!sizeInfo) return prevSheets;

        const sheetsNeeded = calculateSheetsNeeded(
          totalSqft,
          size,
          wasteFactor
        );

        const materialCost = getSheetMaterialCost(typeId, customRates);
        const laborCost = getSheetLaborCost(typeId, customRates, size);
        // Respect global material setting for new sheets
        const includeMaterial =
          currentSheet?.includeMaterial ?? !clientSuppliesMaterials;
        const totalPerSheet = (includeMaterial ? materialCost : 0) + laborCost;

        return [
          {
            id: sheetId,
            typeId,
            size,
            quantity: sheetsNeeded,
            materialCost,
            laborCost,
            totalPerSheet,
            subtotal: totalPerSheet * sheetsNeeded,
            includeMaterial,
            materialCostOverride: currentSheet?.materialCostOverride,
            laborCostOverride: currentSheet?.laborCostOverride,
            hasOverride: currentSheet?.hasOverride ?? false,
          },
        ];
      });
    },
    [wasteFactor, customRates, clientSuppliesMaterials]
  );

  // Addon management
  const toggleAddon = useCallback(
    (addonId: HangingAddonId, quantity: number = 1) => {
      setAddons((prev) => {
        const existing = prev.find((a) => a.id === addonId);
        if (existing) {
          // Remove it
          return prev.filter((a) => a.id !== addonId);
        }
        // Add it
        const addonDef = HANGING_ADDONS.find((a) => a.id === addonId);
        if (!addonDef) return prev;

        const price = getUserHangingAddonPrice(addonId, customRates);
        const total = addonDef.unit === "flat" ? price : price * quantity;

        return [
          ...prev,
          {
            id: addonId,
            quantity,
            total,
            priceOverride: undefined,
            hasOverride: false,
          },
        ];
      });
    },
    [customRates]
  );

  const updateAddonQuantity = useCallback(
    (addonId: HangingAddonId, quantity: number) => {
      setAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== addonId) return addon;
          const addonDef = HANGING_ADDONS.find((a) => a.id === addonId);
          if (!addonDef) return addon;

          const price = getUserHangingAddonPrice(addonId, customRates);
          const total = addonDef.unit === "flat" ? price : price * quantity;

          return { ...addon, quantity, total };
        })
      );
    },
    [customRates]
  );

  const removeAddon = useCallback((addonId: HangingAddonId) => {
    setAddons((prev) => prev.filter((a) => a.id !== addonId));
  }, []);

  // Material toggle and override actions
  const setSheetIncludeMaterial = useCallback(
    (id: string, include: boolean) => {
      setSheets((prev) =>
        prev.map((sheet) => {
          if (sheet.id !== id) return sheet;
          const updated = { ...sheet, includeMaterial: include };
          // Recalculate totals
          const effectiveMaterial = include
            ? updated.materialCostOverride ?? updated.materialCost
            : 0;
          const effectiveLabor = updated.laborCostOverride ?? updated.laborCost;
          updated.totalPerSheet = effectiveMaterial + effectiveLabor;
          updated.subtotal = updated.totalPerSheet * updated.quantity;
          return updated;
        })
      );
    },
    []
  );

  const setSheetMaterialCostOverride = useCallback(
    (id: string, override: number | undefined) => {
      setSheets((prev) =>
        prev.map((sheet) => {
          if (sheet.id !== id) return sheet;
          const updated = {
            ...sheet,
            materialCostOverride: override,
            hasOverride:
              override !== undefined || sheet.laborCostOverride !== undefined,
          };
          // Recalculate totals
          const effectiveMaterial = updated.includeMaterial
            ? override ?? sheet.materialCost
            : 0;
          const effectiveLabor = updated.laborCostOverride ?? sheet.laborCost;
          updated.totalPerSheet = effectiveMaterial + effectiveLabor;
          updated.subtotal = updated.totalPerSheet * updated.quantity;
          return updated;
        })
      );
    },
    []
  );

  const setSheetLaborCostOverride = useCallback(
    (id: string, override: number | undefined) => {
      setSheets((prev) =>
        prev.map((sheet) => {
          if (sheet.id !== id) return sheet;
          const updated = {
            ...sheet,
            laborCostOverride: override,
            hasOverride:
              sheet.materialCostOverride !== undefined ||
              override !== undefined,
          };
          // Recalculate totals
          const effectiveMaterial = updated.includeMaterial
            ? sheet.materialCostOverride ?? sheet.materialCost
            : 0;
          const effectiveLabor = override ?? sheet.laborCost;
          updated.totalPerSheet = effectiveMaterial + effectiveLabor;
          updated.subtotal = updated.totalPerSheet * updated.quantity;
          return updated;
        })
      );
    },
    []
  );

  const setAddonPriceOverride = useCallback(
    (addonId: HangingAddonId, override: number | undefined) => {
      setAddons((prev) =>
        prev.map((addon) => {
          if (addon.id !== addonId) return addon;
          const addonDef = HANGING_ADDONS.find((a) => a.id === addonId);
          if (!addonDef) return addon;

          const price =
            override ?? getUserHangingAddonPrice(addonId, customRates);
          const total =
            addonDef.unit === "flat" ? price : price * addon.quantity;

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

  // Input mode setter with side effects for labor_only mode
  const setInputMode = useCallback((mode: HangingInputMode) => {
    setInputModeState(mode);
    if (mode === "labor_only") {
      // When switching to labor_only, set pricing to per_sqft and enable client supplies materials
      setPricingMethod("per_sqft");
      setClientSuppliesMaterialsState(true);
    } else {
      // When switching away from labor_only, reset to per_sheet pricing
      setPricingMethod("per_sheet");
    }
  }, []);

  // Client supplies materials setter - also updates all sheets
  const setClientSuppliesMaterials = useCallback((value: boolean) => {
    setClientSuppliesMaterialsState(value);
    // Update all existing sheets to match
    setSheets((prev) =>
      prev.map((sheet) => {
        const updated = { ...sheet, includeMaterial: !value };
        // Recalculate totals
        const effectiveMaterial = updated.includeMaterial
          ? updated.materialCostOverride ?? updated.materialCost
          : 0;
        const effectiveLabor = updated.laborCostOverride ?? updated.laborCost;
        updated.totalPerSheet = effectiveMaterial + effectiveLabor;
        updated.subtotal = updated.totalPerSheet * updated.quantity;
        return updated;
      })
    );
  }, []);

  // Direct sqft setter for labor_only mode
  const setDirectSqft = useCallback((sqft: number) => {
    setDirectSqftState(sqft);
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    setInputModeState("calculator");
    setPricingMethod("per_sheet");
    setClientSuppliesMaterialsState(false);
    setDirectSqftState(0);
    setRooms([]);
    setSheets([]);
    setCeilingFactor("standard");
    setWasteFactor(getUserDefaultWasteFactor(customRates));
    setComplexity("standard");
    setAddons([]);
    setCustomAddons([]);
  }, [customRates]);

  // Calculate totals
  const totals = useMemo((): HangingEstimateTotals => {
    // Get labor per sqft rate for per_sqft pricing
    const laborPerSqft = getUserLaborPerSqft(customRates);

    // Handle labor_only mode with per_sqft pricing
    if (inputMode === "labor_only" && pricingMethod === "per_sqft") {
      const totalSqft = directSqft;

      // Labor only calculation - no materials, just sqft * rate
      const ceilingFactorInfo = getCeilingFactor(ceilingFactor);
      const ceilingMultiplier = ceilingFactorInfo?.multiplier ?? 1;
      const laborSubtotal = totalSqft * laborPerSqft * ceilingMultiplier;

      // No material cost in labor_only mode
      const materialSubtotal = 0;

      // Addons subtotal (including custom addons)
      const predefinedAddonsTotal = addons.reduce((sum, a) => sum + a.total, 0);
      const customAddonsTotal = customAddons.reduce(
        (sum, a) => sum + a.total,
        0
      );
      const addonsSubtotal = predefinedAddonsTotal + customAddonsTotal;

      // Subtotal
      const subtotal = materialSubtotal + laborSubtotal + addonsSubtotal;

      // Complexity adjustment
      const complexityMultiplier = HANGING_COMPLEXITY_MULTIPLIERS[complexity];
      const complexityAdjustment = subtotal * (complexityMultiplier - 1);

      // Total
      const total = subtotal + complexityAdjustment;

      return {
        totalSqft: Math.round(totalSqft * 100) / 100,
        sheetsNeeded: 0, // No sheets in labor_only mode
        materialSubtotal: 0,
        laborSubtotal: Math.round(laborSubtotal * 100) / 100,
        addonsSubtotal: Math.round(addonsSubtotal * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        complexityMultiplier,
        complexityAdjustment: Math.round(complexityAdjustment * 100) / 100,
        total: Math.round(total * 100) / 100,
        costPerSqft: laborPerSqft * ceilingMultiplier * complexityMultiplier,
        costPerSheet: 0,
      };
    }

    // Standard calculation for calculator/direct modes (per_sheet pricing)
    // Total sqft from rooms or estimated from sheets
    const roomTotals = calculateTotalRoomsSqft(rooms);
    const totalSqft =
      inputMode === "calculator"
        ? roomTotals.grandTotalSqft
        : sheets.reduce((sum, s) => {
            const sizeInfo = getSheetSize(s.size);
            return sum + (sizeInfo?.sqft ?? 0) * s.quantity;
          }, 0);

    // Total sheets
    const sheetsNeeded = sheets.reduce((sum, s) => sum + s.quantity, 0);

    // Material subtotal (respect includeMaterial flag and overrides)
    const materialSubtotal = sheets.reduce((sum, s) => {
      if (!s.includeMaterial) return sum;
      const effectiveCost = s.materialCostOverride ?? s.materialCost;
      return sum + effectiveCost * s.quantity;
    }, 0);

    // Labor subtotal (apply ceiling factor, respect overrides)
    const ceilingFactorInfo = getCeilingFactor(ceilingFactor);
    const ceilingMultiplier = ceilingFactorInfo?.multiplier ?? 1;
    const laborSubtotal =
      sheets.reduce((sum, s) => {
        const effectiveCost = s.laborCostOverride ?? s.laborCost;
        return sum + effectiveCost * s.quantity;
      }, 0) * ceilingMultiplier;

    // Addons subtotal (including custom addons)
    const predefinedAddonsTotal = addons.reduce((sum, a) => sum + a.total, 0);
    const customAddonsTotal = customAddons.reduce((sum, a) => sum + a.total, 0);
    const addonsSubtotal = predefinedAddonsTotal + customAddonsTotal;

    // Subtotal
    const subtotal = materialSubtotal + laborSubtotal + addonsSubtotal;

    // Complexity adjustment
    const complexityMultiplier = HANGING_COMPLEXITY_MULTIPLIERS[complexity];
    const complexityAdjustment = subtotal * (complexityMultiplier - 1);

    // Total
    const total = subtotal + complexityAdjustment;

    // Per-unit costs
    const costPerSqft = totalSqft > 0 ? total / totalSqft : 0;
    const costPerSheet = sheetsNeeded > 0 ? total / sheetsNeeded : 0;

    return {
      totalSqft: Math.round(totalSqft * 100) / 100,
      sheetsNeeded,
      materialSubtotal: Math.round(materialSubtotal * 100) / 100,
      laborSubtotal: Math.round(laborSubtotal * 100) / 100,
      addonsSubtotal: Math.round(addonsSubtotal * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      complexityMultiplier,
      complexityAdjustment: Math.round(complexityAdjustment * 100) / 100,
      total: Math.round(total * 100) / 100,
      costPerSqft: Math.round(costPerSqft * 100) / 100,
      costPerSheet: Math.round(costPerSheet * 100) / 100,
    };
  }, [
    inputMode,
    pricingMethod,
    directSqft,
    rooms,
    sheets,
    ceilingFactor,
    complexity,
    addons,
    customAddons,
    customRates,
  ]);

  return {
    // Data
    inputMode,
    pricingMethod,
    clientSuppliesMaterials,
    directSqft,
    rooms,
    sheets,
    ceilingFactor,
    wasteFactor,
    complexity,
    addons,
    customAddons,
    totals,
    defaultRates,
    defaultAddonPrices,
    hourlyRate,
    // Actions
    setInputMode,
    setPricingMethod,
    setClientSuppliesMaterials,
    setDirectSqft,
    addRoom,
    updateRoom,
    removeRoom,
    addOpening,
    addCustomOpening,
    updateOpening,
    removeOpening,
    addCustomWall,
    updateCustomWall,
    removeCustomWall,
    addSheet,
    updateSheet,
    removeSheet,
    calculateSheetsFromRooms,
    setSqft,
    setCeilingFactor,
    setWasteFactor,
    setComplexity,
    toggleAddon,
    updateAddonQuantity,
    removeAddon,
    addCustomAddon,
    updateCustomAddon,
    removeCustomAddon,
    setSheetIncludeMaterial,
    setSheetMaterialCostOverride,
    setSheetLaborCostOverride,
    setAddonPriceOverride,
    reset,
  };
}
