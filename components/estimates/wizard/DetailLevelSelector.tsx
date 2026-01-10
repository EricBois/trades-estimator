"use client";

import { FileText, List, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import { DETAIL_LEVEL_INFO, type DetailLevel } from "@/lib/pdf";

interface DetailLevelSelectorProps {
  value: DetailLevel;
  onChange: (level: DetailLevel) => void;
  showExtraDetailed?: boolean; // Only show for projects with rooms
}

const LEVEL_ICONS = {
  simple: FileText,
  detailed: List,
  extra_detailed: LayoutList,
};

export function DetailLevelSelector({
  value,
  onChange,
  showExtraDetailed = true,
}: DetailLevelSelectorProps) {
  const levels = showExtraDetailed
    ? (["simple", "detailed", "extra_detailed"] as DetailLevel[])
    : (["simple", "detailed"] as DetailLevel[]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Detail Level
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {levels.map((level) => {
          const Icon = LEVEL_ICONS[level];
          const info = DETAIL_LEVEL_INFO[level];
          const isSelected = value === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isSelected ? "text-blue-600" : "text-gray-400"
                )}
              />
              <span className="text-sm font-medium">{info.label}</span>
              <span
                className={cn(
                  "text-xs",
                  isSelected ? "text-blue-600" : "text-gray-400"
                )}
              >
                {info.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
