"use client";

import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  unit?: string;
  size?: "sm" | "md" | "lg";
  showInput?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    main: "w-10 h-10",
    large: "w-8 h-8 text-xs",
    value: "w-12 text-lg",
    icon: "w-4 h-4",
  },
  md: {
    main: "w-12 h-12",
    large: "w-10 h-10 text-sm",
    value: "w-16 text-xl",
    icon: "w-5 h-5",
  },
  lg: {
    main: "w-14 h-14",
    large: "w-12 h-12 text-sm",
    value: "w-20 text-2xl",
    icon: "w-6 h-6",
  },
};

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  largeStep = 5,
  unit,
  size = "md",
  showInput = false,
  className,
}: QuantityStepperProps) {
  const config = sizeConfig[size];

  const handleChange = (delta: number) => {
    let newValue = value + delta;
    if (min !== undefined) newValue = Math.max(min, newValue);
    if (max !== undefined) newValue = Math.min(max, newValue);
    onChange(newValue);
  };

  const handleInputChange = (inputValue: string) => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      let newValue = parsed;
      if (min !== undefined) newValue = Math.max(min, newValue);
      if (max !== undefined) newValue = Math.min(max, newValue);
      onChange(newValue);
    }
  };

  const canDecrement = value > min;
  const canDecrementLarge = value >= min + largeStep;
  const canIncrement = max === undefined || value < max;
  const canIncrementLarge = max === undefined || value + largeStep <= max;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Large decrement */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleChange(-largeStep);
        }}
        disabled={!canDecrementLarge}
        className={cn(
          "rounded-lg flex items-center justify-center font-bold transition-all",
          config.large,
          canDecrementLarge
            ? "bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 active:scale-95"
            : "bg-gray-100 text-gray-300"
        )}
      >
        -{largeStep}
      </button>

      {/* Small decrement */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleChange(-step);
        }}
        disabled={!canDecrement}
        className={cn(
          "rounded-lg flex items-center justify-center transition-all",
          config.main,
          canDecrement
            ? "bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 active:scale-95"
            : "bg-gray-100 text-gray-300"
        )}
      >
        <Minus className={config.icon} />
      </button>

      {/* Value display */}
      {showInput ? (
        <input
          type="number"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          className={cn(
            "h-14 text-center font-bold text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500",
            config.value
          )}
          min={min}
          max={max}
        />
      ) : (
        <span
          className={cn("text-center font-bold text-blue-900", config.value)}
        >
          {value}
        </span>
      )}

      {/* Small increment */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleChange(step);
        }}
        disabled={!canIncrement}
        className={cn(
          "rounded-lg flex items-center justify-center transition-all",
          config.main,
          canIncrement
            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
            : "bg-gray-100 text-gray-300"
        )}
      >
        <Plus className={config.icon} />
      </button>

      {/* Large increment */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleChange(largeStep);
        }}
        disabled={!canIncrementLarge}
        className={cn(
          "rounded-lg flex items-center justify-center font-bold transition-all",
          config.large,
          canIncrementLarge
            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
            : "bg-gray-100 text-gray-300"
        )}
      >
        +{largeStep}
      </button>

      {/* Unit label */}
      {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
    </div>
  );
}
