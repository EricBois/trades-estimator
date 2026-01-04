"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
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

const supabase = createClient();

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
  // Uses trade-specific room views to respect wall/ceiling overrides per trade
  const syncSqftToTrades = useCallback(() => {
    const hasRooms =
      roomsHook.inputMode === "rooms" && roomsHook.rooms.length > 0;

    // Sync to hanging estimate - uses gross sqft (no openings deducted)
    // Uses setFromRooms to track wall/ceiling breakdown for ceiling height multiplier
    if (enabledTrades.includes("drywall_hanging")) {
      if (hasRooms) {
        const hangingViews = getTradeRoomViews("drywall_hanging");
        hangingEstimate.setFromRooms(hangingViews);
      } else {
        hangingEstimate.setSqft(roomsHook.totalGrossSqft);
      }
    }

    // Sync to finishing estimate - uses net sqft (openings deducted)
    if (enabledTrades.includes("drywall_finishing")) {
      if (hasRooms) {
        const finishingViews = getTradeRoomViews("drywall_finishing");
        // Sum effective net sqft (respects wall/ceiling toggles, with opening deductions)
        const netSqft = finishingViews.reduce(
          (sum, r) => sum + r.effectiveTotalSqft,
          0
        );
        finishingEstimate.setSqft(netSqft);
      } else {
        finishingEstimate.setSqft(roomsHook.totalSqft);
      }
    }

    // Sync to painting estimate - uses net sqft with wall/ceiling breakdown
    if (enabledTrades.includes("painting")) {
      if (hasRooms) {
        const paintingViews = getTradeRoomViews("painting");
        paintingEstimate.setFromRooms(paintingViews);
      } else {
        paintingEstimate.setWallSqft(roomsHook.totalWallSqft);
        paintingEstimate.setCeilingSqft(roomsHook.totalCeilingSqft);
      }
    }
  }, [
    enabledTrades,
    roomsHook.totalGrossSqft,
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
  }, [
    roomsHook.totalGrossSqft,
    roomsHook.totalSqft,
    roomOverrides,
    enabledTrades,
  ]);

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

  // Track if we've loaded existing project data
  const hasLoadedRef = useRef(false);

  // Load existing project data when editing
  useEffect(() => {
    // Only load once and only if we have a projectId that looks like an existing project
    if (!initialProjectId || hasLoadedRef.current) return;

    // Check if projectId looks like a UUID (existing project)
    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        initialProjectId
      );
    if (!isValidUUID) return;

    const loadProject = async () => {
      try {
        // Load project details
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", initialProjectId)
          .single();

        if (projectError || !project) {
          console.error("Failed to load project:", projectError);
          return;
        }

        // Set project name
        setProjectName(project.name);

        // Load rooms
        await roomsHook.loadRooms();

        // Load estimates for this project
        const { data: estimates, error: estimatesError } = await supabase
          .from("estimates")
          .select("*")
          .eq("project_id", initialProjectId);

        if (estimatesError) {
          console.error("Failed to load estimates:", estimatesError);
          return;
        }

        // Determine enabled trades from existing estimates
        const trades = (estimates ?? [])
          .map((e) => e.template_type as ProjectTradeType)
          .filter((t) =>
            ["drywall_hanging", "drywall_finishing", "painting"].includes(t)
          );

        if (trades.length > 0) {
          setEnabledTrades(trades);
        }

        // Hydrate each trade estimate from saved parameters
        for (const estimate of estimates ?? []) {
          const params = estimate.parameters as Record<string, unknown> | null;
          if (!params) continue;

          if (estimate.template_type === "drywall_hanging") {
            // Hydrate hanging estimate
            if (params.inputMode) {
              hangingEstimate.setInputMode(
                params.inputMode as "calculator" | "direct" | "labor_only"
              );
            }
            if (params.pricingMethod) {
              hangingEstimate.setPricingMethod(
                params.pricingMethod as "per_sheet" | "per_sqft"
              );
            }
            if (params.ceilingFactor) {
              hangingEstimate.setCeilingFactor(
                params.ceilingFactor as
                  | "standard"
                  | "nine_ft"
                  | "ten_ft"
                  | "cathedral"
              );
            }
            if (typeof params.wasteFactor === "number") {
              hangingEstimate.setWasteFactor(params.wasteFactor);
            }
            if (params.complexity) {
              hangingEstimate.setComplexity(
                params.complexity as "simple" | "standard" | "complex"
              );
            }
            // Hydrate addons - use type assertion since addon IDs are validated by the hook
            const savedAddons = params.addons as
              | Array<{ id: string; quantity: number }>
              | undefined;
            if (savedAddons && Array.isArray(savedAddons)) {
              for (const addon of savedAddons) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                hangingEstimate.toggleAddon(addon.id as any, addon.quantity);
              }
            }
          } else if (estimate.template_type === "drywall_finishing") {
            // Hydrate finishing estimate
            if (typeof params.finishLevel === "number") {
              finishingEstimate.setFinishLevel(params.finishLevel as 3 | 4 | 5);
            }
            if (params.complexity) {
              finishingEstimate.setComplexity(
                params.complexity as "simple" | "standard" | "complex"
              );
            }
            // Hydrate addons
            const savedAddons = params.addons as
              | Array<{ id: string; quantity: number }>
              | undefined;
            if (savedAddons && Array.isArray(savedAddons)) {
              for (const addon of savedAddons) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                finishingEstimate.toggleAddon(addon.id as any, addon.quantity);
              }
            }
          } else if (estimate.template_type === "painting") {
            // Hydrate painting estimate
            if (typeof params.coatCount === "number") {
              paintingEstimate.setCoatCount(params.coatCount as 1 | 2 | 3);
            }
            if (params.paintQuality) {
              paintingEstimate.setPaintQuality(
                params.paintQuality as "standard" | "premium" | "specialty"
              );
            }
            if (params.surfacePrep) {
              paintingEstimate.setSurfacePrep(
                params.surfacePrep as "none" | "light" | "heavy"
              );
            }
            if (params.complexity) {
              paintingEstimate.setComplexity(
                params.complexity as "simple" | "standard" | "complex"
              );
            }
            // Hydrate addons
            const savedAddons = params.addons as
              | Array<{ id: string; quantity: number }>
              | undefined;
            if (savedAddons && Array.isArray(savedAddons)) {
              for (const addon of savedAddons) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                paintingEstimate.toggleAddon(addon.id as any, addon.quantity);
              }
            }
          }
        }

        hasLoadedRef.current = true;
      } catch (err) {
        console.error("Error loading project:", err);
      }
    };

    loadProject();
  }, [
    initialProjectId,
    roomsHook,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
  ]);

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
