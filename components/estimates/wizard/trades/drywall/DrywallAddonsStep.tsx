"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { Check, Plus, Minus } from "lucide-react";
import { useDrywallEstimateSafe } from "./DrywallEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { DRYWALL_ADDONS } from "@/lib/trades/drywallFinishing/constants";
import {
  DrywallAddonId,
  UseDrywallFinishingEstimateReturn,
} from "@/lib/trades/drywallFinishing/types";
import { DrywallAddonPrices } from "@/hooks/useProfile";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { CustomAddonInput } from "@/components/ui/CustomAddonInput";
import { CustomAddonCard } from "@/components/ui/CustomAddonCard";

export function DrywallAddonsStep({
  finishingEstimate,
}: {
  finishingEstimate?: UseDrywallFinishingEstimateReturn;
} = {}) {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();

  // Use prop if provided, otherwise fall back to context (backwards compatible)
  const contextEstimate = useDrywallEstimateSafe();
  const estimate = finishingEstimate ?? contextEstimate;

  if (!estimate) {
    throw new Error(
      "DrywallAddonsStep requires either finishingEstimate prop or DrywallEstimateProvider"
    );
  }

  const {
    addons,
    customAddons,
    toggleAddon,
    updateAddonQuantity,
    addCustomAddon,
    updateCustomAddon,
    removeCustomAddon,
    totals,
    lineItems,
    defaultAddonPrices,
  } = estimate;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: addons.length === 0 ? "Skip" : "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, addons.length]);

  // Helper to get the user's price for an add-on
  const getAddonPrice = (addonId: string): number => {
    const price = defaultAddonPrices[addonId as keyof DrywallAddonPrices];
    if (price !== undefined) return price;
    // Fallback to default from constants
    const addon = DRYWALL_ADDONS.find((a) => a.id === addonId);
    return addon?.price ?? 0;
  };

  // Get total sqft from line items for sqft-based addons
  const totalSqft = lineItems
    .filter((item) => item.type.includes("sqft"))
    .reduce((sum, item) => sum + item.quantity, 0);

  const isAddonSelected = (addonId: DrywallAddonId) => {
    return addons.some((a) => a.id === addonId);
  };

  const getAddonQuantity = (addonId: DrywallAddonId): number => {
    const addon = addons.find((a) => a.id === addonId);
    return addon?.quantity ?? 0;
  };

  const handleToggle = (addonId: DrywallAddonId) => {
    const addonDef = DRYWALL_ADDONS.find((a) => a.id === addonId);
    if (!addonDef) return;

    // For sqft-based addons, use total sqft as default quantity
    const defaultQty = addonDef.unit === "sqft" ? totalSqft : 1;
    toggleAddon(addonId, defaultQty);
  };

  const handleQuantityChange = (addonId: DrywallAddonId, delta: number) => {
    const currentQty = getAddonQuantity(addonId);
    const newQty = currentQty + delta;
    if (newQty <= 0) return;
    updateAddonQuantity(addonId, newQty);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Add-ons
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Select any extras (optional)
      </p>

      <div className="space-y-3">
        {DRYWALL_ADDONS.map((addon) => {
          const isSelected = isAddonSelected(addon.id as DrywallAddonId);
          const quantity = getAddonQuantity(addon.id as DrywallAddonId);
          const showQuantity =
            isSelected && (addon.unit === "sqft" || addon.unit === "each");

          return (
            <div
              key={addon.id}
              className={cn(
                "bg-white border-2 rounded-xl p-4",
                "transition-all",
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
              )}
            >
              <button
                onClick={() => handleToggle(addon.id as DrywallAddonId)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center",
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    )}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {addon.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${getAddonPrice(addon.id).toFixed(2)}
                      {addon.unit !== "flat" && `/${addon.unit}`}
                    </div>
                  </div>
                </div>
              </button>

              {/* Quantity adjuster for sqft/each addons */}
              {showQuantity && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          addon.id as DrywallAddonId,
                          addon.unit === "sqft" ? -10 : -1
                        )
                      }
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            updateAddonQuantity(
                              addon.id as DrywallAddonId,
                              val
                            );
                          }
                        }}
                        className="w-20 sm:w-24 text-center text-lg font-semibold text-gray-900 border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        step={addon.unit === "sqft" ? "10" : "1"}
                      />
                      <span className="text-xs sm:text-sm text-gray-500 ml-2">
                        {addon.unit}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          addon.id as DrywallAddonId,
                          addon.unit === "sqft" ? 10 : 1
                        )
                      }
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${formatCurrency(getAddonPrice(addon.id) * quantity)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Add-ons */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Custom Add-ons
        </h3>
        <div className="space-y-3">
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

      {/* Add-ons Summary */}
      {(addons.length > 0 || customAddons.length > 0) && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center">
          <span className="text-sm text-blue-600">Add-ons: </span>
          <span className="text-lg font-bold text-blue-900">
            +${formatCurrency(totals.addonsSubtotal)}
          </span>
        </div>
      )}
    </div>
  );
}
