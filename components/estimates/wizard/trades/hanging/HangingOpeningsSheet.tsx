"use client";

import { useState } from "react";
import { X, Plus, Minus, DoorOpen, Square } from "lucide-react";
import { OPENING_PRESETS } from "@/lib/trades/drywallHanging/constants";
import { cn } from "@/lib/utils";

interface HangingOpeningsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  type: "doors" | "windows";
  onAddOpening: (presetId: string, quantity: number) => void;
}

export function HangingOpeningsSheet({
  isOpen,
  onClose,
  roomId,
  type,
  onAddOpening,
}: HangingOpeningsSheetProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const presets = OPENING_PRESETS[type];
  const Icon = type === "doors" ? DoorOpen : Square;

  const handleAdd = () => {
    if (selectedPresetId) {
      onAddOpening(selectedPresetId, quantity);
      // Reset state
      setSelectedPresetId(null);
      setQuantity(1);
    }
  };

  const handleClose = () => {
    setSelectedPresetId(null);
    setQuantity(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Add {type === "doors" ? "Door" : "Window"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-500 mb-4">
            Select a preset size or enter custom dimensions
          </p>

          {/* Preset options */}
          <div className="space-y-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                  selectedPresetId === preset.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    selectedPresetId === preset.id
                      ? "bg-blue-600"
                      : "bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      selectedPresetId === preset.id
                        ? "text-white"
                        : "text-gray-500"
                    )}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={cn(
                      "font-medium",
                      selectedPresetId === preset.id
                        ? "text-blue-900"
                        : "text-gray-900"
                    )}
                  >
                    {preset.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {preset.width}&quot;×{preset.height}&quot; ({preset.sqft}{" "}
                    sqft)
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quantity selector (shown when a preset is selected) */}
          {selectedPresetId && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      quantity <= 1
                        ? "bg-gray-100 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    )}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center text-xl font-semibold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleAdd}
            disabled={!selectedPresetId}
            className={cn(
              "w-full py-4 rounded-xl font-medium text-lg transition-all",
              selectedPresetId
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            Add {type === "doors" ? "Door" : "Window"}
            {quantity > 1 ? `s (${quantity})` : ""}
          </button>
        </div>
      </div>
    </>
  );
}
