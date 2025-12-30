"use client";

import Link from "next/link";
import { Plus, ChevronRight, FileText } from "lucide-react";
import type { Estimate } from "@/hooks";
import { WIZARD_TRADE_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

interface QuickTemplatesSectionProps {
  recentEstimates: Estimate[];
}

export function QuickTemplatesSection({ recentEstimates }: QuickTemplatesSectionProps) {
  // Get unique recent templates (by template type)
  const uniqueTemplates = recentEstimates
    .filter((e, index, self) =>
      index === self.findIndex((t) => t.templateType === e.templateType)
    )
    .slice(0, 4);

  const getTradeLabel = (tradeType: string) => {
    return WIZARD_TRADE_TYPES.find((t) => t.value === tradeType)?.label ?? tradeType;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Quick Estimates</h2>
        <Link
          href="/estimates/new"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          New <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* New Estimate Button - Large & Prominent */}
      <Link
        href="/estimates/new"
        className={cn(
          "flex items-center justify-center gap-3 w-full",
          "min-h-[80px] mb-4",
          "bg-blue-600 hover:bg-blue-700 rounded-xl",
          "text-white font-medium text-lg",
          "transition-colors active:scale-[0.98]"
        )}
      >
        <Plus className="w-6 h-6" />
        New Estimate
      </Link>

      {/* Recent Templates - Horizontal scroll on mobile */}
      {uniqueTemplates.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-3">Recent jobs</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {uniqueTemplates.map((estimate) => (
              <Link
                key={estimate.id}
                href={`/estimates/new?template=${estimate.templateType}`}
                className={cn(
                  "flex-shrink-0 snap-start",
                  "w-[160px] p-4",
                  "bg-gray-50 hover:bg-gray-100 rounded-xl",
                  "border border-gray-200 hover:border-gray-300",
                  "transition-all"
                )}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm truncate">
                  {getTradeLabel(estimate.templateType)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ${formatCurrency(estimate.rangeLow)} - ${formatCurrency(estimate.rangeHigh)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}

      {uniqueTemplates.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">
            Create your first estimate to see quick templates here
          </p>
        </div>
      )}
    </div>
  );
}
