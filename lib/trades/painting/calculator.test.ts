import { describe, it, expect } from "vitest";
import {
  calculatePaintingEstimate,
  calculatePaintingRange,
  CalculatePaintingParams,
} from "./calculator";
import { PaintingRates } from "@/hooks/useProfile";

const defaultRates: PaintingRates = {
  labor_per_sqft: 1.75,
  material_per_sqft: 0.5,
  ceiling_modifier: 1.2,
};

const createParams = (
  overrides: Partial<CalculatePaintingParams> = {}
): CalculatePaintingParams => ({
  wallSqft: 400,
  ceilingSqft: 100,
  coatCount: 2,
  paintQuality: "standard",
  surfacePrep: "none",
  complexity: "standard",
  addons: [],
  rates: defaultRates,
  ...overrides,
});

describe("calculatePaintingEstimate", () => {
  it("calculates basic painting estimate", () => {
    const params = createParams();
    const result = calculatePaintingEstimate(params);

    // Total sqft
    expect(result.totalSqft).toBe(500);
    expect(result.wallSqft).toBe(400);
    expect(result.ceilingSqft).toBe(100);

    // Labor: walls = 400 * 1.75 * 1.0 = 700
    // Labor: ceilings = 100 * 1.75 * 1.0 * 1.2 = 210
    expect(result.laborSubtotal).toBe(910);

    // Materials: 500 * 0.5 * 1.0 * 1.0 = 250
    expect(result.materialSubtotal).toBe(250);

    // No prep cost (none selected)
    expect(result.prepSubtotal).toBe(0);

    // No addons
    expect(result.addonsSubtotal).toBe(0);

    // Total
    expect(result.total).toBe(1160);
    expect(result.complexityMultiplier).toBe(1.0);
    expect(result.complexityAdjustment).toBe(0);
  });

  it("applies coat multiplier", () => {
    // 1 coat = 0.7 multiplier
    const oneCoat = calculatePaintingEstimate(createParams({ coatCount: 1 }));
    // 3 coats = 1.35 multiplier
    const threeCoats = calculatePaintingEstimate(
      createParams({ coatCount: 3 })
    );

    // Labor scales with coats
    expect(oneCoat.laborSubtotal).toBeCloseTo(637); // 910 * 0.7
    expect(threeCoats.laborSubtotal).toBeCloseTo(1228.5); // 910 * 1.35

    // Material scales with coats
    expect(oneCoat.materialSubtotal).toBeCloseTo(175); // 250 * 0.7
    expect(threeCoats.materialSubtotal).toBeCloseTo(337.5); // 250 * 1.35
  });

  it("applies paint quality multiplier to materials only", () => {
    const premium = calculatePaintingEstimate(
      createParams({ paintQuality: "premium" })
    );
    const specialty = calculatePaintingEstimate(
      createParams({ paintQuality: "specialty" })
    );

    // Premium = 1.4x material cost
    expect(premium.materialSubtotal).toBe(350); // 250 * 1.4
    expect(premium.laborSubtotal).toBe(910); // Unchanged

    // Specialty = 2.0x material cost
    expect(specialty.materialSubtotal).toBe(500); // 250 * 2.0
  });

  it("applies surface prep costs", () => {
    const light = calculatePaintingEstimate(
      createParams({ surfacePrep: "light" })
    );
    const heavy = calculatePaintingEstimate(
      createParams({ surfacePrep: "heavy" })
    );

    // Light prep = $0.15 per sqft
    expect(light.prepSubtotal).toBe(75); // 500 * 0.15

    // Heavy prep = $0.35 per sqft
    expect(heavy.prepSubtotal).toBe(175); // 500 * 0.35
  });

  it("applies complexity multiplier", () => {
    const simple = calculatePaintingEstimate(
      createParams({ complexity: "simple" })
    );
    const complex = calculatePaintingEstimate(
      createParams({ complexity: "complex" })
    );

    // Simple = 0.85x
    expect(simple.complexityMultiplier).toBe(0.85);
    expect(simple.complexityAdjustment).toBeCloseTo(-174); // 1160 * -0.15

    // Complex = 1.3x
    expect(complex.complexityMultiplier).toBe(1.3);
    expect(complex.complexityAdjustment).toBeCloseTo(348); // 1160 * 0.3
  });

  it("includes addon costs", () => {
    const params = createParams({
      addons: [
        { id: "door_paint", quantity: 3, total: 225 }, // 3 doors * $75
        { id: "furniture_moving", quantity: 1, total: 100 },
      ],
    });
    const result = calculatePaintingEstimate(params);

    expect(result.addonsSubtotal).toBe(325);
    // Total includes addons before complexity adjustment
    expect(result.subtotal).toBe(1485); // 1160 + 325
  });

  it("calculates cost per sqft", () => {
    const result = calculatePaintingEstimate(createParams());

    // $1160 / 500 sqft = $2.32 per sqft
    expect(result.costPerSqft).toBeCloseTo(2.32);
  });

  it("provides estimate range (±15%)", () => {
    const result = calculatePaintingEstimate(createParams());

    expect(result.rangeLow).toBeCloseTo(986); // 1160 * 0.85
    expect(result.rangeHigh).toBeCloseTo(1334); // 1160 * 1.15
  });

  it("handles zero sqft gracefully", () => {
    const result = calculatePaintingEstimate(
      createParams({ wallSqft: 0, ceilingSqft: 0 })
    );

    expect(result.totalSqft).toBe(0);
    expect(result.total).toBe(0);
    expect(result.costPerSqft).toBe(0);
  });

  it("handles walls only (no ceiling)", () => {
    const result = calculatePaintingEstimate(
      createParams({ ceilingSqft: 0 })
    );

    expect(result.totalSqft).toBe(400);
    expect(result.ceilingSqft).toBe(0);
    // Labor: 400 * 1.75 * 1.0 = 700 (no ceiling modifier)
    expect(result.laborSubtotal).toBe(700);
  });

  it("uses fallback rates when not provided", () => {
    const params = createParams({
      rates: {} as PaintingRates, // Empty rates object
    });
    const result = calculatePaintingEstimate(params);

    // Should use mid-range defaults
    // Labor: 400 * 1.75 + 100 * 1.75 * 1.2 = 700 + 210 = 910
    expect(result.laborSubtotal).toBe(910);
  });
});

describe("calculatePaintingRange", () => {
  it("calculates range using low and high industry rates", () => {
    const result = calculatePaintingRange({
      wallSqft: 400,
      ceilingSqft: 100,
      coatCount: 2,
      paintQuality: "standard",
      surfacePrep: "none",
      complexity: "standard",
      addons: [],
    });

    // Low rates: labor 1.25, material 0.35, ceiling 1.1
    // High rates: labor 2.5, material 0.75, ceiling 1.35
    expect(result.rangeLow).toBeLessThan(result.rangeHigh);
    expect(result.rangeLow).toBeGreaterThan(0);
  });
});
