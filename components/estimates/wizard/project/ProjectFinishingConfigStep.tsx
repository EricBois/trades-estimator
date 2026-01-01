"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import {
  DRYWALL_FINISH_LEVELS,
  DRYWALL_ADDONS,
} from "@/lib/trades/drywallFinishing/constants";
import { StepHeader } from "@/components/ui/StepHeader";

export function ProjectFinishingConfigStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { finishingEstimate, getTradeRoomViews } = useProjectEstimateContext();

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  const {
    finishLevel,
    complexity,
    addons,
    setFinishLevel,
    setComplexity,
    toggleAddon,
  } = finishingEstimate;

  // Get room views for finishing trade
  const tradeRooms = getTradeRoomViews("drywall_finishing");
  const totalSqft = tradeRooms.reduce(
    (sum, r) => sum + r.effectiveTotalSqft,
    0
  );

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Drywall Finishing Options"
        description={`Configure finishing options for ${totalSqft.toFixed(
          0
        )} sqft`}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Finish Level Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Finish Level
            </label>
            <div className="space-y-2">
              {DRYWALL_FINISH_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setFinishLevel(level.value)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    finishLevel === level.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-medium text-gray-900">{level.label}</div>
                  <div className="text-sm text-gray-500">
                    {level.description}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    ${level.sqftRate}/sqft
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complexity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["simple", "standard", "complex"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setComplexity(level)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    complexity === level
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-medium text-gray-900 capitalize">
                    {level}
                  </div>
                  <div className="text-xs text-gray-500">
                    {level === "simple" && "-15%"}
                    {level === "standard" && "Base rate"}
                    {level === "complex" && "+25%"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add-ons
            </label>
            <div className="space-y-2">
              {DRYWALL_ADDONS.map((addon) => {
                const isSelected = addons.some((a) => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAddon(addon.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900">{addon.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ${addon.price}/{addon.unit}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
