// Shared types for multi-trade projects
// Based on HangingRoom structure from /lib/trades/drywallHanging/types.ts

// Project trade types supported
export const PROJECT_TRADE_TYPES = [
  "drywall_hanging",
  "drywall_finishing",
  "painting",
] as const;

export type ProjectTradeType = (typeof PROJECT_TRADE_TYPES)[number];

// Room shape
export type ProjectRoomShape = "rectangular" | "l_shape" | "custom";

// L-shape dimensions (same as drywallHanging)
export interface LShapeDimensions {
  mainLengthFeet: number;
  mainLengthInches: number;
  mainWidthFeet: number;
  mainWidthInches: number;
  extLengthFeet: number;
  extLengthInches: number;
  extWidthFeet: number;
  extWidthInches: number;
}

// Wall segment for custom rooms
export interface WallSegment {
  id: string;
  lengthFeet: number;
  lengthInches: number;
  label: string;
  sqft: number;
}

// Opening (door/window)
export interface ProjectOpening {
  id: string;
  presetId: string | "custom";
  label: string;
  width: number; // inches
  height: number; // inches
  quantity: number;
  sqft: number; // per opening
  totalSqft: number; // sqft * quantity
}

// Base room structure shared across all trades
export interface ProjectRoom {
  id: string;
  projectId: string;
  name: string;
  shape: ProjectRoomShape;
  // Rectangular dimensions
  lengthFeet: number;
  lengthInches: number;
  widthFeet: number;
  widthInches: number;
  heightFeet: number;
  heightInches: number;
  // L-shape dimensions (when shape="l_shape")
  lShapeDimensions?: LShapeDimensions;
  // Custom walls (when shape="custom")
  customWalls: WallSegment[];
  customCeilingSqft?: number;
  // Openings
  doors: ProjectOpening[];
  windows: ProjectOpening[];
  // Calculated values
  wallSqft: number;
  ceilingSqft: number;
  openingsSqft: number;
  totalSqft: number;
  sortOrder: number;
}

// Trade-specific room override
export interface ProjectRoomOverride {
  id: string;
  projectRoomId: string;
  tradeType: ProjectTradeType;
  includeCeiling: boolean | null;
  includeWalls: boolean;
  excluded: boolean;
}

// Room with trade overrides applied
export interface TradeRoomView extends ProjectRoom {
  tradeType: ProjectTradeType;
  includeCeiling: boolean;
  includeWalls: boolean;
  excluded: boolean;
  effectiveWallSqft: number;
  effectiveCeilingSqft: number;
  effectiveTotalSqft: number;
}

// Trade configuration per project
export interface ProjectTrade {
  id: string;
  projectId: string;
  tradeType: ProjectTradeType;
  enabled: boolean;
  parameters: Record<string, unknown> | null;
  rangeLow: number;
  rangeHigh: number;
  sortOrder: number;
}

// Project status
export type ProjectStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "declined"
  | "expired";

// Main project structure
export interface Project {
  id: string;
  contractorId: string;
  name: string;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string | null;
  projectDescription: string | null;
  status: ProjectStatus;
  rangeLow: number;
  rangeHigh: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  viewedAt: string | null;
}

// Totals for a single trade
export interface TradeTotals {
  subtotal: number;
  materialSubtotal: number;
  laborSubtotal: number;
  addonsSubtotal: number;
  complexityMultiplier: number;
  complexityAdjustment: number;
  total: number;
}

// Combined project totals
export interface ProjectTotals {
  trades: Partial<Record<ProjectTradeType, TradeTotals>>;
  combinedTotal: number;
}

// Default ceiling settings per trade
export const TRADE_DEFAULT_INCLUDE_CEILING: Record<ProjectTradeType, boolean> =
  {
    drywall_hanging: true,
    drywall_finishing: true,
    painting: true,
  };

// Trade display info
export interface TradeDisplayInfo {
  tradeType: ProjectTradeType;
  label: string;
  shortLabel: string;
  icon: string;
  defaultIncludeCeiling: boolean;
}

export const TRADE_DISPLAY_INFO: TradeDisplayInfo[] = [
  {
    tradeType: "drywall_hanging",
    label: "Drywall Hanging",
    shortLabel: "Hanging",
    icon: "Hammer",
    defaultIncludeCeiling: true,
  },
  {
    tradeType: "drywall_finishing",
    label: "Drywall Finishing",
    shortLabel: "Finishing",
    icon: "Sparkles",
    defaultIncludeCeiling: true,
  },
  {
    tradeType: "painting",
    label: "Painting",
    shortLabel: "Painting",
    icon: "Paintbrush",
    defaultIncludeCeiling: true,
  },
];

// Helper to get trade display info
export function getTradeDisplayInfo(
  tradeType: ProjectTradeType
): TradeDisplayInfo {
  return (
    TRADE_DISPLAY_INFO.find((t) => t.tradeType === tradeType) ||
    TRADE_DISPLAY_INFO[0]
  );
}

// Create default room
export function createDefaultRoom(
  projectId: string,
  name?: string,
  sortOrder = 0
): ProjectRoom {
  return {
    id: crypto.randomUUID(),
    projectId,
    name: name || "Room 1",
    shape: "rectangular",
    lengthFeet: 12,
    lengthInches: 0,
    widthFeet: 10,
    widthInches: 0,
    heightFeet: 8,
    heightInches: 0,
    lShapeDimensions: undefined,
    customWalls: [],
    customCeilingSqft: undefined,
    doors: [],
    windows: [],
    wallSqft: 0,
    ceilingSqft: 0,
    openingsSqft: 0,
    totalSqft: 0,
    sortOrder,
  };
}

// Create room view with trade overrides
export function createTradeRoomView(
  room: ProjectRoom,
  tradeType: ProjectTradeType,
  override?: ProjectRoomOverride
): TradeRoomView {
  const includeCeiling =
    override?.includeCeiling ?? TRADE_DEFAULT_INCLUDE_CEILING[tradeType];
  const includeWalls = override?.includeWalls ?? true;
  const excluded = override?.excluded ?? false;

  const effectiveWallSqft = excluded || !includeWalls ? 0 : room.wallSqft;
  const effectiveCeilingSqft =
    excluded || !includeCeiling ? 0 : room.ceilingSqft;
  const effectiveTotalSqft = effectiveWallSqft + effectiveCeilingSqft;

  return {
    ...room,
    tradeType,
    includeCeiling,
    includeWalls,
    excluded,
    effectiveWallSqft,
    effectiveCeilingSqft,
    effectiveTotalSqft,
  };
}
