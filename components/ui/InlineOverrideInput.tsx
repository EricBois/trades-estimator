"use client";

import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineOverrideInputProps {
  value: number;
  defaultValue: number;
  override?: number;
  onOverrideChange: (override: number | undefined) => void;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function InlineOverrideInput({
  value,
  defaultValue,
  override,
  onOverrideChange,
  prefix = "$",
  suffix,
  className,
}: InlineOverrideInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(override ?? value));
  const hasOverride = override !== undefined;

  const handleEdit = () => {
    setInputValue(String(override ?? value));
    setIsEditing(true);
  };

  const handleSave = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onOverrideChange(parsed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleClear = () => {
    onOverrideChange(undefined);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <span className="text-sm text-gray-500">{prefix}</span>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-16 text-sm px-1 py-0.5 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          step="0.01"
          min="0"
        />
        {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-700"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 group", className)}>
      <span
        className={cn(
          "text-sm",
          hasOverride ? "text-orange-600 font-medium" : "text-gray-700"
        )}
      >
        {prefix}
        {value.toFixed(2)}
        {suffix}
      </span>
      <button
        onClick={handleEdit}
        className="p-1 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="w-3 h-3" />
      </button>
      {hasOverride && (
        <button
          onClick={handleClear}
          className="p-1 text-orange-400 hover:text-orange-600"
          title={`Reset to default: ${prefix}${defaultValue.toFixed(2)}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
