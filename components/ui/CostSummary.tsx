"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/estimateCalculations";

interface CostSummaryItem {
  label: string;
  value: number | string;
  prefix?: "+" | "-";
  highlight?: boolean;
}

interface CostSummaryProps {
  items: CostSummaryItem[];
  total?: {
    label: string;
    value: number;
  };
  variant?: "default" | "blue" | "green" | "orange";
  className?: string;
}

const variantStyles = {
  default: {
    container: "bg-gray-50 border border-gray-200",
    label: "text-gray-600",
    value: "text-gray-900",
    totalLabel: "text-gray-700",
    totalValue: "text-gray-900",
    divider: "border-gray-200",
  },
  blue: {
    container: "bg-blue-50 border border-blue-200",
    label: "text-blue-600",
    value: "text-blue-900",
    totalLabel: "text-blue-600",
    totalValue: "text-blue-900",
    divider: "border-blue-200",
  },
  green: {
    container: "bg-green-50 border border-green-200",
    label: "text-green-600",
    value: "text-green-900",
    totalLabel: "text-green-600",
    totalValue: "text-green-900",
    divider: "border-green-200",
  },
  orange: {
    container: "bg-orange-50 border border-orange-200",
    label: "text-orange-600",
    value: "text-orange-900",
    totalLabel: "text-orange-600",
    totalValue: "text-orange-900",
    divider: "border-orange-200",
  },
};

export function CostSummary({
  items,
  total,
  variant = "default",
  className,
}: CostSummaryProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("rounded-xl p-4", styles.container, className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex justify-between items-center",
            index > 0 && "mt-2"
          )}
        >
          <span className={cn("text-sm", styles.label)}>{item.label}</span>
          <span
            className={cn(
              item.highlight ? "font-bold" : "font-medium",
              styles.value
            )}
          >
            {item.prefix}
            {typeof item.value === "number"
              ? `$${formatCurrency(item.value)}`
              : item.value}
          </span>
        </div>
      ))}

      {total && (
        <>
          <div className={cn("border-t pt-2 mt-2", styles.divider)}>
            <div className="flex justify-between items-center">
              <span className={cn("font-medium", styles.totalLabel)}>
                {total.label}
              </span>
              <span className={cn("text-2xl font-bold", styles.totalValue)}>
                ${formatCurrency(total.value)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
