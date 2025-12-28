"use client";

import { Clock, DollarSign, Check, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template, TemplateCustomization } from "@/hooks";
import { TRADE_TYPES } from "@/lib/constants";

interface OnboardingTemplateCardProps {
  template: Template;
  isSelected: boolean;
  customizations: TemplateCustomization | null;
  onToggleSelect: () => void;
  onCustomize: () => void;
}

export function OnboardingTemplateCard({
  template,
  isSelected,
  customizations,
  onToggleSelect,
  onCustomize,
}: OnboardingTemplateCardProps) {
  const formatTradeType = (trade: string) => {
    const found = TRADE_TYPES.find((t) => t.value === trade);
    return found?.label ?? trade.charAt(0).toUpperCase() + trade.slice(1);
  };

  // Use customized values if available, otherwise use original template values
  const displayName = customizations?.templateName ?? template.templateName;
  const displayTradeType = customizations?.tradeType ?? template.tradeType;
  const displayDescription = customizations?.description !== undefined
    ? customizations.description
    : template.description;
  const displayLaborHours = customizations?.baseLaborHours ?? template.baseLaborHours;
  const displayMaterialCost = customizations?.baseMaterialCost ?? template.baseMaterialCost;
  const isCustomized = !!customizations;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border-2 p-5 transition-all cursor-pointer",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border-gray-200 hover:border-gray-300"
      )}
      onClick={onToggleSelect}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div
          className={cn(
            "w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5",
            isSelected
              ? "bg-blue-600 border-blue-600"
              : "border-gray-300 bg-white"
          )}
        >
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              {displayName}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {formatTradeType(displayTradeType)}
            </span>
            {isCustomized && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                Customized
              </span>
            )}
          </div>
          {displayDescription && (
            <p className="text-sm text-gray-500 mb-3">{displayDescription}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {displayLaborHours} hrs base
            </span>
            <span className="inline-flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              ${displayMaterialCost} materials
            </span>
          </div>
        </div>

        {/* Customize Button */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCustomize();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
          >
            <Settings className="w-4 h-4" />
            Customize
          </button>
        )}
      </div>
    </div>
  );
}
