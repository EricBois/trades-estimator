"use client";

import { Trash2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomAddon, AddonUnit } from "@/lib/trades/shared/types";
import { InlineOverrideInput } from "./InlineOverrideInput";

interface CustomAddonCardProps {
  addon: CustomAddon;
  onUpdate: (updates: Partial<Omit<CustomAddon, "id" | "isCustom" | "total">>) => void;
  onRemove: () => void;
  className?: string;
}

export function CustomAddonCard({ addon, onUpdate, onRemove, className }: CustomAddonCardProps) {
  const unitLabels: Record<AddonUnit, string> = {
    flat: "flat",
    sqft: "sqft",
    linear_ft: "linear ft",
    each: "each",
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = addon.quantity + delta;
    if (newQuantity >= 1) {
      onUpdate({ quantity: newQuantity });
    }
  };

  const handlePriceChange = (newPrice: number | undefined) => {
    if (newPrice !== undefined) {
      onUpdate({ price: newPrice });
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border-2 border-blue-500 bg-blue-50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-600 transition-colors"
          title="Remove add-on"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <span className="text-gray-900 font-medium">{addon.name}</span>
      </div>

      <div className="flex items-center gap-3">
        {addon.unit !== "flat" && (
          <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 px-1">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={addon.quantity <= 1}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-sm w-8 text-center">{addon.quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <InlineOverrideInput
            value={addon.price}
            defaultValue={addon.price}
            override={undefined}
            onOverrideChange={handlePriceChange}
            suffix={`/${unitLabels[addon.unit]}`}
          />
        </div>

        <div className="text-sm font-medium text-gray-700 w-20 text-right">
          ${addon.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
