"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { Plus, Minus } from "lucide-react";
import { usePaintingEstimateSafe } from "./PaintingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { PAINTING_ADDONS } from "@/lib/trades/painting/constants";
import {
  UsePaintingEstimateReturn,
  PaintingAddonId,
} from "@/lib/trades/painting/types";
import { StepHeader } from "@/components/ui/StepHeader";
import { InlineOverrideInput } from "@/components/ui/InlineOverrideInput";
import { CustomAddonInput } from "@/components/ui/CustomAddonInput";
import { CustomAddonCard } from "@/components/ui/CustomAddonCard";
import { cn } from "@/lib/utils";

export function PaintingAddonsStep({
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
      "PaintingAddonsStep requires either paintingEstimate prop or PaintingEstimateProvider"
    );
  }

  const {
    addons,
    customAddons,
    toggleAddon,
    setAddonPriceOverride,
    addCustomAddon,
    updateCustomAddon,
    removeCustomAddon,
  } = estimate;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Add-ons"
        description="Select any additional services"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Standard add-ons */}
          <div className="space-y-2">
            {PAINTING_ADDONS.map((addon) => {
              const selectedAddon = addons.find((a) => a.id === addon.id);
              const isSelected = !!selectedAddon;

              return (
                <label
                  key={addon.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAddon(addon.id as PaintingAddonId)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={cn(
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}
                    >
                      {addon.label}
                    </span>
                  </div>
                  {isSelected ? (
                    <InlineOverrideInput
                      value={selectedAddon.priceOverride ?? addon.price}
                      defaultValue={addon.price}
                      override={selectedAddon.priceOverride}
                      onOverrideChange={(override) =>
                        setAddonPriceOverride(
                          addon.id as PaintingAddonId,
                          override
                        )
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
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
  );
}
