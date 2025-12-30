import { HangingRoom, HangingOpening, DrywallSheetSize } from "./types";
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
 * Calculate room square footage (walls + optional ceiling - openings)
 */
export function calculateRoomSqft(room: HangingRoom): {
  wallSqft: number;
  ceilingSqft: number;
  openingsSqft: number;
  totalSqft: number;
} {
  // Convert dimensions to feet
  const length = feetInchesToFeet(room.lengthFeet, room.lengthInches);
  const width = feetInchesToFeet(room.widthFeet, room.widthInches);
  const height = feetInchesToFeet(room.heightFeet, room.heightInches);

  // Wall area = perimeter × height
  const perimeter = 2 * (length + width);
  const wallArea = perimeter * height;

  // Ceiling area (if included)
  const ceilingArea = room.includeCeiling ? length * width : 0;

  // Total openings sqft
  const doorsSqft = room.doors.reduce((sum, d) => sum + d.totalSqft, 0);
  const windowsSqft = room.windows.reduce((sum, w) => sum + w.totalSqft, 0);
  const openingsSqft = doorsSqft + windowsSqft;

  // Net wall area (cannot go negative)
  const netWallArea = Math.max(0, wallArea - openingsSqft);

  return {
    wallSqft: Math.round(netWallArea * 100) / 100,
    ceilingSqft: Math.round(ceilingArea * 100) / 100,
    openingsSqft: Math.round(openingsSqft * 100) / 100,
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
 */
export function calculateTotalRoomsSqft(rooms: HangingRoom[]): {
  totalWallSqft: number;
  totalCeilingSqft: number;
  totalOpeningsSqft: number;
  grandTotalSqft: number;
} {
  let totalWallSqft = 0;
  let totalCeilingSqft = 0;
  let totalOpeningsSqft = 0;

  for (const room of rooms) {
    const calculated = calculateRoomSqft(room);
    totalWallSqft += calculated.wallSqft;
    totalCeilingSqft += calculated.ceilingSqft;
    totalOpeningsSqft += calculated.openingsSqft;
  }

  return {
    totalWallSqft: Math.round(totalWallSqft * 100) / 100,
    totalCeilingSqft: Math.round(totalCeilingSqft * 100) / 100,
    totalOpeningsSqft: Math.round(totalOpeningsSqft * 100) / 100,
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
