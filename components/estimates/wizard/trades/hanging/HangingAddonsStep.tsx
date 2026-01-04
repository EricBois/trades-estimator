"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { Check, Plus, Minus } from "lucide-react";
import { useHangingEstimateSafe } from "./HangingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { HANGING_ADDONS } from "@/lib/trades/drywallHanging/constants";
import {
  HangingAddonId,
  UseDrywallHangingEstimateReturn,
} from "@/lib/trades/drywallHanging/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

export function HangingAddonsStep({
  hangingEstimate,
}: {
  hangingEstimate?: UseDrywallHangingEstimateReturn;
} = {}) {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();

  // Use prop if provided, otherwise fall back to context (backwards compatible)
  const contextEstimate = useHangingEstimateSafe();
  const estimate = hangingEstimate ?? contextEstimate;

  if (!estimate) {
    throw new Error(
      "HangingAddonsStep requires either hangingEstimate prop or HangingEstimateProvider"
    );
  }

  const {
    addons,
    toggleAddon,
    updateAddonQuantity,
    totals,
    defaultAddonPrices,
  } = estimate;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, addons.length]);

  // Helper to get the user's price for an add-on
  const getAddonPrice = (addonId: string): number => {
    const price =
      defaultAddonPrices[addonId as keyof typeof defaultAddonPrices];
    if (price !== undefined) return price;
    // Fallback to default from constants
    const addon = HANGING_ADDONS.find((a) => a.id === addonId);
    return addon?.price ?? 0;
  };

  const isAddonSelected = (addonId: HangingAddonId) => {
    return addons.some((a) => a.id === addonId);
  };

  const getAddonQuantity = (addonId: HangingAddonId): number => {
    const addon = addons.find((a) => a.id === addonId);
    return addon?.quantity ?? 0;
  };

  const handleToggle = (addonId: HangingAddonId) => {
    const addonDef = HANGING_ADDONS.find((a) => a.id === addonId);
    if (!addonDef) return;

    // For sqft/linear_ft addons, use total sqft as default quantity
    const defaultQty =
      addonDef.unit === "sqft" || addonDef.unit === "linear_ft"
        ? Math.round(totals.totalSqft)
        : 1;
    toggleAddon(addonId, defaultQty);
  };

  const handleQuantityChange = (addonId: HangingAddonId, delta: number) => {
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
        {HANGING_ADDONS.map((addon) => {
          const isSelected = isAddonSelected(addon.id as HangingAddonId);
          const quantity = getAddonQuantity(addon.id as HangingAddonId);
          const showQuantity = isSelected && addon.unit !== "flat";

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
                onClick={() => handleToggle(addon.id as HangingAddonId)}
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
                      {addon.unit !== "flat" &&
                        `/${addon.unit.replace("_", " ")}`}
                    </div>
                  </div>
                </div>
              </button>

              {/* Quantity adjuster for non-flat addons */}
              {showQuantity && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          addon.id as HangingAddonId,
                          addon.unit === "sqft" ? -10 : -1
                        )
                      }
                      className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
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
                              addon.id as HangingAddonId,
                              val
                            );
                          }
                        }}
                        className="w-20 text-center text-lg font-semibold text-gray-900 border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        step={addon.unit === "sqft" ? "10" : "1"}
                      />
                      <span className="text-xs text-gray-500 ml-2">
                        {addon.unit.replace("_", " ")}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          addon.id as HangingAddonId,
                          addon.unit === "sqft" ? 10 : 1
                        )
                      }
                      className="w-11 h-11 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
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

      {/* Add-ons Summary */}
      {addons.length > 0 && (
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
