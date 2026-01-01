"use client";

import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialToggleProps {
  included: boolean;
  onChange: (included: boolean) => void;
  label?: string;
  className?: string;
}

export function MaterialToggle({
  included,
  onChange,
  label = "Include Materials",
  className,
}: MaterialToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!included)}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm",
        included
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-gray-200 bg-gray-50 text-gray-500",
        className
      )}
    >
      <Package className="w-4 h-4" />
      <span className="font-medium">{label}</span>
      <div
        className={cn(
          "w-8 h-5 rounded-full transition-colors relative",
          included ? "bg-blue-500" : "bg-gray-300"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
            included ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </div>
    </button>
  );
}
