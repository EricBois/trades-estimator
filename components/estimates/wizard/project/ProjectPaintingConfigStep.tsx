"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import {
  PAINT_COAT_OPTIONS,
  PAINT_QUALITY_OPTIONS,
  SURFACE_PREP_OPTIONS,
  PAINTING_ADDONS,
} from "@/lib/trades/painting/constants";
import { StepHeader } from "@/components/ui/StepHeader";
import { InlineOverrideInput } from "@/components/ui/InlineOverrideInput";
import { CustomAddonInput } from "@/components/ui/CustomAddonInput";
import { CustomAddonCard } from "@/components/ui/CustomAddonCard";

export function ProjectPaintingConfigStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { paintingEstimate, getTradeRoomViews, roomsHook } = useProjectEstimateContext();

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
    coatCount,
    paintQuality,
    surfacePrep,
    complexity,
    addons,
    customAddons,
    setCoatCount,
    setPaintQuality,
    setSurfacePrep,
    setComplexity,
    toggleAddon,
    setAddonPriceOverride,
    addCustomAddon,
    updateCustomAddon,
    removeCustomAddon,
  } = paintingEstimate;

  // Get room views for painting trade
  const tradeRooms = getTradeRoomViews("painting");
  const totalSqft =
    roomsHook.inputMode === "manual" || roomsHook.rooms.length === 0
      ? roomsHook.totalSqft
      : tradeRooms.reduce((sum, r) => sum + r.effectiveTotalSqft, 0);

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Painting Options"
        description={`Configure painting options for ${totalSqft.toFixed(
          0
        )} sqft`}
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Coat Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Coats
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAINT_COAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCoatCount(option.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    coatCount === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.multiplier === 1
                      ? "Standard"
                      : option.multiplier < 1
                      ? `${((1 - option.multiplier) * 100).toFixed(0)}% less`
                      : `+${((option.multiplier - 1) * 100).toFixed(0)}%`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Paint Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paint Quality
            </label>
            <div className="space-y-2">
              {PAINT_QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPaintQuality(option.value)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    paintQuality === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Surface Prep */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Surface Preparation
            </label>
            <div className="space-y-2">
              {SURFACE_PREP_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSurfacePrep(option.value)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    surfacePrep === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        {option.description}
                      </div>
                    </div>
                    {option.additionalCostPerSqft > 0 && (
                      <span className="text-sm text-blue-600">
                        +${option.additionalCostPerSqft}/sqft
                      </span>
                    )}
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
                    {level === "complex" && "+30%"}
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
              {PAINTING_ADDONS.slice(0, 6).map((addon) => {
                const selectedAddon = addons.find((a) => a.id === addon.id);
                const isSelected = !!selectedAddon;
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
                    {isSelected ? (
                      <InlineOverrideInput
                        value={selectedAddon.priceOverride ?? addon.price}
                        defaultValue={addon.price}
                        override={selectedAddon.priceOverride}
                        onOverrideChange={(override) =>
                          setAddonPriceOverride(addon.id, override)
                        }
                        suffix={`/${addon.unit}`}
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        ${addon.price}/{addon.unit}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Custom Add-ons */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Add-ons
              </label>
              <div className="space-y-2">
                {customAddons.map((addon) => (
                  <CustomAddonCard
                    key={addon.id}
                    addon={addon}
                    onUpdate={(updates) => updateCustomAddon(addon.id, updates)}
                    onRemove={() => removeCustomAddon(addon.id)}
                  />
                ))}
                <CustomAddonInput onAdd={addCustomAddon} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
