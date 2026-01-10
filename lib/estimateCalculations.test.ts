import { describe, it, expect } from "vitest";
import { calculateEstimateRange, formatCurrency } from "./estimateCalculations";

describe("calculateEstimateRange", () => {
  const baseTemplate = {
    baseLaborHours: 10,
    baseMaterialCost: 100,
    complexityMultipliers: null,
  };

  it("returns null when template is null", () => {
    const result = calculateEstimateRange({
      template: null,
      parameters: {},
      complexity: "standard",
      hourlyRate: 75,
    });
    expect(result).toBeNull();
  });

  it("calculates base estimate with standard complexity", () => {
    const result = calculateEstimateRange({
      template: baseTemplate,
      parameters: {},
      complexity: "standard",
      hourlyRate: 75,
    });
    // Labor: 10 hours * $75 * 1.0 = $750
    // Material: $100 * 1.0 = $100
    // Total: $850
    expect(result).not.toBeNull();
    expect(result!.total).toBe(850);
  });

  it("applies simple complexity multiplier", () => {
    const result = calculateEstimateRange({
      template: baseTemplate,
      parameters: {},
      complexity: "simple",
      hourlyRate: 75,
    });
    // Labor: 10 * $75 * 0.8 = $600
    // Material: $100 * 0.8 = $80
    // Total: $680
    expect(result!.total).toBe(680);
  });

  it("applies complex complexity multiplier", () => {
    const result = calculateEstimateRange({
      template: baseTemplate,
      parameters: {},
      complexity: "complex",
      hourlyRate: 75,
    });
    // Labor: 10 * $75 * 1.3 = $975
    // Material: $100 * 1.3 = $130
    // Total: $1105
    expect(result!.total).toBe(1105);
  });

  it("applies premium complexity multiplier", () => {
    const result = calculateEstimateRange({
      template: baseTemplate,
      parameters: {},
      complexity: "premium",
      hourlyRate: 75,
    });
    // Labor: 10 * $75 * 1.6 = $1200
    // Material: $100 * 1.6 = $160
    // Total: $1360
    expect(result!.total).toBe(1360);
  });

  it("uses different hourly rates", () => {
    const result = calculateEstimateRange({
      template: baseTemplate,
      parameters: {},
      complexity: "standard",
      hourlyRate: 100,
    });
    // Labor: 10 * $100 * 1.0 = $1000
    // Material: $100 * 1.0 = $100
    // Total: $1100
    expect(result!.total).toBe(1100);
  });

  it("applies parameter multipliers", () => {
    const template = {
      baseLaborHours: 5,
      baseMaterialCost: 50,
      complexityMultipliers: {
        room_count: 100, // $100 per room
        square_feet: 0.5, // $0.50 per sqft
      },
    };
    const result = calculateEstimateRange({
      template,
      parameters: {
        room_count: 3,
        square_feet: 200,
      },
      complexity: "standard",
      hourlyRate: 75,
    });
    // Base: (5 * $75) + $50 = $425
    // Room adjustment: 3 * $100 = $300
    // Sqft adjustment: 200 * $0.50 = $100
    // Total: $425 + $300 + $100 = $825
    expect(result!.total).toBe(825);
  });

  it("ignores non-numeric parameter values", () => {
    const template = {
      baseLaborHours: 5,
      baseMaterialCost: 50,
      complexityMultipliers: {
        room_count: 100,
        room_type: 50, // This won't apply since value is a string
      },
    };
    const result = calculateEstimateRange({
      template,
      parameters: {
        room_count: 2,
        room_type: "bedroom", // String value - should be ignored
      },
      complexity: "standard",
      hourlyRate: 75,
    });
    // Base: (5 * $75) + $50 = $425
    // Room adjustment: 2 * $100 = $200
    // No room_type adjustment (value is string)
    // Total: $625
    expect(result!.total).toBe(625);
  });

  it("handles template without complexity multipliers", () => {
    const template = {
      baseLaborHours: 8,
      baseMaterialCost: 200,
      complexityMultipliers: null,
    };
    const result = calculateEstimateRange({
      template,
      parameters: { some_param: 5 },
      complexity: "standard",
      hourlyRate: 50,
    });
    // Base: (8 * $50) + $200 = $600
    // No parameter adjustments since complexityMultipliers is null
    expect(result!.total).toBe(600);
  });

  it("defaults to multiplier 1.0 for unknown complexity", () => {
    const result = calculateEstimateRange({
      template: baseTemplate,
      parameters: {},
      complexity: "unknown" as string,
      hourlyRate: 75,
    });
    // Should use 1.0 multiplier
    expect(result!.total).toBe(850);
  });

  it("returns consistent low, high, and total values", () => {
    const result = calculateEstimateRange({
      template: baseTemplate,
      parameters: {},
      complexity: "standard",
      hourlyRate: 75,
    });
    expect(result!.low).toBe(result!.total);
    expect(result!.high).toBe(result!.total);
  });
});

describe("formatCurrency", () => {
  it("formats whole numbers", () => {
    expect(formatCurrency(1000)).toBe("1,000");
    expect(formatCurrency(100)).toBe("100");
    expect(formatCurrency(1000000)).toBe("1,000,000");
  });

  it("rounds decimal values", () => {
    expect(formatCurrency(1234.56)).toBe("1,235");
    expect(formatCurrency(1234.44)).toBe("1,234");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("0");
  });

  it("handles small values", () => {
    expect(formatCurrency(0.49)).toBe("0");
    expect(formatCurrency(0.5)).toBe("1");
  });
});
