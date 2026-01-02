"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MATERIAL_UNITS = [
  "bucket",
  "roll",
  "gallon",
  "pail",
  "box",
  "bag",
  "piece",
  "linear ft",
] as const;

interface CustomMaterialInputProps {
  onAdd: (name: string, price: number, unit: string) => void;
  className?: string;
}

export function CustomMaterialInput({
  onAdd,
  className,
}: CustomMaterialInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<string>("bucket");

  const handleAdd = () => {
    const parsedPrice = parseFloat(price);

    if (name.trim() && !isNaN(parsedPrice) && parsedPrice >= 0) {
      onAdd(name.trim(), parsedPrice, unit);
      // Reset form
      setName("");
      setPrice("");
      setUnit("bucket");
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "w-full p-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2",
          className
        )}
      >
        <Plus className="w-4 h-4" />
        <span>Add Custom Material</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "p-3 rounded-lg border-2 border-blue-400 bg-blue-50 space-y-3",
        className
      )}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <input
            type="text"
            placeholder="Material name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-1">$</span>
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        <div>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            {MATERIAL_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={!name.trim() || !price}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
        <button
          onClick={() => setIsExpanded(false)}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
