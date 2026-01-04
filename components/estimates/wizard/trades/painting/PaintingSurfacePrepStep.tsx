"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { usePaintingEstimateSafe } from "./PaintingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { SURFACE_PREP_OPTIONS } from "@/lib/trades/painting/constants";
import { UsePaintingEstimateReturn, PaintingSurfacePrep } from "@/lib/trades/painting/types";
import { StepHeader } from "@/components/ui/StepHeader";
import { cn } from "@/lib/utils";
import { Brush, Wrench, Hammer } from "lucide-react";

const PREP_ICONS = {
  none: Brush,
  light: Wrench,
  heavy: Hammer,
};

export function PaintingSurfacePrepStep({
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
      "PaintingSurfacePrepStep requires either paintingEstimate prop or PaintingEstimateProvider"
    );
  }

  const { surfacePrep, setSurfacePrep, totalSqft } = estimate;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  const handleSelect = (value: PaintingSurfacePrep) => {
    setSurfacePrep(value);
  };

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Surface Preparation"
        description="Select the level of wall preparation needed"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-3">
          {SURFACE_PREP_OPTIONS.map((option) => {
            const isSelected = surfacePrep === option.value;
            const Icon = PREP_ICONS[option.value as keyof typeof PREP_ICONS] || Brush;
            const additionalCost = option.additionalCostPerSqft * totalSqft;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-blue-100" : "bg-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isSelected ? "text-blue-600" : "text-gray-500"
                        )}
                      />
                    </div>
                    <div>
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
                  </div>
                  {option.additionalCostPerSqft > 0 && (
                    <div className="text-right">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-blue-600" : "text-gray-600"
                        )}
                      >
                        +${option.additionalCostPerSqft}/sqft
                      </div>
                      {totalSqft > 0 && (
                        <div className="text-xs text-gray-500">
                          ~${additionalCost.toFixed(0)} total
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
