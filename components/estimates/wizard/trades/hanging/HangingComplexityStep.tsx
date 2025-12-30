"use client";

import { useWizard } from "react-use-wizard";
import { ChevronRight } from "lucide-react";
import { useHangingEstimate } from "./HangingEstimateContext";
import {
  HANGING_COMPLEXITY_MULTIPLIERS,
  CEILING_HEIGHT_FACTORS,
} from "@/lib/trades/drywallHanging/constants";
import {
  HangingComplexity,
  CeilingHeightFactor,
} from "@/lib/trades/drywallHanging/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

const COMPLEXITY_OPTIONS: {
  value: HangingComplexity;
  label: string;
  description: string;
  multiplier: number;
}[] = [
  {
    value: "simple",
    label: "Simple",
    description: "Open rooms, standard height, easy access",
    multiplier: HANGING_COMPLEXITY_MULTIPLIERS.simple,
  },
  {
    value: "standard",
    label: "Standard",
    description: "Typical residential rooms with normal access",
    multiplier: HANGING_COMPLEXITY_MULTIPLIERS.standard,
  },
  {
    value: "complex",
    label: "Complex",
    description: "High ceilings, tight spaces, or difficult access",
    multiplier: HANGING_COMPLEXITY_MULTIPLIERS.complex,
  },
];

export function HangingComplexityStep() {
  const { nextStep } = useWizard();
  const { complexity, setComplexity, ceilingFactor, setCeilingFactor, totals } =
    useHangingEstimate();

  const handleComplexitySelect = (value: HangingComplexity) => {
    setComplexity(value);
  };

  const handleCeilingFactorSelect = (value: CeilingHeightFactor) => {
    setCeilingFactor(value);
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Job Complexity
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Select the job difficulty level
      </p>

      {/* Ceiling Height Factor */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Ceiling Height
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {CEILING_HEIGHT_FACTORS.map((factor) => {
            const isSelected = ceilingFactor === factor.value;

            return (
              <button
                key={factor.value}
                onClick={() =>
                  handleCeilingFactorSelect(factor.value as CeilingHeightFactor)
                }
                className={cn(
                  "py-3 px-4 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div
                  className={cn(
                    "font-medium",
                    isSelected ? "text-blue-900" : "text-gray-900"
                  )}
                >
                  {factor.label}
                </div>
                {factor.multiplier !== 1 && (
                  <div className="text-xs text-gray-500">
                    +{((factor.multiplier - 1) * 100).toFixed(0)}% labor
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overall Complexity */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Overall Complexity
        </h3>
        <div className="space-y-2">
          {COMPLEXITY_OPTIONS.map((option) => {
            const isSelected = complexity === option.value;
            const adjustment =
              option.multiplier !== 1
                ? `${option.multiplier > 1 ? "+" : ""}${(
                    (option.multiplier - 1) *
                    100
                  ).toFixed(0)}%`
                : "Base rate";

            return (
              <button
                key={option.value}
                onClick={() => handleComplexitySelect(option.value)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="text-left">
                  <div
                    className={cn(
                      "font-semibold",
                      isSelected ? "text-blue-900" : "text-gray-900"
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {option.description}
                  </div>
                </div>
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    isSelected
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {adjustment}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cost Impact Preview */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Base Cost</span>
          <span className="font-medium text-gray-900">
            ${formatCurrency(totals.subtotal - totals.complexityAdjustment)}
          </span>
        </div>
        {totals.complexityAdjustment !== 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">
              Complexity Adjustment (
              {((totals.complexityMultiplier - 1) * 100).toFixed(0)}%)
            </span>
            <span
              className={cn(
                "font-medium",
                totals.complexityAdjustment > 0
                  ? "text-orange-600"
                  : "text-green-600"
              )}
            >
              {totals.complexityAdjustment > 0 ? "+" : ""}$
              {formatCurrency(totals.complexityAdjustment)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total</span>
            <span className="text-xl font-bold text-blue-600">
              ${formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        className={cn(
          "w-full flex items-center justify-center gap-2",
          "min-h-15 px-6",
          "bg-blue-600 text-white rounded-xl",
          "hover:bg-blue-700 active:scale-[0.98]",
          "transition-all font-medium text-lg"
        )}
      >
        Continue
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
