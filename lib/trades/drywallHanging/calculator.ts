import {
  HangingRoom,
  HangingOpening,
  DrywallSheetSize,
  LShapeDimensions,
  WallSegment,
} from "./types";
import { getSheetSize } from "./constants";

/**
 * Convert feet and inches to total feet
 */
export function feetInchesToFeet(feet: number, inches: number): number {
  return feet + inches / 12;
}

/**
 * Calculate opening square footage from width/height in inches
 */
export function calculateOpeningSqft(
  widthInches: number,
  heightInches: number
): number {
  return (widthInches * heightInches) / 144; // 144 sq inches per sq ft
}

/**
 * Calculate L-shape wall area
 * L-shape has 6 walls when viewed from above
 */
export function calculateLShapeWalls(
  dims: LShapeDimensions,
  heightFeet: number,
  heightInches: number
): number {
  const height = feetInchesToFeet(heightFeet, heightInches);
  const mainLength = feetInchesToFeet(
    dims.mainLengthFeet,
    dims.mainLengthInches
  );
  const mainWidth = feetInchesToFeet(dims.mainWidthFeet, dims.mainWidthInches);
  const extLength = feetInchesToFeet(dims.extLengthFeet, dims.extLengthInches);
  const extWidth = feetInchesToFeet(dims.extWidthFeet, dims.extWidthInches);

  // L-shape perimeter calculation:
  // Outer walls: mainLength + mainWidth + extLength + extWidth
  // Inner walls (the corner): (mainWidth - extWidth) + (mainLength - extLength)
  // But this simplifies to: 2*(mainLength + mainWidth + extLength + extWidth) - 2*min overlap
  // Actually, for an L-shape: perimeter = 2*mainLength + 2*extWidth + 2*abs(mainWidth - extWidth) + 2*abs(mainLength - extLength)
  // Simpler: perimeter = 2*(mainLength + mainWidth) + 2*(extLength + extWidth) - 2*overlap
  // Where overlap = min(mainWidth, extWidth) + min(mainLength, extLength) but only one applies

  // Clearer calculation: sum of all 6 wall lengths
  // Wall 1: mainLength (full length of main section)
  // Wall 2: mainWidth (full width of main section)
  // Wall 3: extLength (extension length)
  // Wall 4: extWidth (extension width)
  // Wall 5: mainWidth - extWidth (inner corner, horizontal part)
  // Wall 6: mainLength - extLength (inner corner, vertical part)
  const wall1 = mainLength;
  const wall2 = mainWidth;
  const wall3 = extLength;
  const wall4 = extWidth;
  const wall5 = Math.max(0, mainWidth - extWidth);
  const wall6 = Math.max(0, mainLength - extLength);

  const perimeter = wall1 + wall2 + wall3 + wall4 + wall5 + wall6;
  return perimeter * height;
}

/**
 * Calculate L-shape ceiling area
 */
export function calculateLShapeCeiling(dims: LShapeDimensions): number {
  const mainLength = feetInchesToFeet(
    dims.mainLengthFeet,
    dims.mainLengthInches
  );
  const mainWidth = feetInchesToFeet(dims.mainWidthFeet, dims.mainWidthInches);
  const extLength = feetInchesToFeet(dims.extLengthFeet, dims.extLengthInches);
  const extWidth = feetInchesToFeet(dims.extWidthFeet, dims.extWidthInches);

  // L-shape area = main rectangle + extension rectangle - overlap
  // For proper L-shape, extension overlaps with main section
  const mainArea = mainLength * mainWidth;
  const extArea = extLength * extWidth;

  // The extension is positioned at corner, so we add without overlap
  // (assuming extension dimensions are additional, not including main)
  return mainArea + extArea;
}

/**
 * Calculate custom walls total sqft
 */
export function calculateCustomWallsSqft(
  walls: WallSegment[],
  heightFeet: number,
  heightInches: number
): number {
  const height = feetInchesToFeet(heightFeet, heightInches);

  return walls.reduce((sum, wall) => {
    const wallLength = feetInchesToFeet(wall.lengthFeet, wall.lengthInches);
    return sum + wallLength * height;
  }, 0);
}

/**
 * Calculate rectangular room walls
 */
function calculateRectangularWalls(
  lengthFeet: number,
  lengthInches: number,
  widthFeet: number,
  widthInches: number,
  heightFeet: number,
  heightInches: number
): { wallArea: number; ceilingArea: number } {
  const length = feetInchesToFeet(lengthFeet, lengthInches);
  const width = feetInchesToFeet(widthFeet, widthInches);
  const height = feetInchesToFeet(heightFeet, heightInches);

  const perimeter = 2 * (length + width);
  const wallArea = perimeter * height;
  const ceilingArea = length * width;

  return { wallArea, ceilingArea };
}

/**
 * Calculate room square footage (walls + optional ceiling - openings)
 * Returns both gross (before openings) and net (after openings) values
 */
export function calculateRoomSqft(room: HangingRoom): {
  grossWallSqft: number;
  wallSqft: number;
  ceilingSqft: number;
  openingsSqft: number;
  grossTotalSqft: number;
  totalSqft: number;
} {
  let wallArea = 0;
  let ceilingArea = 0;

  const shape = room.shape || "rectangular";

  switch (shape) {
    case "l_shape": {
      if (room.lShapeDimensions) {
        wallArea = calculateLShapeWalls(
          room.lShapeDimensions,
          room.heightFeet,
          room.heightInches
        );
        if (room.includeCeiling) {
          ceilingArea = calculateLShapeCeiling(room.lShapeDimensions);
        }
      }
      break;
    }

    case "custom": {
      if (room.customWalls && room.customWalls.length > 0) {
        wallArea = calculateCustomWallsSqft(
          room.customWalls,
          room.heightFeet,
          room.heightInches
        );
      }
      if (room.includeCeiling && room.customCeilingSqft !== undefined) {
        ceilingArea = room.customCeilingSqft;
      }
      break;
    }

    case "rectangular":
    default: {
      const result = calculateRectangularWalls(
        room.lengthFeet,
        room.lengthInches,
        room.widthFeet,
        room.widthInches,
        room.heightFeet,
        room.heightInches
      );
      wallArea = result.wallArea;
      if (room.includeCeiling) {
        ceilingArea = result.ceilingArea;
      }
      break;
    }
  }

  // Total openings sqft
  const doorsSqft = room.doors.reduce((sum, d) => sum + d.totalSqft, 0);
  const windowsSqft = room.windows.reduce((sum, w) => sum + w.totalSqft, 0);
  const openingsSqft = doorsSqft + windowsSqft;

  // Net wall area (cannot go negative)
  const netWallArea = Math.max(0, wallArea - openingsSqft);

  return {
    grossWallSqft: Math.round(wallArea * 100) / 100,
    wallSqft: Math.round(netWallArea * 100) / 100,
    ceilingSqft: Math.round(ceilingArea * 100) / 100,
    openingsSqft: Math.round(openingsSqft * 100) / 100,
    grossTotalSqft: Math.round((wallArea + ceilingArea) * 100) / 100,
    totalSqft: Math.round((netWallArea + ceilingArea) * 100) / 100,
  };
}

/**
 * Calculate number of sheets needed for a given square footage
 */
export function calculateSheetsNeeded(
  sqft: number,
  sheetSize: DrywallSheetSize,
  wasteFactor: number
): number {
  const size = getSheetSize(sheetSize);
  if (!size) return 0;

  const withWaste = sqft * (1 + wasteFactor);
  return Math.ceil(withWaste / size.sqft);
}

/**
 * Calculate total square footage from all rooms
 * Returns both gross (before openings) and net (after openings) totals
 */
export function calculateTotalRoomsSqft(rooms: HangingRoom[]): {
  totalGrossWallSqft: number;
  totalWallSqft: number;
  totalCeilingSqft: number;
  totalOpeningsSqft: number;
  grossGrandTotalSqft: number;
  grandTotalSqft: number;
} {
  let totalGrossWallSqft = 0;
  let totalWallSqft = 0;
  let totalCeilingSqft = 0;
  let totalOpeningsSqft = 0;

  for (const room of rooms) {
    const calculated = calculateRoomSqft(room);
    totalGrossWallSqft += calculated.grossWallSqft;
    totalWallSqft += calculated.wallSqft;
    totalCeilingSqft += calculated.ceilingSqft;
    totalOpeningsSqft += calculated.openingsSqft;
  }

  return {
    totalGrossWallSqft: Math.round(totalGrossWallSqft * 100) / 100,
    totalWallSqft: Math.round(totalWallSqft * 100) / 100,
    totalCeilingSqft: Math.round(totalCeilingSqft * 100) / 100,
    totalOpeningsSqft: Math.round(totalOpeningsSqft * 100) / 100,
    grossGrandTotalSqft:
      Math.round((totalGrossWallSqft + totalCeilingSqft) * 100) / 100,
    grandTotalSqft: Math.round((totalWallSqft + totalCeilingSqft) * 100) / 100,
  };
}

/**
 * Suggest optimal sheet size based on ceiling height
 */
export function suggestSheetSize(
  heightFeet: number,
  heightInches: number
): DrywallSheetSize {
  const totalHeight = feetInchesToFeet(heightFeet, heightInches);

  // For standard 8' or lower ceilings, use 4x8 sheets
  if (totalHeight <= 8) {
    return "4x8";
  }
  // For 9' ceilings, 4x10 reduces seams
  if (totalHeight <= 9) {
    return "4x10";
  }
  // For 10' or higher, use 4x12
  return "4x12";
}

/**
 * Create a new opening object
 */
export function createOpening(
  presetId: string,
  label: string,
  widthInches: number,
  heightInches: number,
  quantity: number = 1
): Omit<HangingOpening, "id"> {
  const sqft = calculateOpeningSqft(widthInches, heightInches);
  return {
    presetId,
    label,
    width: widthInches,
    height: heightInches,
    quantity,
    sqft: Math.round(sqft * 100) / 100,
    totalSqft: Math.round(sqft * quantity * 100) / 100,
  };
}

/**
 * Update opening with recalculated sqft
 */
export function recalculateOpening(opening: HangingOpening): HangingOpening {
  const sqft = calculateOpeningSqft(opening.width, opening.height);
  return {
    ...opening,
    sqft: Math.round(sqft * 100) / 100,
    totalSqft: Math.round(sqft * opening.quantity * 100) / 100,
  };
}

/**
 * Calculate material cost with optional markup percentage
 */
export function calculateMaterialCostWithMarkup(
  baseCost: number,
  markupPercent: number
): number {
  return baseCost * (1 + markupPercent / 100);
}

/**
 * Calculate cost per sqft from sheet costs and size
 */
export function calculateCostPerSqft(
  sheetsCount: number,
  materialPerSheet: number,
  laborPerSheet: number,
  sheetSize: DrywallSheetSize
): number {
  const size = getSheetSize(sheetSize);
  if (!size || sheetsCount === 0) return 0;

  const totalCost = sheetsCount * (materialPerSheet + laborPerSheet);
  const totalSqft = sheetsCount * size.sqft;
  return Math.round((totalCost / totalSqft) * 100) / 100;
}
