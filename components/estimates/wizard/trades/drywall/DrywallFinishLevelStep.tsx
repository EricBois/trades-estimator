"use client";

import { useWizard } from "react-use-wizard";
import { Layers } from "lucide-react";
import { useDrywallEstimate } from "./DrywallEstimateContext";
import { DRYWALL_FINISH_LEVELS } from "@/lib/trades/drywallFinishing/constants";
import { DrywallFinishLevel } from "@/lib/trades/drywallFinishing/types";
import { cn } from "@/lib/utils";

export function DrywallFinishLevelStep() {
  const { nextStep } = useWizard();
  const { finishLevel, setFinishLevel } = useDrywallEstimate();

  const handleSelect = (level: DrywallFinishLevel) => {
    setFinishLevel(level);
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Finish Level
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Select the drywall finish quality
      </p>

      <div className="space-y-3">
        {DRYWALL_FINISH_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => handleSelect(level.value as DrywallFinishLevel)}
            className={cn(
              "w-full flex items-start gap-4 p-5 sm:p-6",
              "bg-white border-2 rounded-xl",
              "hover:border-blue-500 hover:bg-blue-50",
              "active:scale-[0.99] transition-all cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "text-left",
              finishLevel === level.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                finishLevel === level.value ? "bg-blue-100" : "bg-gray-100"
              )}
            >
              <Layers
                className={cn(
                  "w-6 h-6",
                  finishLevel === level.value ? "text-blue-600" : "text-gray-500"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900">
                {level.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {level.description}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ~${level.sqftRate.toFixed(2)}/sqft base rate
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
