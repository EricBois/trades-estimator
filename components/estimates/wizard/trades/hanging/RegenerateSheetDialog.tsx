"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrywallSheetTypeId } from "@/lib/trades/drywallHanging/types";
import { DRYWALL_SHEET_TYPES } from "@/lib/trades/drywallHanging/constants";

interface SheetOption {
  typeId: DrywallSheetTypeId;
  label: string;
}

interface RegenerateSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sheetOptions: SheetOption[];
  remainingSheets: number;
  onSelect: (typeId: DrywallSheetTypeId) => void;
}

function RegenerateSheetDialogContent({
  onClose,
  sheetOptions,
  remainingSheets,
  onSelect,
}: Omit<RegenerateSheetDialogProps, "isOpen">) {
  const handleSelect = (typeId: DrywallSheetTypeId) => {
    onSelect(typeId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Select Sheet Type
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            Which sheet type should receive the {remainingSheets} remaining
            sheets?
          </p>

          {/* Sheet type options */}
          <div className="space-y-2">
            {sheetOptions.map((option) => {
              const typeInfo = DRYWALL_SHEET_TYPES.find(
                (t) => t.id === option.typeId
              );
              return (
                <button
                  key={option.typeId}
                  onClick={() => handleSelect(option.typeId)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200",
                    "hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {option.label}
                    </div>
                    {typeInfo && (
                      <div className="text-sm text-gray-500">
                        ${typeInfo.materialCost}/sheet
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-medium text-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export function RegenerateSheetDialog({
  isOpen,
  ...props
}: RegenerateSheetDialogProps) {
  if (!isOpen) return null;
  return <RegenerateSheetDialogContent {...props} />;
}
