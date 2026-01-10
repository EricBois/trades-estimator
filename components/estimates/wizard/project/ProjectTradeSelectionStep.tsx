"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { z } from "zod";
import { Hammer, Sparkles, Paintbrush, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { TRADE_DISPLAY_INFO } from "@/lib/project/types";
import { StepHeader } from "@/components/ui/StepHeader";
import { ZodForm } from "@/components/ui/ZodForm";

const tradeSelectionSchema = z.object({
  projectName: z.string().optional(),
});

// Icon mapping
const TRADE_ICONS = {
  drywall_hanging: Hammer,
  drywall_finishing: Sparkles,
  painting: Paintbrush,
};

// Wrapper component that provides ZodForm context
export function ProjectTradeSelectionStep() {
  const { projectName } = useProjectEstimateContext();

  return (
    <ZodForm
      schema={tradeSelectionSchema}
      defaultValues={{ projectName }}
    >
      <ProjectTradeSelectionStepContent />
    </ZodForm>
  );
}

// Content component
function ProjectTradeSelectionStepContent() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    enabledTrades,
    toggleTrade,
    isTradeEnabled,
    projectName,
    setProjectName,
  } = useProjectEstimateContext();

  const canContinue = enabledTrades.length > 0;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: !canContinue,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, canContinue]);

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Select Trades"
        description="Choose which trades to include in this project estimate"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName === "New Project" ? "" : projectName}
              onChange={(e) => setProjectName(e.target.value || "New Project")}
              placeholder="e.g., Kitchen Renovation, Master Bedroom"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Trade Selection */}
          <div className="space-y-3">
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
      </div>
    </div>
  );
}
