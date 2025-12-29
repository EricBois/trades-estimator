"use client";

import { useState } from "react";
import { useWizard } from "react-use-wizard";
import {
  Plus,
  Minus,
  Trash2,
  Clock,
  Square,
  Sparkles,
  CornerDownRight,
  ChevronRight,
  X,
} from "lucide-react";
import { useDrywallEstimate } from "./DrywallEstimateContext";
import {
  DRYWALL_LINE_ITEM_TYPES,
  DRYWALL_RATES,
} from "@/lib/trades/drywallFinishing/constants";
import { DrywallLineItemType } from "@/lib/trades/drywallFinishing/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

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
  const {
    lineItems,
    addLineItem,
    updateLineItem,
    removeLineItem,
    totals,
    defaultRates,
    hourlyRate,
  } = useDrywallEstimate();

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

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Line Items
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Add the work to be done
      </p>

      {/* Line Items List */}
      <div className="space-y-3 mb-4">
        {lineItems.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Square className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No items yet</p>
            <p className="text-gray-400 text-xs">Tap the button below to add work</p>
          </div>
        ) : (
          lineItems.map((item) => {
            const typeDef = DRYWALL_LINE_ITEM_TYPES.find((t) => t.value === item.type);
            const Icon = getIcon(typeDef?.icon ?? "Square");

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
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
                      </span>
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description Input */}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Quantity & Rate */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.type === "hourly" ? -0.5 : -10)}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                        >
                          <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
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
                            className="w-20 sm:w-24 text-center text-lg sm:text-xl font-semibold text-gray-900 border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step={item.type === "hourly" ? "0.5" : "1"}
                          />
                          <span className="text-xs sm:text-sm text-gray-500 ml-2">
                            {typeDef?.unit}
                          </span>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.type === "hourly" ? 0.5 : 10)}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </button>
                      </div>

                      {/* Rate */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-sm text-gray-500">@</span>
                          <span className="text-sm text-gray-500">$</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val >= 0) {
                                updateLineItem(item.id, { rate: val });
                              }
                            }}
                            className="w-16 text-right text-sm font-medium text-gray-900 border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-sm text-gray-500">/{typeDef?.unit === "hours" ? "hr" : typeDef?.unit}</span>
                        </div>
                        {/* Show default rate hint if different */}
                        {(() => {
                          const defaultRate = getDefaultRate(item.type);
                          if (defaultRate !== null && item.rate !== defaultRate) {
                            return (
                              <div className="text-xs text-gray-400 mt-0.5">
                                Your default: ${defaultRate.toFixed(2)}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          ${formatCurrency(item.total)}
                        </div>
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
              <h2 className="text-lg font-semibold text-gray-900">Select Type</h2>
              <button
                onClick={() => setShowTypeSelector(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {DRYWALL_LINE_ITEM_TYPES.filter((t) => t.value !== "addon").map((type) => {
                const Icon = getIcon(type.icon);
                const userRate = getDefaultRate(type.value as DrywallLineItemType);
                const industryRates = DRYWALL_RATES[type.value as keyof typeof DRYWALL_RATES];

                return (
                  <button
                    key={type.value}
                    onClick={() => handleAddItem(type.value as DrywallLineItemType)}
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
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">
                        {userRate !== null
                          ? `$${userRate.toFixed(2)}/${type.unit}`
                          : `Per ${type.unit}`}
                      </div>
                      {industryRates && (
                        <div className="text-xs text-gray-400">
                          Industry: ${industryRates.low.toFixed(2)} - ${industryRates.high.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Running Total & Continue */}
      <div className="mt-6 space-y-3">
        {lineItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 text-center">
            <span className="text-sm text-blue-600">Subtotal: </span>
            <span className="text-xl font-bold text-blue-900">
              ${formatCurrency(totals.lineItemsSubtotal)}
            </span>
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={lineItems.length === 0}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "min-h-[60px] px-6",
            "bg-blue-600 text-white rounded-xl",
            "hover:bg-blue-700 active:scale-[0.98]",
            "transition-all font-medium text-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
