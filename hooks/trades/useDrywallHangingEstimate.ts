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
  const [inputMode, setInputMode] = useState<HangingInputMode>("calculator");
  const [pricingMethod, setPricingMethod] =
    useState<HangingPricingMethod>("per_sheet");
  const [rooms, setRooms] = useState<HangingRoom[]>([]);
  const [sheets, setSheets] = useState<HangingSheetEntry[]>([]);
  const [ceilingFactor, setCeilingFactor] =
    useState<CeilingHeightFactor>("standard");
  const [wasteFactor, setWasteFactor] = useState<number>(0.12);
  const [complexity, setComplexity] = useState<HangingComplexity>("standard");
  const [addons, setAddons] = useState<HangingSelectedAddon[]>([]);

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
      const laborCost = getSheetLaborCost(typeId, customRates);
      const totalPerSheet = materialCost + laborCost;

      const newSheet: HangingSheetEntry = {
        id: generateId(),
        typeId,
        size,
        quantity,
        materialCost,
        laborCost,
        totalPerSheet,
        subtotal: totalPerSheet * quantity,
      };

      setSheets((prev) => [...prev, newSheet]);
    },
    [customRates]
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

          // Recalculate costs if type changed
          if (updates.typeId && updates.typeId !== sheet.typeId) {
            updated.materialCost = getSheetMaterialCost(
              updates.typeId,
              customRates
            );
            updated.laborCost = getSheetLaborCost(updates.typeId, customRates);
          }

          updated.totalPerSheet = updated.materialCost + updated.laborCost;
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
      const laborCost = getSheetLaborCost(typeId, customRates);
      const totalPerSheet = materialCost + laborCost;

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
        },
      ];
    });
  }, [rooms, wasteFactor, customRates]);

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
        const laborCost = getSheetLaborCost(typeId, customRates);
        const totalPerSheet = materialCost + laborCost;

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
          },
        ];
      });
    },
    [wasteFactor, customRates]
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

        return [...prev, { id: addonId, quantity, total }];
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

  // Reset all state
  const reset = useCallback(() => {
    setInputMode("calculator");
    setPricingMethod("per_sheet");
    setRooms([]);
    setSheets([]);
    setCeilingFactor("standard");
    setWasteFactor(getUserDefaultWasteFactor(customRates));
    setComplexity("standard");
    setAddons([]);
  }, [customRates]);

  // Calculate totals
  const totals = useMemo((): HangingEstimateTotals => {
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

    // Material subtotal
    const materialSubtotal = sheets.reduce(
      (sum, s) => sum + s.materialCost * s.quantity,
      0
    );

    // Labor subtotal (apply ceiling factor)
    const ceilingFactorInfo = getCeilingFactor(ceilingFactor);
    const ceilingMultiplier = ceilingFactorInfo?.multiplier ?? 1;
    const laborSubtotal =
      sheets.reduce((sum, s) => sum + s.laborCost * s.quantity, 0) *
      ceilingMultiplier;

    // Addons subtotal
    const addonsSubtotal = addons.reduce((sum, a) => sum + a.total, 0);

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
  }, [inputMode, rooms, sheets, ceilingFactor, complexity, addons]);

  return {
    // Data
    inputMode,
    pricingMethod,
    rooms,
    sheets,
    ceilingFactor,
    wasteFactor,
    complexity,
    addons,
    totals,
    defaultRates,
    defaultAddonPrices,
    hourlyRate,
    // Actions
    setInputMode,
    setPricingMethod,
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
    reset,
  };
}
