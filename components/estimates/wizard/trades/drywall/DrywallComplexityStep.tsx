"use client";

import { useWizard } from "react-use-wizard";
import { Check } from "lucide-react";
import { useDrywallEstimate } from "./DrywallEstimateContext";
import { WIZARD_COMPLEXITY_LEVELS, COMPLEXITY_DESCRIPTIONS } from "@/lib/constants";
import { DrywallComplexity } from "@/lib/trades/drywallFinishing/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

export function DrywallComplexityStep() {
  const { nextStep } = useWizard();
  const { complexity, setComplexity, totals } = useDrywallEstimate();

  const handleSelect = (complexityValue: DrywallComplexity) => {
    setComplexity(complexityValue);
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        How complex?
      </h1>
      <p className="text-gray-500 text-center mb-8">
        This affects the final estimate
      </p>

      <div className="space-y-3">
        {WIZARD_COMPLEXITY_LEVELS.map((level) => {
          const isSelected = complexity === level.value;
          const description = COMPLEXITY_DESCRIPTIONS[level.value];

          return (
            <button
              key={level.value}
              onClick={() => handleSelect(level.value as DrywallComplexity)}
              className={cn(
                "w-full flex items-start gap-4 p-5 sm:p-6",
                "rounded-xl border-2 transition-all cursor-pointer",
                "active:scale-[0.99]",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "text-left",
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                )}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "text-lg font-medium",
                      isSelected ? "text-blue-900" : "text-gray-900"
                    )}
                  >
                    {level.label}
                  </h3>
                  {level.value === "standard" && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                {description && (
                  <p
                    className={cn(
                      "text-sm mt-1",
                      isSelected ? "text-blue-600" : "text-gray-500"
                    )}
                  >
                    {description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current estimate preview */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
        <span className="text-sm text-blue-600">Current estimate: </span>
        <span className="text-lg font-bold text-blue-900">
          ${formatCurrency(totals.total)}
        </span>
      </div>
    </div>
  );
}
