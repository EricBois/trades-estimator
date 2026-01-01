"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import {
  DRYWALL_SHEET_TYPES,
  CEILING_HEIGHT_FACTORS,
  HANGING_ADDONS,
} from "@/lib/trades/drywallHanging/constants";
import { StepHeader } from "@/components/ui/StepHeader";

export function ProjectHangingConfigStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { hangingEstimate, roomsHook } = useProjectEstimateContext();

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
    sheets,
    ceilingFactor,
    wasteFactor,
    complexity,
    addons,
    setCeilingFactor,
    setWasteFactor,
    setComplexity,
    toggleAddon,
    addSheet,
    updateSheet,
  } = hangingEstimate;

  // Get total sqft from rooms hook (respects input mode)
  const totalSqft = roomsHook.totalSqft;

  // Initialize a sheet if none exists
  useEffect(() => {
    if (sheets.length === 0) {
      addSheet("standard_half");
    }
  }, [sheets.length, addSheet]);

  // Handle sheet type selection
  const handleSheetTypeSelect = (typeId: string) => {
    if (sheets.length > 0) {
      updateSheet(sheets[0].id, {
        typeId: typeId as (typeof sheets)[0]["typeId"],
      });
    } else {
      addSheet(typeId as (typeof sheets)[0]["typeId"]);
    }
  };

  // Auto-calculate sheets when we enter this step
  // Note: The hanging estimate uses its own rooms, so we need to sync
  // For now, show the shared rooms' sqft

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Drywall Hanging Options"
        description={`Configure hanging options for ${totalSqft.toFixed(
          0
        )} sqft`}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Sheet Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drywall Sheet Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DRYWALL_SHEET_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSheetTypeSelect(type.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all",
                    sheets[0]?.typeId === type.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-500">
                    ${type.materialCost}/sheet
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ceiling Height Factor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ceiling Height
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CEILING_HEIGHT_FACTORS.map((factor) => (
                <button
                  key={factor.value}
                  onClick={() => setCeilingFactor(factor.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    ceilingFactor === factor.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {factor.label}
                  </div>
                  {factor.multiplier !== 1 && (
                    <div className="text-xs text-gray-500">
                      +{((factor.multiplier - 1) * 100).toFixed(0)}% labor
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Waste Factor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waste Factor: {(wasteFactor * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={5}
              max={25}
              value={wasteFactor * 100}
              onChange={(e) => setWasteFactor(parseInt(e.target.value) / 100)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5%</span>
              <span>25%</span>
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
              {HANGING_ADDONS.map((addon) => {
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
