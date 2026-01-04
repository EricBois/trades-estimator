"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { usePaintingEstimateSafe } from "./PaintingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { PAINTING_COMPLEXITY_MULTIPLIERS } from "@/lib/trades/painting/constants";
import { UsePaintingEstimateReturn, PaintingComplexity } from "@/lib/trades/painting/types";
import { StepHeader } from "@/components/ui/StepHeader";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

const COMPLEXITY_OPTIONS: {
  value: PaintingComplexity;
  label: string;
  description: string;
  multiplier: number;
}[] = [
  {
    value: "simple",
    label: "Simple",
    description: "Open rooms, minimal trim, easy access",
    multiplier: PAINTING_COMPLEXITY_MULTIPLIERS.simple,
  },
  {
    value: "standard",
    label: "Standard",
    description: "Typical residential rooms with normal trim",
    multiplier: PAINTING_COMPLEXITY_MULTIPLIERS.standard,
  },
  {
    value: "complex",
    label: "Complex",
    description: "Lots of trim, tight spaces, high detail work",
    multiplier: PAINTING_COMPLEXITY_MULTIPLIERS.complex,
  },
];

export function PaintingComplexityStep({
  paintingEstimate,
}: {
  paintingEstimate?: UsePaintingEstimateReturn;
} = {}) {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();

  // Use prop if provided, otherwise fall back to context (backwards compatible)
  const contextEstimate = usePaintingEstimateSafe();
  const estimate = paintingEstimate ?? contextEstimate;

  if (!estimate) {
    throw new Error(
      "PaintingComplexityStep requires either paintingEstimate prop or PaintingEstimateProvider"
    );
  }

  const { complexity, setComplexity, totals } = estimate;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  const handleSelect = (value: PaintingComplexity) => {
    setComplexity(value);
  };

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Job Complexity"
        description="Select the difficulty level for this job"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Complexity options */}
          <div className="space-y-3">
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
                  onClick={() => handleSelect(option.value)}
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

          {/* Cost Impact Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Base Cost</span>
              <span className="font-medium text-gray-900">
                ${formatCurrency(totals.subtotal - totals.complexityAdjustment)}
              </span>
            </div>
            {totals.complexityAdjustment !== 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">
                  Complexity ({((totals.complexityMultiplier - 1) * 100).toFixed(0)}%)
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
        </div>
      </div>
    </div>
  );
}
