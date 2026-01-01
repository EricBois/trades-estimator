"use client";

import { useWizard } from "react-use-wizard";
import { Calculator, Edit2, ChevronRight, Layers } from "lucide-react";
import { useDrywallEstimate } from "./DrywallEstimateContext";
import {
  DRYWALL_FINISH_LEVELS,
  DRYWALL_LINE_ITEM_TYPES,
  DRYWALL_ADDONS,
  DRYWALL_COMPLEXITY_MULTIPLIERS,
  getFinishingMaterial,
} from "@/lib/trades/drywallFinishing/constants";
import { WIZARD_COMPLEXITY_LEVELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

export function DrywallPreview() {
  const { nextStep, goToStep } = useWizard();
  const { finishLevel, lineItems, addons, materials, complexity, totals } =
    useDrywallEstimate();

  // Get display values
  const finishLevelLabel =
    DRYWALL_FINISH_LEVELS.find((l) => l.value === finishLevel)?.label ??
    `Level ${finishLevel}`;

  const complexityLabel =
    WIZARD_COMPLEXITY_LEVELS.find((c) => c.value === complexity)?.label ??
    complexity;

  const complexityPercent = Math.round(
    (DRYWALL_COMPLEXITY_MULTIPLIERS[complexity] - 1) * 100
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Estimate Summary
      </h1>

      {/* Big Price Display */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-bold text-blue-900">
            ${formatCurrency(totals.total)}
          </div>
          <p className="text-blue-600 mt-2">Estimate Total</p>
        </div>
      </div>

      {/* Finish Level */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Finish Level</p>
              <p className="font-medium text-gray-900">{finishLevelLabel}</p>
            </div>
          </div>
          <button
            onClick={() => goToStep(0)} // Finish level is step 0
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <p className="font-medium text-gray-900">Line Items</p>
          <button
            onClick={() => goToStep(1)} // Line items is step 1
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {lineItems.map((item) => {
            const typeDef = DRYWALL_LINE_ITEM_TYPES.find(
              (t) => t.value === item.type
            );
            return (
              <div
                key={item.id}
                className="px-4 py-3 flex justify-between items-start"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-gray-900">
                    {typeDef?.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {item.quantity} {typeDef?.unit} @ ${item.rate.toFixed(2)}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  ${formatCurrency(item.total)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-between">
          <p className="text-sm text-gray-500">Subtotal</p>
          <p className="font-medium text-gray-900">
            ${formatCurrency(totals.lineItemsSubtotal)}
          </p>
        </div>
      </div>

      {/* Add-ons */}
      {addons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <p className="font-medium text-gray-900">Add-ons</p>
            <button
              onClick={() => goToStep(2)} // Addons is step 2
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {addons.map((addon) => {
              const addonDef = DRYWALL_ADDONS.find((a) => a.id === addon.id);
              return (
                <div
                  key={addon.id}
                  className="px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {addonDef?.label}
                    </p>
                    {(addonDef?.unit === "sqft" ||
                      addonDef?.unit === "each") && (
                      <p className="text-xs text-gray-400">
                        {addon.quantity} {addonDef.unit}
                      </p>
                    )}
                  </div>
                  <p className="font-medium text-gray-900">
                    +${formatCurrency(addon.total)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between">
            <p className="text-sm text-gray-500">Add-ons Total</p>
            <p className="font-medium text-gray-900">
              +${formatCurrency(totals.addonsSubtotal)}
            </p>
          </div>
        </div>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <p className="font-medium text-gray-900">Materials</p>
            <button
              onClick={() => goToStep(3)} // Materials is step 3
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {materials.map((entry) => {
              const materialDef = getFinishingMaterial(entry.materialId);
              return (
                <div
                  key={entry.id}
                  className="px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {materialDef?.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {entry.quantity}{" "}
                      {"unitSize" in (materialDef ?? {})
                        ? `${(materialDef as { unitSize?: string }).unitSize} `
                        : ""}
                      {materialDef?.unit}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">
                    +${formatCurrency(entry.subtotal)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between">
            <p className="text-sm text-gray-500">Materials Total</p>
            <p className="font-medium text-gray-900">
              +${formatCurrency(totals.materialsSubtotal)}
            </p>
          </div>
        </div>
      )}

      {/* Complexity */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-500">Complexity</p>
            <p className="font-medium text-gray-900">{complexityLabel}</p>
            {complexityPercent !== 0 && (
              <p className="text-xs text-gray-400">
                {complexityPercent > 0 ? "+" : ""}
                {complexityPercent}% adjustment
              </p>
            )}
          </div>
          <button
            onClick={() => goToStep(4)} // Complexity is step 4
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Total Breakdown */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Line Items</span>
            <span className="text-gray-900">
              ${formatCurrency(totals.lineItemsSubtotal)}
            </span>
          </div>
          {totals.addonsSubtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Add-ons</span>
              <span className="text-gray-900">
                +${formatCurrency(totals.addonsSubtotal)}
              </span>
            </div>
          )}
          {totals.materialsSubtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Materials</span>
              <span className="text-gray-900">
                +${formatCurrency(totals.materialsSubtotal)}
              </span>
            </div>
          )}
          {totals.complexityAdjustment !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Complexity Adj.</span>
              <span className="text-gray-900">
                {totals.complexityAdjustment >= 0 ? "+" : ""}$
                {formatCurrency(totals.complexityAdjustment)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-blue-600">
              ${formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={nextStep}
        className={cn(
          "w-full flex items-center justify-center gap-2",
          "min-h-[60px] px-6",
          "bg-blue-600 text-white rounded-xl",
          "hover:bg-blue-700 active:scale-[0.98]",
          "transition-all font-medium text-lg cursor-pointer"
        )}
      >
        Send to Homeowner
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
