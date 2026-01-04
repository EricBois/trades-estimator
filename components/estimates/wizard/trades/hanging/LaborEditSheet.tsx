"use client";

import { useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LaborEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sheetTypeName: string;
  currentLabor: number;
  defaultLabor: number;
  laborOverride?: number;
  onSave: (override: number | undefined) => void;
}

// Inner component that only mounts when sheet is open
// This ensures useState initializes fresh each time
function LaborEditSheetContent({
  onClose,
  sheetTypeName,
  currentLabor,
  defaultLabor,
  laborOverride,
  onSave,
}: Omit<LaborEditSheetProps, "isOpen">) {
  const [value, setValue] = useState<string>(currentLabor.toFixed(2));

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      // Only set override if different from default
      if (numValue !== defaultLabor) {
        onSave(numValue);
      } else {
        onSave(undefined); // Clear override if matches default
      }
      onClose();
    }
  };

  const handleReset = () => {
    setValue(defaultLabor.toFixed(2));
    onSave(undefined);
    onClose();
  };

  const hasOverride = laborOverride !== undefined;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit Labor Rate
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
          <p className="text-sm text-gray-500 mb-4">{sheetTypeName}</p>

          {/* Labor input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor cost per sheet
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") onClose();
                }}
                step="0.01"
                min="0"
                className={cn(
                  "w-full pl-8 pr-4 py-4 text-lg font-medium rounded-xl border-2 focus:outline-none focus:ring-0",
                  hasOverride
                    ? "border-orange-300 focus:border-orange-500"
                    : "border-gray-200 focus:border-blue-500"
                )}
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Default: ${defaultLabor.toFixed(2)}/sheet
            </p>
          </div>

          {/* Reset button */}
          {hasOverride && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 mb-4"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to default
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-xl font-medium text-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

// Wrapper that conditionally renders content
export function LaborEditSheet({ isOpen, ...props }: LaborEditSheetProps) {
  if (!isOpen) return null;
  return <LaborEditSheetContent {...props} />;
}
