"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { usePaintingEstimateSafe } from "./PaintingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { PAINT_COAT_OPTIONS } from "@/lib/trades/painting/constants";
import { UsePaintingEstimateReturn, PaintingCoatCount } from "@/lib/trades/painting/types";
import { StepHeader } from "@/components/ui/StepHeader";
import { cn } from "@/lib/utils";
import { Paintbrush } from "lucide-react";

export function PaintingCoatStep({
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
      "PaintingCoatStep requires either paintingEstimate prop or PaintingEstimateProvider"
    );
  }

  const { coatCount, setCoatCount, totalSqft } = estimate;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  const handleSelect = (value: PaintingCoatCount) => {
    setCoatCount(value);
  };

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Number of Coats"
        description={`Select coverage for ${totalSqft.toFixed(0)} sqft`}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-3">
          {PAINT_COAT_OPTIONS.map((option) => {
            const isSelected = coatCount === option.value;

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
                      <Paintbrush
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
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      isSelected
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {option.multiplier === 1
                      ? "Standard"
                      : option.multiplier < 1
                      ? `${((1 - option.multiplier) * 100).toFixed(0)}% less`
                      : `+${((option.multiplier - 1) * 100).toFixed(0)}%`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
