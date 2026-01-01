"use client";

import { useWizard } from "react-use-wizard";
import { Hammer, Sparkles, Paintbrush, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { ProjectTradeType, TRADE_DISPLAY_INFO } from "@/lib/project/types";
import { StepHeader } from "@/components/ui/StepHeader";
import { WizardButton } from "@/components/ui/WizardButton";

// Icon mapping
const TRADE_ICONS = {
  drywall_hanging: Hammer,
  drywall_finishing: Sparkles,
  painting: Paintbrush,
};

export function ProjectTradeSelectionStep() {
  const { nextStep } = useWizard();
  const { enabledTrades, toggleTrade, isTradeEnabled } =
    useProjectEstimateContext();

  const canContinue = enabledTrades.length > 0;

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Select Trades"
        description="Choose which trades to include in this project estimate"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-3">
          {TRADE_DISPLAY_INFO.map((trade) => {
            const Icon = TRADE_ICONS[trade.tradeType];
            const isEnabled = isTradeEnabled(trade.tradeType);

            return (
              <button
                key={trade.tradeType}
                onClick={() => toggleTrade(trade.tradeType)}
                className={cn(
                  "w-full flex items-center gap-4 p-4",
                  "border-2 rounded-xl transition-all",
                  isEnabled
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isEnabled
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">
                    {trade.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trade.tradeType === "drywall_hanging" &&
                      "Install drywall sheets on walls and ceilings"}
                    {trade.tradeType === "drywall_finishing" &&
                      "Tape, mud, and finish drywall seams"}
                    {trade.tradeType === "painting" &&
                      "Prime and paint walls and ceilings"}
                  </div>
                </div>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isEnabled
                      ? "bg-blue-500 text-white"
                      : "border-2 border-gray-300"
                  )}
                >
                  {isEnabled && <Check className="w-5 h-5" />}
                </div>
              </button>
            );
          })}

          <p className="text-sm text-gray-500 text-center mt-4">
            Select at least one trade to continue
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <WizardButton
          onClick={nextStep}
          disabled={!canContinue}
          className="w-full max-w-lg mx-auto"
        >
          Continue
        </WizardButton>
      </div>
    </div>
  );
}
