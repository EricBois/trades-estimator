"use client";

import { cn } from "@/lib/utils";

interface SelectionPillProps<T extends string | number> {
  value: T;
  isSelected: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
  className?: string;
}

export function SelectionPill<T extends string | number>({
  isSelected,
  onClick,
  label,
  sublabel,
  className,
}: SelectionPillProps<T>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-3 px-3 rounded-xl border-2 transition-all text-center",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300",
        className
      )}
    >
      <div
        className={cn(
          "font-semibold text-sm",
          isSelected ? "text-blue-900" : "text-gray-900"
        )}
      >
        {label}
      </div>
      {sublabel && (
        <div className="text-xs text-gray-500 truncate">{sublabel}</div>
      )}
    </button>
  );
}

interface SelectionPillGroupProps<T, V extends string | number> {
  options: readonly T[] | T[];
  selectedValue: V;
  onSelect: (value: V) => void;
  getKey: (option: T) => string;
  getLabel: (option: T) => string;
  getSublabel?: (option: T) => string | undefined;
  getValue: (option: T) => V;
  className?: string;
}

export function SelectionPillGroup<T, V extends string | number>({
  options,
  selectedValue,
  onSelect,
  getKey,
  getLabel,
  getSublabel,
  getValue,
  className,
}: SelectionPillGroupProps<T, V>) {
  return (
    <div className={cn("flex gap-2", className)}>
      {options.map((option) => {
        const value = getValue(option);
        const isSelected = selectedValue === value;

        return (
          <SelectionPill
            key={getKey(option)}
            value={value as string | number}
            isSelected={isSelected}
            onClick={() => onSelect(value)}
            label={getLabel(option)}
            sublabel={getSublabel?.(option)}
          />
        );
      })}
    </div>
  );
}
