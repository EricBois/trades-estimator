"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ProjectTradeType,
  ProjectTotals,
  TradeTotals,
  TradeRoomView,
  ProjectRoomOverride,
  TRADE_DEFAULT_INCLUDE_CEILING,
  createTradeRoomView,
} from "@/lib/project/types";
import { useProjectRooms } from "./useProjectRooms";
import { useDrywallHangingEstimate } from "@/hooks/trades/useDrywallHangingEstimate";
import { useDrywallFinishingEstimate } from "@/hooks/trades/useDrywallFinishingEstimate";
import { usePaintingEstimate } from "@/hooks/trades/usePaintingEstimate";

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

export interface UseProjectEstimateReturn {
  // Project data
  projectId: string;
  projectName: string;
  setProjectName: (name: string) => void;

  // Rooms (shared)
  roomsHook: ReturnType<typeof useProjectRooms>;

  // Trade selection
  enabledTrades: ProjectTradeType[];
  toggleTrade: (tradeType: ProjectTradeType) => void;
  isTradeEnabled: (tradeType: ProjectTradeType) => boolean;

  // Room overrides per trade
  roomOverrides: Map<string, ProjectRoomOverride[]>;
  setRoomOverride: (
    roomId: string,
    tradeType: ProjectTradeType,
    override: Partial<ProjectRoomOverride>
  ) => void;
  getTradeRoomViews: (tradeType: ProjectTradeType) => TradeRoomView[];

  // Trade-specific hooks (for configuration)
  hangingEstimate: ReturnType<typeof useDrywallHangingEstimate>;
  finishingEstimate: ReturnType<typeof useDrywallFinishingEstimate>;
  paintingEstimate: ReturnType<typeof usePaintingEstimate>;

  // Totals
  tradeTotals: Partial<Record<ProjectTradeType, TradeTotals>>;
  projectTotals: ProjectTotals;

  // Sync sqft to trade hooks when rooms change
  syncSqftToTrades: () => void;

  // Reset
  reset: () => void;
}

export function useProjectEstimate(
  initialProjectId?: string
): UseProjectEstimateReturn {
  // Project metadata
  const [projectId] = useState(() => initialProjectId ?? generateId());
  const [projectName, setProjectName] = useState("New Project");

  // Enabled trades
  const [enabledTrades, setEnabledTrades] = useState<ProjectTradeType[]>([
    "drywall_hanging",
    "drywall_finishing",
    "painting",
  ]);

  // Room overrides per trade (Map: roomId -> override[])
  const [roomOverrides, setRoomOverrides] = useState<
    Map<string, ProjectRoomOverride[]>
  >(new Map());

  // Shared rooms hook
  const roomsHook = useProjectRooms(projectId);

  // Individual trade hooks
  const hangingEstimate = useDrywallHangingEstimate();
  const finishingEstimate = useDrywallFinishingEstimate();
  const paintingEstimate = usePaintingEstimate();

  // Toggle trade enabled/disabled
  const toggleTrade = useCallback((tradeType: ProjectTradeType) => {
    setEnabledTrades((prev) => {
      if (prev.includes(tradeType)) {
        // Don't allow disabling all trades
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== tradeType);
      }
      return [...prev, tradeType];
    });
  }, []);

  // Check if trade is enabled
  const isTradeEnabled = useCallback(
    (tradeType: ProjectTradeType) => enabledTrades.includes(tradeType),
    [enabledTrades]
  );

  // Set room override for a specific trade
  const setRoomOverride = useCallback(
    (
      roomId: string,
      tradeType: ProjectTradeType,
      override: Partial<ProjectRoomOverride>
    ) => {
      setRoomOverrides((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(roomId) ?? [];
        const existingIndex = existing.findIndex(
          (o) => o.tradeType === tradeType
        );

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...existing];
          updated[existingIndex] = { ...updated[existingIndex], ...override };
          newMap.set(roomId, updated);
        } else {
          // Create new override
          const newOverride: ProjectRoomOverride = {
            id: generateId(),
            projectRoomId: roomId,
            tradeType,
            includeCeiling: TRADE_DEFAULT_INCLUDE_CEILING[tradeType],
            includeWalls: true,
            excluded: false,
            ...override,
          };
          newMap.set(roomId, [...existing, newOverride]);
        }

        return newMap;
      });
    },
    []
  );

  // Get trade-specific room views
  const getTradeRoomViews = useCallback(
    (tradeType: ProjectTradeType): TradeRoomView[] => {
      return roomsHook.rooms.map((room) => {
        const overrides = roomOverrides.get(room.id) ?? [];
        const override = overrides.find((o) => o.tradeType === tradeType);
        return createTradeRoomView(room, tradeType, override);
      });
    },
    [roomsHook.rooms, roomOverrides]
  );

  // Sync square footage to trade hooks when rooms change
  const syncSqftToTrades = useCallback(() => {
    // Get sqft from roomsHook (respects input mode - rooms vs manual)
    const totalSqft = roomsHook.totalSqft;
    const wallSqft = roomsHook.totalWallSqft;
    const ceilingSqft = roomsHook.totalCeilingSqft;

    // Sync to hanging estimate
    if (enabledTrades.includes("drywall_hanging")) {
      hangingEstimate.setSqft(totalSqft);
    }

    // Sync to finishing estimate
    if (enabledTrades.includes("drywall_finishing")) {
      finishingEstimate.setSqft(totalSqft);
    }

    // Sync to painting estimate
    if (enabledTrades.includes("painting")) {
      if (roomsHook.inputMode === "rooms" && roomsHook.rooms.length > 0) {
        const paintingViews = getTradeRoomViews("painting");
        paintingEstimate.setFromRooms(paintingViews);
      } else {
        // Manual mode - set sqft directly
        paintingEstimate.setWallSqft(wallSqft);
        paintingEstimate.setCeilingSqft(ceilingSqft);
      }
    }
  }, [
    enabledTrades,
    roomsHook.totalSqft,
    roomsHook.totalWallSqft,
    roomsHook.totalCeilingSqft,
    roomsHook.inputMode,
    roomsHook.rooms.length,
    getTradeRoomViews,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
  ]);

  // Auto-sync when total sqft changes
  useEffect(() => {
    syncSqftToTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsHook.totalSqft, roomOverrides, enabledTrades]);

  // Calculate trade totals
  const tradeTotals = useMemo((): Partial<
    Record<ProjectTradeType, TradeTotals>
  > => {
    const totals: Partial<Record<ProjectTradeType, TradeTotals>> = {};

    if (enabledTrades.includes("drywall_hanging")) {
      const t = hangingEstimate.totals;
      totals.drywall_hanging = {
        subtotal: t.subtotal,
        materialSubtotal: t.materialSubtotal,
        laborSubtotal: t.laborSubtotal,
        addonsSubtotal: t.addonsSubtotal,
        complexityMultiplier: t.complexityMultiplier,
        complexityAdjustment: t.complexityAdjustment,
        total: t.total,
      };
    }

    if (enabledTrades.includes("drywall_finishing")) {
      const t = finishingEstimate.totals;
      totals.drywall_finishing = {
        subtotal: t.subtotal,
        materialSubtotal: t.materialsSubtotal,
        laborSubtotal: t.laborSubtotal,
        addonsSubtotal: t.addonsSubtotal,
        complexityMultiplier: t.complexityMultiplier,
        complexityAdjustment: t.complexityAdjustment,
        total: t.total,
      };
    }

    if (enabledTrades.includes("painting")) {
      const t = paintingEstimate.totals;
      totals.painting = {
        subtotal: t.subtotal,
        materialSubtotal: t.materialSubtotal,
        laborSubtotal: t.laborSubtotal,
        addonsSubtotal: t.addonsSubtotal,
        complexityMultiplier: t.complexityMultiplier,
        complexityAdjustment: t.complexityAdjustment,
        total: t.total,
      };
    }

    return totals;
  }, [
    enabledTrades,
    hangingEstimate.totals,
    finishingEstimate.totals,
    paintingEstimate.totals,
  ]);

  // Calculate project totals
  const projectTotals = useMemo((): ProjectTotals => {
    const trades = tradeTotals;
    const values = Object.values(trades);

    const combinedTotal = values.reduce((sum, t) => sum + (t?.total ?? 0), 0);

    return {
      trades,
      combinedTotal,
    };
  }, [tradeTotals]);

  // Reset all state
  const reset = useCallback(() => {
    setProjectName("New Project");
    setEnabledTrades(["drywall_hanging", "drywall_finishing", "painting"]);
    setRoomOverrides(new Map());
    roomsHook.reset();
    hangingEstimate.reset();
    finishingEstimate.reset();
    paintingEstimate.reset();
  }, [roomsHook, hangingEstimate, finishingEstimate, paintingEstimate]);

  return {
    // Project data
    projectId,
    projectName,
    setProjectName,

    // Rooms
    roomsHook,

    // Trade selection
    enabledTrades,
    toggleTrade,
    isTradeEnabled,

    // Room overrides
    roomOverrides,
    setRoomOverride,
    getTradeRoomViews,

    // Trade hooks
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,

    // Totals
    tradeTotals,
    projectTotals,

    // Actions
    syncSqftToTrades,
    reset,
  };
}
