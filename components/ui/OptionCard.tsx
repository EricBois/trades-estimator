"use client";

import { cn } from "@/lib/utils";

interface OptionCardProps {
  icon?: React.ElementType;
  label: string;
  description?: string;
  badge?: string;
  isSelected: boolean;
  onClick: () => void;
  variant?: "card" | "compact";
  className?: string;
  rightContent?: React.ReactNode;
}

export function OptionCard({
  icon: Icon,
  label,
  description,
  badge,
  isSelected,
  onClick,
  variant = "card",
  className,
  rightContent,
}: OptionCardProps) {
  if (variant === "compact") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 p-3",
          "border-2 rounded-xl",
          "transition-all active:scale-[0.98]",
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300",
          className
        )}
      >
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              isSelected ? "bg-blue-600" : "bg-gray-100"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                isSelected ? "text-white" : "text-gray-600"
              )}
            />
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-medium text-sm",
                isSelected ? "text-blue-900" : "text-gray-900"
              )}
            >
              {label}
            </span>
            {badge && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <div className="text-xs text-gray-500">{description}</div>
          )}
        </div>
        {rightContent}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-4 p-5",
        "bg-white border-2 rounded-xl",
        "transition-all active:scale-[0.98]",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
            isSelected ? "bg-blue-600" : "bg-gray-100"
          )}
        >
          <Icon
            className={cn(
              "w-7 h-7",
              isSelected ? "text-white" : "text-gray-600"
            )}
          />
        </div>
      )}
      <div className="text-left flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-semibold text-lg",
              isSelected ? "text-blue-900" : "text-gray-900"
            )}
          >
            {label}
          </span>
          {badge && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
      </div>
      {rightContent}
    </button>
  );
}
