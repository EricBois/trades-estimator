"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { useHangingEstimate } from "./HangingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import {
  DRYWALL_SHEET_TYPES,
  DRYWALL_SHEET_SIZES,
  HANGING_ADDONS,
  CEILING_HEIGHT_FACTORS,
} from "@/lib/trades/drywallHanging/constants";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { StepHeader } from "@/components/ui/StepHeader";
import { EditButton } from "@/components/ui/EditButton";

export function HangingPreview() {
  const { nextStep, goToStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    inputMode,
    rooms,
    sheets,
    addons,
    complexity,
    ceilingFactor,
    wasteFactor,
    totals,
    directSqft,
    directHours,
    hourlyRate,
    defaultRates,
    clientSuppliesMaterials,
  } = useHangingEstimate();

  // Configure footer with "Send to Homeowner" button
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Send to Homeowner",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  // Calculate step indices for edit navigation based on mode
  // Calculator: 0=Mode, 1=Rooms, 2=SheetType, 3=Addons, 4=Complexity, 5=Preview
  // Direct:     0=Mode, 1=DirectEntry, 2=Addons, 3=Complexity, 4=Preview
  // Labor Only: 0=Mode, 1=LaborOnly, 2=Addons, 3=Complexity, 4=Preview
  const roomsStepIndex = 1;
  const sheetTypeStepIndex = inputMode === "calculator" ? 2 : 1;
  const laborOnlyStepIndex = 1;
  const addonsStepIndex = inputMode === "calculator" ? 3 : 2;
  const complexityStepIndex = inputMode === "calculator" ? 4 : 3;

  const ceilingFactorInfo = CEILING_HEIGHT_FACTORS.find(
    (f) => f.value === ceilingFactor
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepHeader
        title="Estimate Preview"
        description="Review your estimate before sending"
      />

      {/* Big Total */}
      <div
        className={cn(
          "rounded-2xl p-6 mb-6 text-center",
          clientSuppliesMaterials || inputMode === "labor_only"
            ? "bg-orange-500"
            : "bg-blue-600"
        )}
      >
        <div
          className={cn(
            "text-sm mb-1",
            clientSuppliesMaterials || inputMode === "labor_only"
              ? "text-orange-100"
              : "text-blue-200"
          )}
        >
          {inputMode === "labor_only" || clientSuppliesMaterials
            ? "Labor Only Estimate"
            : "Total Estimate"}
        </div>
        <div className="text-5xl font-bold text-white mb-2">
          ${formatCurrency(totals.total)}
        </div>
        <div
          className={cn(
            "flex justify-center gap-4 text-sm flex-wrap",
            clientSuppliesMaterials || inputMode === "labor_only"
              ? "text-orange-100"
              : "text-blue-200"
          )}
        >
          <span>{totals.totalSqft.toFixed(0)} sqft</span>
          {directHours > 0 && (
            <>
              <span>•</span>
              <span>{directHours} hrs</span>
            </>
          )}
          {inputMode !== "labor_only" && (
            <>
              <span>•</span>
              <span>{totals.sheetsNeeded} sheets</span>
            </>
          )}
          <span>•</span>
          <span>${formatCurrency(totals.costPerSqft)}/sqft</span>
        </div>
      </div>

      {/* Breakdown sections */}
      <div className="space-y-4">
        {/* Rooms/Area (calculator mode) */}
        {inputMode === "calculator" && rooms.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Rooms</h3>
              <EditButton onClick={() => goToStep(roomsStepIndex)} />
            </div>
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={room.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{room.name}</span>
                  <span className="text-gray-900">
                    {room.totalSqft.toFixed(0)} sqft
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-medium">
                <span className="text-gray-700">Total Area</span>
                <span className="text-blue-600">
                  {totals.totalSqft.toFixed(0)} sqft
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Labor Only Section */}
        {inputMode === "labor_only" && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Labor Only</h3>
              <EditButton onClick={() => goToStep(laborOnlyStepIndex)} />
            </div>
            <div className="space-y-2">
              {directSqft > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Square Footage</span>
                    <span className="text-gray-900">{directSqft} sqft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Labor Rate</span>
                    <span className="text-gray-900">
                      ${(defaultRates.labor_per_sqft ?? 0.35).toFixed(2)}/sqft
                    </span>
                  </div>
                </>
              )}
              {directHours > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Additional Hours</span>
                    <span className="text-gray-900">{directHours} hrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hourly Rate</span>
                    <span className="text-gray-900">
                      ${hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700">Labor Total</span>
                <span className="text-gray-900">
                  ${formatCurrency(totals.laborSubtotal)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Client supplies all materials
              </div>
            </div>
          </div>
        )}

        {/* Sheets (calculator and direct modes only) */}
        {inputMode !== "labor_only" && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Drywall Sheets</h3>
              <EditButton onClick={() => goToStep(sheetTypeStepIndex)} />
            </div>

            {/* Labor only indicator */}
            {clientSuppliesMaterials && (
              <div className="mb-3 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                Labor only - client supplies materials
              </div>
            )}

            <div className="space-y-2">
              {sheets.map((sheet) => {
                const sheetType = DRYWALL_SHEET_TYPES.find(
                  (t) => t.id === sheet.typeId
                );
                const sheetSize = DRYWALL_SHEET_SIZES.find(
                  (s) => s.value === sheet.size
                );

                return (
                  <div key={sheet.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {sheetType?.label} ({sheetSize?.label}) × {sheet.quantity}
                    </span>
                    <span className="text-gray-900">
                      ${formatCurrency(sheet.subtotal)}
                    </span>
                  </div>
                );
              })}
              {inputMode === "calculator" && (
                <div className="text-xs text-gray-500">
                  Includes {(wasteFactor * 100).toFixed(0)}% waste factor
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2">
              {!clientSuppliesMaterials && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Materials</span>
                  <span className="text-gray-900">
                    ${formatCurrency(totals.materialSubtotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Labor
                  {ceilingFactorInfo && ceilingFactorInfo.multiplier !== 1 && (
                    <span className="text-xs text-gray-400 ml-1">
                      ({ceilingFactorInfo.label})
                    </span>
                  )}
                </span>
                <span className="text-gray-900">
                  ${formatCurrency(totals.laborSubtotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Add-ons */}
        {addons.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Add-ons</h3>
              <EditButton onClick={() => goToStep(addonsStepIndex)} />
            </div>
            <div className="space-y-2">
              {addons.map((addon) => {
                const addonDef = HANGING_ADDONS.find((a) => a.id === addon.id);
                return (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {addonDef?.label}
                      {addonDef?.unit !== "flat" && ` (${addon.quantity})`}
                    </span>
                    <span className="text-gray-900">
                      ${formatCurrency(addon.total)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-medium">
              <span className="text-gray-700">Add-ons Total</span>
              <span className="text-gray-900">
                ${formatCurrency(totals.addonsSubtotal)}
              </span>
            </div>
          </div>
        )}

        {/* Additional Hours (non-labor-only modes) */}
        {inputMode !== "labor_only" && directHours > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Additional Hours</h3>
              <EditButton onClick={() => goToStep(addonsStepIndex)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hours</span>
                <span className="text-gray-900">{directHours} hrs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rate</span>
                <span className="text-gray-900">
                  ${hourlyRate.toFixed(2)}/hr
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-medium">
              <span className="text-gray-700">Hours Total</span>
              <span className="text-gray-900">
                ${formatCurrency(directHours * hourlyRate)}
              </span>
            </div>
          </div>
        )}

        {/* Complexity Adjustment */}
        {totals.complexityAdjustment !== 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Complexity</h3>
              <EditButton onClick={() => goToStep(complexityStepIndex)} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {complexity.charAt(0).toUpperCase() + complexity.slice(1)} (
                {totals.complexityMultiplier > 1 ? "+" : ""}
                {((totals.complexityMultiplier - 1) * 100).toFixed(0)}%)
              </span>
              <span
                className={cn(
                  "font-medium",
                  totals.complexityAdjustment > 0
                    ? "text-orange-600"
                    : "text-green-600"
                )}
              >
                {totals.complexityAdjustment > 0 ? "+" : ""}$
                {formatCurrency(totals.complexityAdjustment)}
              </span>
            </div>
          </div>
        )}

        {/* Final Total */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Final Total</span>
            <span className="text-2xl font-bold text-blue-600">
              ${formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
