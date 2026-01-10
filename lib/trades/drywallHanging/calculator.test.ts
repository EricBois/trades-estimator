import { describe, it, expect } from "vitest";
import {
  feetInchesToFeet,
  calculateOpeningSqft,
  calculateLShapeWalls,
  calculateLShapeCeiling,
  calculateCustomWallsSqft,
  calculateRoomSqft,
  calculateSheetsNeeded,
  calculateTotalRoomsSqft,
  suggestSheetSize,
  createOpening,
  recalculateOpening,
  calculateMaterialCostWithMarkup,
  calculateCostPerSqft,
} from "./calculator";
import { HangingRoom, LShapeDimensions, WallSegment } from "./types";

describe("feetInchesToFeet", () => {
  it("converts feet only", () => {
    expect(feetInchesToFeet(10, 0)).toBe(10);
  });

  it("converts feet and inches", () => {
    expect(feetInchesToFeet(10, 6)).toBe(10.5);
  });

  it("handles 0 feet", () => {
    expect(feetInchesToFeet(0, 6)).toBe(0.5);
  });

  it("handles 12 inches as 1 foot", () => {
    expect(feetInchesToFeet(0, 12)).toBe(1);
  });
});

describe("calculateOpeningSqft", () => {
  it("calculates standard door size", () => {
    // 36" x 80" = 2880 sq inches = 20 sqft
    expect(calculateOpeningSqft(36, 80)).toBe(20);
  });

  it("calculates small window", () => {
    // 24" x 36" = 864 sq inches = 6 sqft
    expect(calculateOpeningSqft(24, 36)).toBe(6);
  });

  it("handles zero dimensions", () => {
    expect(calculateOpeningSqft(0, 80)).toBe(0);
    expect(calculateOpeningSqft(36, 0)).toBe(0);
  });
});

describe("calculateLShapeWalls", () => {
  it("calculates L-shape wall area", () => {
    const dims: LShapeDimensions = {
      mainLengthFeet: 12,
      mainLengthInches: 0,
      mainWidthFeet: 10,
      mainWidthInches: 0,
      extLengthFeet: 8,
      extLengthInches: 0,
      extWidthFeet: 6,
      extWidthInches: 0,
    };
    // Perimeter: 12 + 10 + 8 + 6 + (10-6) + (12-8) = 12+10+8+6+4+4 = 44
    // Wall area at 8ft height = 44 * 8 = 352 sqft
    const result = calculateLShapeWalls(dims, 8, 0);
    expect(result).toBe(352);
  });

  it("handles L-shape with inches", () => {
    const dims: LShapeDimensions = {
      mainLengthFeet: 12,
      mainLengthInches: 6,
      mainWidthFeet: 10,
      mainWidthInches: 0,
      extLengthFeet: 8,
      extLengthInches: 0,
      extWidthFeet: 6,
      extWidthInches: 0,
    };
    const result = calculateLShapeWalls(dims, 8, 0);
    // Main length is now 12.5, so perimeter changes
    // 12.5 + 10 + 8 + 6 + 4 + 4.5 = 45
    expect(result).toBe(360);
  });
});

describe("calculateLShapeCeiling", () => {
  it("calculates L-shape ceiling area", () => {
    const dims: LShapeDimensions = {
      mainLengthFeet: 12,
      mainLengthInches: 0,
      mainWidthFeet: 10,
      mainWidthInches: 0,
      extLengthFeet: 8,
      extLengthInches: 0,
      extWidthFeet: 6,
      extWidthInches: 0,
    };
    // Main area = 12 * 10 = 120
    // Extension area = 8 * 6 = 48
    // Total = 168 sqft
    expect(calculateLShapeCeiling(dims)).toBe(168);
  });
});

describe("calculateCustomWallsSqft", () => {
  it("calculates total wall area from segments", () => {
    const walls: WallSegment[] = [
      { id: "1", lengthFeet: 10, lengthInches: 0, label: "Wall 1", sqft: 0 },
      { id: "2", lengthFeet: 12, lengthInches: 0, label: "Wall 2", sqft: 0 },
      { id: "3", lengthFeet: 10, lengthInches: 0, label: "Wall 3", sqft: 0 },
      { id: "4", lengthFeet: 12, lengthInches: 0, label: "Wall 4", sqft: 0 },
    ];
    // Total perimeter = 44ft, height 8ft = 352 sqft
    expect(calculateCustomWallsSqft(walls, 8, 0)).toBe(352);
  });

  it("handles walls with inches", () => {
    const walls: WallSegment[] = [
      { id: "1", lengthFeet: 10, lengthInches: 6, label: "Wall 1", sqft: 0 },
    ];
    // 10.5ft * 8ft = 84 sqft
    expect(calculateCustomWallsSqft(walls, 8, 0)).toBe(84);
  });

  it("handles empty walls array", () => {
    expect(calculateCustomWallsSqft([], 8, 0)).toBe(0);
  });
});

describe("calculateRoomSqft", () => {
  const createRoom = (overrides: Partial<HangingRoom> = {}): HangingRoom => ({
    id: "test-room",
    name: "Test Room",
    shape: "rectangular",
    lengthFeet: 12,
    lengthInches: 0,
    widthFeet: 10,
    widthInches: 0,
    heightFeet: 8,
    heightInches: 0,
    includeCeiling: false,
    doors: [],
    windows: [],
    customWalls: [],
    grossWallSqft: 0,
    wallSqft: 0,
    ceilingSqft: 0,
    openingsSqft: 0,
    grossTotalSqft: 0,
    totalSqft: 0,
    ...overrides,
  });

  it("calculates rectangular room walls", () => {
    const room = createRoom();
    const result = calculateRoomSqft(room);
    // Perimeter = 2*(12+10) = 44ft, height 8ft = 352 sqft
    expect(result.wallSqft).toBe(352);
    expect(result.grossWallSqft).toBe(352);
    expect(result.ceilingSqft).toBe(0);
  });

  it("includes ceiling when requested", () => {
    const room = createRoom({ includeCeiling: true });
    const result = calculateRoomSqft(room);
    expect(result.ceilingSqft).toBe(120); // 12 * 10
    expect(result.totalSqft).toBe(472); // 352 + 120
  });

  it("subtracts door openings", () => {
    const room = createRoom({
      doors: [
        {
          id: "d1",
          presetId: "standard_door",
          label: "Standard Door",
          width: 36,
          height: 80,
          quantity: 1,
          sqft: 20,
          totalSqft: 20,
        },
      ],
    });
    const result = calculateRoomSqft(room);
    expect(result.grossWallSqft).toBe(352);
    expect(result.openingsSqft).toBe(20);
    expect(result.wallSqft).toBe(332);
  });

  it("subtracts multiple openings with quantities", () => {
    const room = createRoom({
      doors: [
        {
          id: "d1",
          presetId: "standard_door",
          label: "Standard Door",
          width: 36,
          height: 80,
          quantity: 2,
          sqft: 20,
          totalSqft: 40,
        },
      ],
      windows: [
        {
          id: "w1",
          presetId: "small_window",
          label: "Small Window",
          width: 24,
          height: 36,
          quantity: 3,
          sqft: 6,
          totalSqft: 18,
        },
      ],
    });
    const result = calculateRoomSqft(room);
    expect(result.openingsSqft).toBe(58);
    expect(result.wallSqft).toBe(294);
  });

  it("wall area cannot go negative with large openings", () => {
    const room = createRoom({
      lengthFeet: 5,
      widthFeet: 5,
      doors: [
        {
          id: "d1",
          presetId: "huge_opening",
          label: "Huge Opening",
          width: 100,
          height: 100,
          quantity: 10,
          sqft: 69.4,
          totalSqft: 694,
        },
      ],
    });
    const result = calculateRoomSqft(room);
    expect(result.wallSqft).toBe(0);
    expect(result.wallSqft).toBeGreaterThanOrEqual(0);
  });

  it("handles L-shape rooms", () => {
    const room = createRoom({
      shape: "l_shape",
      lShapeDimensions: {
        mainLengthFeet: 12,
        mainLengthInches: 0,
        mainWidthFeet: 10,
        mainWidthInches: 0,
        extLengthFeet: 8,
        extLengthInches: 0,
        extWidthFeet: 6,
        extWidthInches: 0,
      },
      includeCeiling: true,
    });
    const result = calculateRoomSqft(room);
    expect(result.wallSqft).toBe(352);
    expect(result.ceilingSqft).toBe(168);
    expect(result.totalSqft).toBe(520);
  });

  it("handles custom wall rooms", () => {
    const room = createRoom({
      shape: "custom",
      customWalls: [
        { id: "1", lengthFeet: 10, lengthInches: 0, label: "Wall 1", sqft: 0 },
        { id: "2", lengthFeet: 15, lengthInches: 0, label: "Wall 2", sqft: 0 },
        { id: "3", lengthFeet: 10, lengthInches: 0, label: "Wall 3", sqft: 0 },
        { id: "4", lengthFeet: 15, lengthInches: 0, label: "Wall 4", sqft: 0 },
      ],
      customCeilingSqft: 150,
      includeCeiling: true,
    });
    const result = calculateRoomSqft(room);
    expect(result.wallSqft).toBe(400); // 50ft * 8ft
    expect(result.ceilingSqft).toBe(150);
    expect(result.totalSqft).toBe(550);
  });
});

describe("calculateSheetsNeeded", () => {
  it("calculates sheets for simple sqft", () => {
    // 320 sqft with 4x8 sheets (32 sqft each), 0% waste = 10 sheets
    expect(calculateSheetsNeeded(320, "4x8", 0)).toBe(10);
  });

  it("applies waste factor", () => {
    // 320 sqft * 1.12 = 358.4 sqft / 32 = 11.2 -> 12 sheets
    expect(calculateSheetsNeeded(320, "4x8", 0.12)).toBe(12);
  });

  it("rounds up partial sheets", () => {
    // 33 sqft / 32 = 1.03 -> 2 sheets
    expect(calculateSheetsNeeded(33, "4x8", 0)).toBe(2);
  });

  it("handles different sheet sizes", () => {
    // 400 sqft with 4x10 sheets (40 sqft each), 0% waste = 10 sheets
    expect(calculateSheetsNeeded(400, "4x10", 0)).toBe(10);
    // 480 sqft with 4x12 sheets (48 sqft each), 0% waste = 10 sheets
    expect(calculateSheetsNeeded(480, "4x12", 0)).toBe(10);
  });

  it("handles zero sqft", () => {
    expect(calculateSheetsNeeded(0, "4x8", 0.12)).toBe(0);
  });
});

describe("calculateTotalRoomsSqft", () => {
  const createRoom = (overrides: Partial<HangingRoom> = {}): HangingRoom => ({
    id: "test-room",
    name: "Test Room",
    shape: "rectangular",
    lengthFeet: 10,
    lengthInches: 0,
    widthFeet: 10,
    widthInches: 0,
    heightFeet: 8,
    heightInches: 0,
    includeCeiling: false,
    doors: [],
    windows: [],
    customWalls: [],
    grossWallSqft: 0,
    wallSqft: 0,
    ceilingSqft: 0,
    openingsSqft: 0,
    grossTotalSqft: 0,
    totalSqft: 0,
    ...overrides,
  });

  it("sums multiple rooms", () => {
    const rooms = [
      createRoom({ id: "1", name: "Room 1" }),
      createRoom({ id: "2", name: "Room 2" }),
    ];
    const result = calculateTotalRoomsSqft(rooms);
    // Each room: 2*(10+10)*8 = 320 sqft walls
    expect(result.totalWallSqft).toBe(640);
    expect(result.grandTotalSqft).toBe(640);
  });

  it("includes ceilings from all rooms", () => {
    const rooms = [
      createRoom({ id: "1", name: "Room 1", includeCeiling: true }),
      createRoom({ id: "2", name: "Room 2", includeCeiling: true }),
    ];
    const result = calculateTotalRoomsSqft(rooms);
    // Each room ceiling: 10*10 = 100 sqft
    expect(result.totalCeilingSqft).toBe(200);
    expect(result.grandTotalSqft).toBe(840);
  });

  it("handles empty rooms array", () => {
    const result = calculateTotalRoomsSqft([]);
    expect(result.totalWallSqft).toBe(0);
    expect(result.grandTotalSqft).toBe(0);
  });
});

describe("suggestSheetSize", () => {
  it("suggests 4x8 for 8ft ceilings", () => {
    expect(suggestSheetSize(8, 0)).toBe("4x8");
  });

  it("suggests 4x10 for 9ft ceilings", () => {
    expect(suggestSheetSize(9, 0)).toBe("4x10");
  });

  it("suggests 4x12 for 10ft+ ceilings", () => {
    expect(suggestSheetSize(10, 0)).toBe("4x12");
    expect(suggestSheetSize(12, 0)).toBe("4x12");
  });

  it("handles feet with inches", () => {
    expect(suggestSheetSize(8, 6)).toBe("4x10");
    expect(suggestSheetSize(9, 6)).toBe("4x12");
  });
});

describe("createOpening", () => {
  it("creates door opening with calculated sqft", () => {
    const opening = createOpening("standard_door", "Standard Door", 36, 80, 1);
    expect(opening.presetId).toBe("standard_door");
    expect(opening.label).toBe("Standard Door");
    expect(opening.width).toBe(36);
    expect(opening.height).toBe(80);
    expect(opening.quantity).toBe(1);
    expect(opening.sqft).toBe(20);
    expect(opening.totalSqft).toBe(20);
  });

  it("multiplies sqft by quantity", () => {
    const opening = createOpening("standard_door", "Standard Door", 36, 80, 3);
    expect(opening.sqft).toBe(20);
    expect(opening.totalSqft).toBe(60);
  });

  it("defaults quantity to 1", () => {
    const opening = createOpening("custom", "Custom", 48, 48);
    expect(opening.quantity).toBe(1);
    expect(opening.sqft).toBe(16);
    expect(opening.totalSqft).toBe(16);
  });
});

describe("recalculateOpening", () => {
  it("recalculates sqft based on dimensions", () => {
    const opening = recalculateOpening({
      id: "test",
      presetId: "custom",
      label: "Custom",
      width: 48,
      height: 48,
      quantity: 2,
      sqft: 0, // Incorrect
      totalSqft: 0, // Incorrect
    });
    expect(opening.sqft).toBe(16);
    expect(opening.totalSqft).toBe(32);
  });
});

describe("calculateMaterialCostWithMarkup", () => {
  it("applies percentage markup", () => {
    expect(calculateMaterialCostWithMarkup(100, 15)).toBeCloseTo(115);
    expect(calculateMaterialCostWithMarkup(100, 20)).toBeCloseTo(120);
  });

  it("handles zero markup", () => {
    expect(calculateMaterialCostWithMarkup(100, 0)).toBe(100);
  });

  it("handles decimal costs", () => {
    expect(calculateMaterialCostWithMarkup(12.5, 10)).toBeCloseTo(13.75);
  });
});

describe("calculateCostPerSqft", () => {
  it("calculates cost per sqft for 4x8 sheets", () => {
    // 10 sheets * ($12 material + $8 labor) = $200
    // 10 * 32 sqft = 320 sqft
    // $200 / 320 = $0.625 per sqft
    const result = calculateCostPerSqft(10, 12, 8, "4x8");
    expect(result).toBe(0.63);
  });

  it("handles different sheet sizes", () => {
    // 10 sheets * ($12 material + $8 labor) = $200
    // 10 * 48 sqft = 480 sqft
    // $200 / 480 = $0.4167 per sqft
    const result = calculateCostPerSqft(10, 12, 8, "4x12");
    expect(result).toBe(0.42);
  });

  it("handles zero sheets", () => {
    expect(calculateCostPerSqft(0, 12, 8, "4x8")).toBe(0);
  });
});
