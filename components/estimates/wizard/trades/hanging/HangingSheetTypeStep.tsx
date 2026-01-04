"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useWizard } from "react-use-wizard";
import {
  Square,
  Feather,
  Droplet,
  Flame,
  Volume2,
  Shield,
  Check,
} from "lucide-react";
import { useHangingEstimateSafe } from "./HangingEstimateContext";
import { UseDrywallHangingEstimateReturn } from "@/lib/trades/drywallHanging/types";
import { useWizardFooter } from "../../WizardFooterContext";
import {
  DRYWALL_SHEET_TYPES,
  DRYWALL_SHEET_SIZES,
  WASTE_FACTORS,
  HANGING_RATES,
} from "@/lib/trades/drywallHanging/constants";
import {
  DrywallSheetTypeId,
  DrywallSheetSize,
} from "@/lib/trades/drywallHanging/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { StepHeader } from "@/components/ui/StepHeader";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SelectionPillGroup } from "@/components/ui/SelectionPill";
import { CostSummary } from "@/components/ui/CostSummary";
import { MaterialToggle } from "@/components/ui/MaterialToggle";
import { LaborEditSheet } from "./LaborEditSheet";

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Square,
  Feather,
  Droplet,
  Flame,
  Volume2,
  Shield,
};

export function HangingSheetTypeStep({
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
      "HangingSheetTypeStep requires either hangingEstimate prop or HangingEstimateProvider"
    );
  }

  const {
    rooms,
    sheets,
    wasteFactor,
    setWasteFactor,
    addSheet,
    updateSheet,
    removeSheet,
    calculateSheetsFromRooms,
    totals,
    clientSuppliesMaterials,
    setClientSuppliesMaterials,
    setSheetLaborCostOverride,
    directHours,
  } = estimate;

  // State for labor edit sheet
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const editingSheet = editingSheetId
    ? sheets.find((s) => s.id === editingSheetId)
    : null;
  const editingSheetType = editingSheet
    ? DRYWALL_SHEET_TYPES.find((t) => t.id === editingSheet.typeId)
    : null;

  // Track if we've done initial sheet calculation
  const hasInitialized = useRef(false);
  // Track previous waste factor to detect changes
  const prevWasteFactorRef = useRef(wasteFactor);

  // Use gross sqft for hanging (no deductions for openings - industry standard)
  // Use totals from hook which handles all input modes correctly
  const totalSqft = totals.grossTotalSqft;
  const currentSize: DrywallSheetSize = sheets[0]?.size ?? "4x8";
  const sizeInfo = DRYWALL_SHEET_SIZES.find((s) => s.value === currentSize);
  const sqftPerSheet = sizeInfo?.sqft ?? 32;
  const totalSheetsNeeded = Math.ceil(
    (totalSqft * (1 + wasteFactor)) / sqftPerSheet
  );
  const allocatedSheets = sheets.reduce((sum, s) => sum + s.quantity, 0);
  const remainingSheets = totalSheetsNeeded - allocatedSheets;

  // Calculate sheets from rooms only on first load (not when user deletes sheets)
  useEffect(() => {
    if (!hasInitialized.current && sheets.length === 0 && rooms.length > 0) {
      calculateSheetsFromRooms();
      hasInitialized.current = true;
    }
  }, [sheets.length, rooms.length, calculateSheetsFromRooms]);

  // Recalculate sheet quantities when waste factor changes
  useEffect(() => {
    // Only run if waste factor actually changed (not on initial render)
    if (prevWasteFactorRef.current === wasteFactor) return;
    prevWasteFactorRef.current = wasteFactor;

    if (sheets.length === 0 || totalSqft <= 0) return;

    const newTotalNeeded = Math.ceil(
      (totalSqft * (1 + wasteFactor)) / sqftPerSheet
    );

    if (sheets.length === 1) {
      // Single sheet type - update to new total
      updateSheet(sheets[0].id, { quantity: newTotalNeeded });
    } else {
      // Multiple sheet types - scale proportionally
      const currentTotal = sheets.reduce((sum, s) => sum + s.quantity, 0);
      if (currentTotal > 0) {
        const scale = newTotalNeeded / currentTotal;
        sheets.forEach((sheet) => {
          const newQty = Math.round(sheet.quantity * scale);
          updateSheet(sheet.id, { quantity: Math.max(0, newQty) });
        });
      }
    }
  }, [wasteFactor, totalSqft, sqftPerSheet, sheets, updateSheet]);

  // Sheet selection is optional - sqft comes from rooms/project, user can add hours later
  // Allow continuing always - this step is for material selection which is optional
  const hasContent =
    totals.grossTotalSqft > 0 || directHours > 0 || sheets.length > 0;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: false, // Always allow continue - step is optional for hours-only estimates
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  const handleTypeToggle = (typeId: DrywallSheetTypeId) => {
    const existingSheet = sheets.find((s) => s.typeId === typeId);

    if (existingSheet) {
      removeSheet(existingSheet.id);
    } else {
      if (sheets.length === 0) {
        addSheet(typeId, currentSize, totalSheetsNeeded);
      } else if (remainingSheets > 0) {
        addSheet(typeId, currentSize, remainingSheets);
      } else {
        addSheet(typeId, currentSize, 0);
      }
    }
  };

  const handleQuantityChange = (
    typeId: DrywallSheetTypeId,
    newValue: number
  ) => {
    const sheet = sheets.find((s) => s.typeId === typeId);
    if (!sheet) return;

    const delta = newValue - sheet.quantity;
    updateSheet(sheet.id, { quantity: newValue });

    // If exactly 2 types selected, auto-adjust the other one
    if (sheets.length === 2) {
      const otherSheet = sheets.find((s) => s.typeId !== typeId);
      if (otherSheet) {
        const otherNewQty = Math.max(0, otherSheet.quantity - delta);
        updateSheet(otherSheet.id, { quantity: otherNewQty });
      }
    }
  };

  const handleSizeSelect = (size: DrywallSheetSize) => {
    sheets.forEach((sheet) => {
      updateSheet(sheet.id, { size });
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepHeader
        title="Sheet Type & Size"
        description={`${totalSqft.toFixed(
          0
        )} sqft labor - select sheets for material list (optional)`}
      />

      {/* Global Materials Toggle */}
      <div className="mb-6">
        <MaterialToggle
          included={!clientSuppliesMaterials}
          onChange={(include) => setClientSuppliesMaterials(!include)}
        />
      </div>

      {/* Sheet Types - Multi-select with quantity */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Sheet Types</h3>
        <div className="space-y-2">
          {DRYWALL_SHEET_TYPES.map((type) => {
            const Icon = ICONS[type.icon] || Square;
            const sheet = sheets.find((s) => s.typeId === type.id);
            const isSelected = !!sheet;

            return (
              <div
                key={type.id}
                className={cn(
                  "rounded-xl border-2 transition-all overflow-hidden",
                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                )}
              >
                <button
                  onClick={() =>
                    handleTypeToggle(type.id as DrywallSheetTypeId)
                  }
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left",
                    !isSelected && "hover:bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-blue-600" : "bg-gray-100"
                    )}
                  >
                    {isSelected ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}
                    >
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      $
                      {(
                        (clientSuppliesMaterials ? 0 : type.materialCost) +
                        HANGING_RATES.labor_per_sqft.mid *
                          sqftPerSheet *
                          type.laborMultiplier
                      ).toFixed(0)}
                      /sheet{clientSuppliesMaterials && " (labor)"}
                    </div>
                  </div>
                  {isSelected && sheet && (
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-900">
                        {sheet.quantity} sheets
                      </div>
                      <div className="text-xs text-blue-600">
                        ${formatCurrency(sheet.subtotal)}
                      </div>
                    </div>
                  )}
                </button>

                {/* Quantity controls - shown when selected */}
                {isSelected && sheet && (
                  <div className="border-t border-blue-200 bg-blue-50/50 px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Quantity</span>
                      <QuantityStepper
                        value={sheet.quantity}
                        onChange={(val) =>
                          handleQuantityChange(
                            type.id as DrywallSheetTypeId,
                            val
                          )
                        }
                        min={0}
                        size="md"
                      />
                    </div>
                    {/* Tap to edit labor rate */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Labor/sheet</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSheetId(sheet.id);
                        }}
                        className={cn(
                          "text-sm font-medium px-2 py-1 rounded-lg transition-colors",
                          sheet.laborCostOverride !== undefined
                            ? "text-orange-600 bg-orange-50 hover:bg-orange-100"
                            : "text-blue-600 bg-blue-100 hover:bg-blue-200"
                        )}
                      >
                        $
                        {(sheet.laborCostOverride ?? sheet.laborCost).toFixed(
                          2
                        )}
                        {sheet.laborCostOverride !== undefined && " ✎"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sheet Size */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Sheet Size (all types)
        </h3>
        <SelectionPillGroup<
          (typeof DRYWALL_SHEET_SIZES)[number],
          DrywallSheetSize
        >
          options={DRYWALL_SHEET_SIZES}
          selectedValue={currentSize}
          onSelect={(val: DrywallSheetSize) => handleSizeSelect(val)}
          getKey={(opt: (typeof DRYWALL_SHEET_SIZES)[number]) => opt.value}
          getLabel={(opt: (typeof DRYWALL_SHEET_SIZES)[number]) => opt.label}
          getSublabel={(opt: (typeof DRYWALL_SHEET_SIZES)[number]) =>
            `${opt.sqft} sqft`
          }
          getValue={(opt: (typeof DRYWALL_SHEET_SIZES)[number]) => opt.value}
        />
      </div>

      {/* Waste Factor */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Waste Factor</h3>
        <SelectionPillGroup<(typeof WASTE_FACTORS)[number], number>
          options={WASTE_FACTORS}
          selectedValue={wasteFactor}
          onSelect={(val: number) => setWasteFactor(val)}
          getKey={(opt: (typeof WASTE_FACTORS)[number]) => String(opt.value)}
          getLabel={(opt: (typeof WASTE_FACTORS)[number]) =>
            `${(opt.value * 100).toFixed(0)}%`
          }
          getSublabel={(opt: (typeof WASTE_FACTORS)[number]) =>
            opt.label.split(" - ")[1]
          }
          getValue={(opt: (typeof WASTE_FACTORS)[number]) => opt.value}
        />
      </div>

      {/* Cost Summary */}
      {hasContent && (
        <CostSummary
          variant={clientSuppliesMaterials ? "orange" : "blue"}
          className="mb-6"
          items={[
            { label: "Total Sheets", value: `${allocatedSheets} sheets` },
            {
              label: "Coverage",
              value: `${(allocatedSheets * sqftPerSheet).toFixed(0)} sqft`,
            },
            ...(clientSuppliesMaterials
              ? [{ label: "Pricing", value: "Labor only" }]
              : []),
          ]}
          total={{ label: "Total", value: totals.subtotal }}
        />
      )}

      {/* Labor Edit Sheet */}
      <LaborEditSheet
        isOpen={editingSheetId !== null}
        onClose={() => setEditingSheetId(null)}
        sheetTypeName={editingSheetType?.label ?? ""}
        currentLabor={
          editingSheet?.laborCostOverride ?? editingSheet?.laborCost ?? 0
        }
        defaultLabor={editingSheet?.laborCost ?? 0}
        laborOverride={editingSheet?.laborCostOverride}
        onSave={(override) => {
          if (editingSheetId) {
            setSheetLaborCostOverride(editingSheetId, override);
          }
        }}
      />
    </div>
  );
}
