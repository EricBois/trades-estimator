"use client";

import { useState, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import {
  Plus,
  Minus,
  Trash2,
  Clock,
  Square,
  Sparkles,
  CornerDownRight,
  X,
} from "lucide-react";
import { useDrywallEstimate } from "./DrywallEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import {
  DRYWALL_LINE_ITEM_TYPES,
  DRYWALL_MATERIAL_LABOR_RATES,
} from "@/lib/trades/drywallFinishing/constants";
import { DrywallLineItemType } from "@/lib/trades/drywallFinishing/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { MaterialToggle } from "@/components/ui/MaterialToggle";
import { InlineOverrideInput } from "@/components/ui/InlineOverrideInput";

// Icon mapping
const ICONS: Record<string, typeof Clock> = {
  Clock,
  Square,
  Sparkles,
  Minus: CornerDownRight, // Using Minus for linear
  CornerDownRight,
  Plus,
};

function getIcon(iconName: string) {
  return ICONS[iconName] ?? Square;
}

export function DrywallLineItemsStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    lineItems,
    addLineItem,
    updateLineItem,
    removeLineItem,
    totals,
    defaultRates,
    hourlyRate,
    setLineItemIncludeMaterial,
    setLineItemMaterialOverride,
    setLineItemLaborOverride,
  } = useDrywallEstimate();

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: lineItems.length === 0,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, lineItems.length]);

  // Get the default rate for a line item type
  const getDefaultRate = (type: DrywallLineItemType): number | null => {
    if (type === "hourly") return hourlyRate;
    if (type === "addon") return null;
    const rateKey = type as keyof typeof defaultRates;
    return defaultRates[rateKey] ?? null;
  };

  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleAddItem = (type: DrywallLineItemType) => {
    addLineItem(type);
    setShowTypeSelector(false);
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = lineItems.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 0) return;
    updateLineItem(id, { quantity: newQty });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Line Items
      </h1>
      <p className="text-gray-500 text-center mb-6">Add the work to be done</p>

      {/* Line Items List */}
      <div className="space-y-3 mb-4">
        {lineItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Square className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No items yet</p>
            <p className="text-gray-400 text-xs">
              Tap the button below to add work
            </p>
          </div>
        ) : (
          lineItems.map((item) => {
            const typeDef = DRYWALL_LINE_ITEM_TYPES.find(
              (t) => t.value === item.type
            );
            const Icon = getIcon(typeDef?.icon ?? "Square");
            const showMaterialToggle =
              item.type !== "hourly" && item.type !== "addon";
            const effectiveMaterialRate =
              item.materialRateOverride ?? item.materialRate;
            const effectiveLaborRate = item.laborRateOverride ?? item.laborRate;

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-white border rounded-xl p-4",
                  item.hasOverride ? "border-orange-200" : "border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {typeDef?.label}
                        {item.hasOverride && (
                          <span className="text-orange-500 text-xs ml-1">
                            (custom)
                          </span>
                        )}
                        {!item.includeMaterial && showMaterialToggle && (
                          <span className="text-gray-400 text-xs ml-1">
                            (labor only)
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Material toggle (not for hourly) */}
                    {showMaterialToggle && (
                      <div className="mb-3">
                        <MaterialToggle
                          included={item.includeMaterial}
                          onChange={(include) =>
                            setLineItemIncludeMaterial(item.id, include)
                          }
                        />
                      </div>
                    )}

                    {/* Description Input */}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, { description: e.target.value })
                      }
                      placeholder="Description (optional)"
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.type === "hourly" ? -0.5 : -10
                          )
                        }
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              updateLineItem(item.id, { quantity: val });
                            }
                          }}
                          className="w-20 text-center text-lg font-semibold text-gray-900 border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step={item.type === "hourly" ? "0.5" : "1"}
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          {typeDef?.unit}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.type === "hourly" ? 0.5 : 10
                          )
                        }
                        className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>

                    {/* Rate breakdown with inline overrides */}
                    <div className="border-t border-gray-100 pt-3">
                      {showMaterialToggle && item.includeMaterial && (
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-gray-500">Material rate:</span>
                          <InlineOverrideInput
                            value={effectiveMaterialRate}
                            defaultValue={item.materialRate}
                            override={item.materialRateOverride}
                            onOverrideChange={(override) =>
                              setLineItemMaterialOverride(item.id, override)
                            }
                            suffix={`/${typeDef?.unit}`}
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Labor rate:</span>
                        <InlineOverrideInput
                          value={effectiveLaborRate}
                          defaultValue={item.laborRate}
                          override={item.laborRateOverride}
                          onOverrideChange={(override) =>
                            setLineItemLaborOverride(item.id, override)
                          }
                          suffix={`/${
                            typeDef?.unit === "hours" ? "hr" : typeDef?.unit
                          }`}
                        />
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="text-right mt-2 pt-2 border-t border-gray-100">
                      {showMaterialToggle && item.includeMaterial && (
                        <div className="text-xs text-gray-500">
                          Material: ${formatCurrency(item.materialTotal)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Labor: ${formatCurrency(item.laborTotal)}
                      </div>
                      <div
                        className={cn(
                          "text-lg font-semibold mt-1",
                          item.hasOverride ? "text-orange-600" : "text-gray-900"
                        )}
                      >
                        ${formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Line Item Button */}
      <button
        onClick={() => setShowTypeSelector(true)}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4",
          "border-2 border-dashed border-gray-300 rounded-xl",
          "text-gray-600 hover:border-blue-400 hover:text-blue-600",
          "transition-colors"
        )}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Line Item</span>
      </button>

      {/* Type Selector Modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 pb-safe max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Type
              </h2>
              <button
                onClick={() => setShowTypeSelector(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {DRYWALL_LINE_ITEM_TYPES.filter((t) => t.value !== "addon").map(
                (type) => {
                  const Icon = getIcon(type.icon);
                  const matLabRates =
                    DRYWALL_MATERIAL_LABOR_RATES[
                      type.value as keyof typeof DRYWALL_MATERIAL_LABOR_RATES
                    ];
                  const isHourly = type.value === "hourly";

                  return (
                    <button
                      key={type.value}
                      onClick={() =>
                        handleAddItem(type.value as DrywallLineItemType)
                      }
                      className={cn(
                        "w-full flex items-center gap-4 p-4",
                        "bg-gray-50 hover:bg-blue-50 rounded-xl",
                        "transition-colors text-left"
                      )}
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {type.label}
                        </div>
                        {isHourly ? (
                          <div className="text-sm text-gray-500">
                            ${hourlyRate.toFixed(2)}/hr (labor only)
                          </div>
                        ) : matLabRates ? (
                          <>
                            <div className="text-sm text-gray-500">
                              $
                              {(
                                matLabRates.material.mid + matLabRates.labor.mid
                              ).toFixed(2)}
                              /{type.unit}
                            </div>
                            <div className="text-xs text-gray-400">
                              Material: ${matLabRates.material.mid.toFixed(2)} +
                              Labor: ${matLabRates.labor.mid.toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Per {type.unit}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* Running Total Summary */}
      {lineItems.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
          <div className="flex justify-between text-sm text-blue-600 mb-1">
            <span>Materials</span>
            <span>${formatCurrency(totals.materialSubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-blue-600 mb-2">
            <span>Labor</span>
            <span>${formatCurrency(totals.laborSubtotal)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-200">
            <span className="text-sm text-blue-600">Subtotal</span>
            <span className="text-xl font-bold text-blue-900">
              ${formatCurrency(totals.lineItemsSubtotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
