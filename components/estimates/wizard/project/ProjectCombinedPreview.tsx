"use client";

import { useState, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import {
  Hammer,
  Sparkles,
  Paintbrush,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { ProjectTradeType, getTradeDisplayInfo } from "@/lib/project/types";
import { StepHeader } from "@/components/ui/StepHeader";

// Icon mapping
const TRADE_ICONS = {
  drywall_hanging: Hammer,
  drywall_finishing: Sparkles,
  painting: Paintbrush,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function TradeBreakdown({
  tradeType,
  isExpanded,
  onToggle,
  totalSqft,
  directHours,
  hourlyRate,
}: {
  tradeType: ProjectTradeType;
  isExpanded: boolean;
  onToggle: () => void;
  totalSqft: number;
  directHours: number;
  hourlyRate: number;
}) {
  const { tradeTotals } = useProjectEstimateContext();
  const totals = tradeTotals[tradeType];
  const displayInfo = getTradeDisplayInfo(tradeType);
  const Icon = TRADE_ICONS[tradeType];
  const [laborExpanded, setLaborExpanded] = useState(false);

  if (!totals) return null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{displayInfo.label}</div>
            <div className="text-sm text-gray-500">
              {totalSqft.toFixed(0)} sqft
              {directHours > 0 && ` + ${directHours} hrs`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              {formatCurrency(totals.total)}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-2">
          {totals.materialSubtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Materials</span>
              <span className="text-gray-900">
                {formatCurrency(totals.materialSubtotal)}
              </span>
            </div>
          )}
          {/* Labor row - expandable when there are direct hours */}
          {directHours > 0 ? (
            <div>
              <div
                className="flex justify-between text-sm cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-1"
                onClick={() => setLaborExpanded(!laborExpanded)}
              >
                <span className="text-gray-600 flex items-center gap-1">
                  Labor
                  {laborExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </span>
                <span className="text-gray-900">
                  {formatCurrency(totals.laborSubtotal)}
                </span>
              </div>
              {laborExpanded && (
                <div className="pl-4 space-y-1 mt-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Base labor</span>
                    <span>
                      {formatCurrency(totals.laborSubtotal - directHours * hourlyRate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{directHours} hrs × ${hourlyRate}/hr</span>
                    <span>{formatCurrency(directHours * hourlyRate)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Labor</span>
              <span className="text-gray-900">
                {formatCurrency(totals.laborSubtotal)}
              </span>
            </div>
          )}
          {totals.addonsSubtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Add-ons</span>
              <span className="text-gray-900">
                {formatCurrency(totals.addonsSubtotal)}
              </span>
            </div>
          )}
          {totals.complexityAdjustment !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Complexity ({totals.complexityMultiplier}x)
              </span>
              <span
                className={
                  totals.complexityAdjustment > 0
                    ? "text-gray-900"
                    : "text-green-600"
                }
              >
                {totals.complexityAdjustment > 0 ? "+" : ""}
                {formatCurrency(totals.complexityAdjustment)}
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between font-medium">
              <span className="text-gray-700">Trade Total</span>
              <span className="text-gray-900">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectCombinedPreview() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    enabledTrades,
    projectTotals,
    roomsHook,
    getTradeRoomViews,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
  } = useProjectEstimateContext();

  // Get hours and hourly rate for each trade
  const getTradeHours = (tradeType: ProjectTradeType) => {
    switch (tradeType) {
      case "drywall_hanging":
        return {
          directHours: hangingEstimate.directHours,
          hourlyRate: hangingEstimate.hourlyRate,
        };
      case "drywall_finishing":
        return {
          directHours: finishingEstimate.directHours,
          hourlyRate: finishingEstimate.hourlyRate,
        };
      case "painting":
        return {
          directHours: paintingEstimate.directHours,
          hourlyRate: paintingEstimate.hourlyRate,
        };
    }
  };

  const [expandedTrade, setExpandedTrade] = useState<ProjectTradeType | null>(
    null
  );

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue to Send",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Project Summary"
        description="Review all trades and pricing before sending"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Project scope summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Project Scope
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {roomsHook.inputMode === "rooms"
                    ? roomsHook.rooms.length
                    : "—"}
                </div>
                <div className="text-xs text-gray-500">
                  {roomsHook.inputMode === "rooms" ? "Rooms" : "Manual"}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {roomsHook.totalWallSqft.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Wall sqft</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {roomsHook.totalCeilingSqft.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Ceiling sqft</div>
              </div>
            </div>
          </div>

          {/* Trade breakdowns */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
              Trade Breakdown
            </div>
            {enabledTrades.map((tradeType) => {
              // Calculate trade-specific sqft based on room overrides
              const tradeViews = getTradeRoomViews(tradeType);
              const tradeSqft =
                roomsHook.inputMode === "rooms" && tradeViews.length > 0
                  ? tradeViews.reduce(
                      (sum, r) =>
                        sum +
                        (tradeType === "drywall_hanging"
                          ? r.effectiveGrossTotalSqft
                          : r.effectiveTotalSqft),
                      0
                    )
                  : roomsHook.totalSqft;

              const { directHours, hourlyRate } = getTradeHours(tradeType);

              return (
                <TradeBreakdown
                  key={tradeType}
                  tradeType={tradeType}
                  isExpanded={expandedTrade === tradeType}
                  onToggle={() =>
                    setExpandedTrade(
                      expandedTrade === tradeType ? null : tradeType
                    )
                  }
                  totalSqft={tradeSqft}
                  directHours={directHours}
                  hourlyRate={hourlyRate}
                />
              );
            })}
          </div>

          {/* Combined total */}
          <div className="bg-blue-600 text-white rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-blue-100">Project Total</div>
                <div className="text-xs text-blue-200 mt-1">
                  {enabledTrades.length} trade
                  {enabledTrades.length > 1 ? "s" : ""} included
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(projectTotals.combinedTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
