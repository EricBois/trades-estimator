"use client";

import { useEffect } from "react";
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
import { useHangingEstimate } from "./HangingEstimateContext";
import {
  DRYWALL_SHEET_TYPES,
  DRYWALL_SHEET_SIZES,
  WASTE_FACTORS,
} from "@/lib/trades/drywallHanging/constants";
import {
  DrywallSheetTypeId,
  DrywallSheetSize,
} from "@/lib/trades/drywallHanging/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { StepHeader } from "@/components/ui/StepHeader";
import { WizardButton } from "@/components/ui/WizardButton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SelectionPillGroup } from "@/components/ui/SelectionPill";
import { CostSummary } from "@/components/ui/CostSummary";

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Square,
  Feather,
  Droplet,
  Flame,
  Volume2,
  Shield,
};

export function HangingSheetTypeStep() {
  const { nextStep } = useWizard();
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
  } = useHangingEstimate();

  // Calculate sheets from rooms on first load if no sheets exist
  useEffect(() => {
    if (sheets.length === 0 && rooms.length > 0) {
      calculateSheetsFromRooms();
    }
  }, [sheets.length, rooms.length, calculateSheetsFromRooms]);

  const totalSqft = rooms.reduce((sum, room) => sum + room.totalSqft, 0);
  const currentSize: DrywallSheetSize = sheets[0]?.size ?? "4x8";
  const sizeInfo = DRYWALL_SHEET_SIZES.find((s) => s.value === currentSize);
  const sqftPerSheet = sizeInfo?.sqft ?? 32;
  const totalSheetsNeeded = Math.ceil(
    (totalSqft * (1 + wasteFactor)) / sqftPerSheet
  );
  const allocatedSheets = sheets.reduce((sum, s) => sum + s.quantity, 0);
  const remainingSheets = totalSheetsNeeded - allocatedSheets;

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

  const hasSelection = sheets.length > 0 && totals.sheetsNeeded > 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepHeader
        title="Sheet Type & Size"
        description={`Select drywall types for ${totalSqft.toFixed(
          0
        )} sqft - tap to add, set quantities`}
      />

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
                      ${type.materialCost + type.laborCost}/sheet
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
                  <div className="border-t border-blue-200 bg-blue-50/50 px-3 py-2">
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

      {/* Allocation Status */}
      <div
        className={cn(
          "rounded-xl p-4 mb-4",
          remainingSheets === 0 && allocatedSheets > 0
            ? "bg-green-50 border border-green-200"
            : remainingSheets < 0
            ? "bg-orange-50 border border-orange-200"
            : "bg-gray-50 border border-gray-200"
        )}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Sheets Needed</span>
          <span className="font-semibold text-gray-900">
            {totalSheetsNeeded}
          </span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Allocated</span>
          <span className="font-semibold text-gray-900">{allocatedSheets}</span>
        </div>
        <div className="border-t border-gray-200 pt-1 mt-1">
          <div className="flex justify-between items-center">
            <span
              className={cn(
                "text-sm font-medium",
                remainingSheets === 0
                  ? "text-green-600"
                  : remainingSheets < 0
                  ? "text-orange-600"
                  : "text-blue-600"
              )}
            >
              {remainingSheets === 0
                ? "Fully Allocated"
                : remainingSheets > 0
                ? "Remaining"
                : "Over Allocated"}
            </span>
            <span
              className={cn(
                "font-bold",
                remainingSheets === 0
                  ? "text-green-600"
                  : remainingSheets < 0
                  ? "text-orange-600"
                  : "text-blue-600"
              )}
            >
              {remainingSheets === 0
                ? "✓"
                : remainingSheets > 0
                ? `${remainingSheets} sheets`
                : `+${-remainingSheets} extra`}
            </span>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      {hasSelection && (
        <CostSummary
          variant="blue"
          className="mb-6"
          items={[
            { label: "Total Sheets", value: `${allocatedSheets} sheets` },
            {
              label: "Coverage",
              value: `${(allocatedSheets * sqftPerSheet).toFixed(0)} sqft`,
            },
          ]}
          total={{ label: "Total", value: totals.subtotal }}
        />
      )}

      <WizardButton onClick={() => nextStep()} disabled={!hasSelection}>
        Continue
      </WizardButton>
    </div>
  );
}
