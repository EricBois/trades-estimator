"use client";

import { useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Square,
  Feather,
  Droplet,
  Flame,
  Volume2,
  Shield,
} from "lucide-react";
import { useWizard } from "react-use-wizard";
import { useHangingEstimate } from "./HangingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import {
  DRYWALL_SHEET_TYPES,
  DRYWALL_SHEET_SIZES,
} from "@/lib/trades/drywallHanging/constants";
import {
  DrywallSheetTypeId,
  DrywallSheetSize,
  HangingSheetEntry,
} from "@/lib/trades/drywallHanging/types";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { StepHeader } from "@/components/ui/StepHeader";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { CostSummary } from "@/components/ui/CostSummary";
import { MaterialToggle } from "@/components/ui/MaterialToggle";
import { InlineOverrideInput } from "@/components/ui/InlineOverrideInput";

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Square,
  Feather,
  Droplet,
  Flame,
  Volume2,
  Shield,
};

interface SheetCardProps {
  sheet: HangingSheetEntry;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateType: (typeId: DrywallSheetTypeId) => void;
  onUpdateSize: (size: DrywallSheetSize) => void;
  onRemove: () => void;
  onToggleMaterial: (include: boolean) => void;
  onMaterialOverride: (override: number | undefined) => void;
  onLaborOverride: (override: number | undefined) => void;
  globalMaterialsExcluded?: boolean;
}

function SheetCard({
  sheet,
  onUpdateQuantity,
  onUpdateType,
  onUpdateSize,
  onRemove,
  onToggleMaterial,
  onMaterialOverride,
  onLaborOverride,
  globalMaterialsExcluded = false,
}: SheetCardProps) {
  const sheetType = DRYWALL_SHEET_TYPES.find((t) => t.id === sheet.typeId);
  const Icon = sheetType ? ICONS[sheetType.icon] || Square : Square;

  // Get effective costs for display
  const effectiveMaterialCost =
    sheet.materialCostOverride ?? sheet.materialCost;
  const effectiveLaborCost = sheet.laborCostOverride ?? sheet.laborCost;

  return (
    <div
      className={cn(
        "bg-white border-2 rounded-xl p-4",
        sheet.hasOverride ? "border-orange-200" : "border-gray-200"
      )}
    >
      {/* Type and Size selectors */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <select
              value={sheet.typeId}
              onChange={(e) =>
                onUpdateType(e.target.value as DrywallSheetTypeId)
              }
              className="font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-pointer"
            >
              {DRYWALL_SHEET_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={sheet.size}
              onChange={(e) => onUpdateSize(e.target.value as DrywallSheetSize)}
              className="block text-sm text-gray-500 bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-pointer"
            >
              {DRYWALL_SHEET_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label} ({size.sqft} sqft)
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Material toggle - only show when global materials are included */}
      {!globalMaterialsExcluded ? (
        <div className="mb-4">
          <MaterialToggle
            included={sheet.includeMaterial}
            onChange={onToggleMaterial}
          />
        </div>
      ) : (
        <div className="mb-4 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
          Labor only (global setting)
        </div>
      )}

      {/* Quantity stepper */}
      <div className="flex items-center justify-between">
        <QuantityStepper
          value={sheet.quantity}
          onChange={onUpdateQuantity}
          min={0}
          size="lg"
          showInput
        />
        <span className="text-sm text-gray-500 ml-2">sheets</span>
      </div>

      {/* Cost breakdown with inline overrides */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        {sheet.includeMaterial && (
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-500">Material per sheet:</span>
            <InlineOverrideInput
              value={effectiveMaterialCost}
              defaultValue={sheet.materialCost}
              override={sheet.materialCostOverride}
              onOverrideChange={onMaterialOverride}
            />
          </div>
        )}
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-gray-500">Labor per sheet:</span>
          <InlineOverrideInput
            value={effectiveLaborCost}
            defaultValue={sheet.laborCost}
            override={sheet.laborCostOverride}
            onOverrideChange={onLaborOverride}
          />
        </div>

        {/* Calculated totals */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          {sheet.includeMaterial && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Material: ${effectiveMaterialCost.toFixed(2)} × {sheet.quantity}
              </span>
              <span className="text-gray-700">
                ${formatCurrency(effectiveMaterialCost * sheet.quantity)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">
              Labor: ${effectiveLaborCost.toFixed(2)} × {sheet.quantity}
            </span>
            <span className="text-gray-700">
              ${formatCurrency(effectiveLaborCost * sheet.quantity)}
            </span>
          </div>
        </div>

        <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-100">
          <span className="text-gray-700">Subtotal</span>
          <span
            className={cn(
              sheet.hasOverride ? "text-orange-600" : "text-blue-600"
            )}
          >
            ${formatCurrency(sheet.subtotal)}
            {sheet.hasOverride && (
              <span className="text-xs ml-1">(custom)</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HangingDirectEntryStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    sheets,
    addSheet,
    updateSheet,
    removeSheet,
    totals,
    setSheetIncludeMaterial,
    setSheetMaterialCostOverride,
    setSheetLaborCostOverride,
    clientSuppliesMaterials,
    setClientSuppliesMaterials,
  } = useHangingEstimate();

  const handleAddSheet = () => {
    addSheet("standard_half", "4x8", 1);
  };

  const totalSheets = sheets.reduce((sum, s) => sum + s.quantity, 0);

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: sheets.length === 0 || totalSheets === 0,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, sheets.length, totalSheets]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepHeader
        title="Enter Sheets"
        description="Add drywall sheets and quantities"
      />

      {/* Global Materials Toggle */}
      <div className="mb-6">
        <MaterialToggle
          included={!clientSuppliesMaterials}
          onChange={(include) => setClientSuppliesMaterials(!include)}
        />
      </div>

      {/* Sheet entries */}
      <div className="space-y-4 mb-4">
        {sheets.map((sheet) => (
          <SheetCard
            key={sheet.id}
            sheet={sheet}
            onUpdateQuantity={(quantity) => updateSheet(sheet.id, { quantity })}
            onUpdateType={(typeId) => updateSheet(sheet.id, { typeId })}
            onUpdateSize={(size) => updateSheet(sheet.id, { size })}
            onRemove={() => removeSheet(sheet.id)}
            onToggleMaterial={(include) =>
              setSheetIncludeMaterial(sheet.id, include)
            }
            onMaterialOverride={(override) =>
              setSheetMaterialCostOverride(sheet.id, override)
            }
            onLaborOverride={(override) =>
              setSheetLaborCostOverride(sheet.id, override)
            }
            globalMaterialsExcluded={clientSuppliesMaterials}
          />
        ))}
      </div>

      {/* Add sheet button */}
      <button
        onClick={handleAddSheet}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add Sheet Type</span>
      </button>

      {/* Total summary */}
      {sheets.length > 0 && (
        <CostSummary
          variant={clientSuppliesMaterials ? "orange" : "blue"}
          className="mt-6"
          items={[
            { label: "Total Sheets", value: `${totalSheets} sheets` },
            { label: "Coverage", value: `${totals.totalSqft.toFixed(0)} sqft` },
            ...(clientSuppliesMaterials
              ? [{ label: "Pricing", value: "Labor only" }]
              : []),
          ]}
          total={{ label: "Total", value: totals.subtotal }}
        />
      )}
    </div>
  );
}
