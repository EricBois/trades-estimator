"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { z } from "zod";
import { Clock, Minus, Plus } from "lucide-react";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { ProjectTradeType, getTradeDisplayInfo } from "@/lib/project/types";
import { cn } from "@/lib/utils";
import { StepHeader } from "@/components/ui/StepHeader";
import { ZodForm } from "@/components/ui/ZodForm";

const tradeHoursSchema = z.object({
  hours: z.number().min(0).optional(),
});

const QUICK_HOURS = [1, 2, 4, 8];

// Wrapper component that provides ZodForm context
export function TradeHoursStep({ tradeType }: { tradeType: ProjectTradeType }) {
  return (
    <ZodForm
      schema={tradeHoursSchema}
      defaultValues={{ hours: 0 }}
    >
      <TradeHoursStepContent tradeType={tradeType} />
    </ZodForm>
  );
}

// Content component
function TradeHoursStepContent({ tradeType }: { tradeType: ProjectTradeType }) {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { hangingEstimate, finishingEstimate, paintingEstimate } =
    useProjectEstimateContext();

  const tradeInfo = getTradeDisplayInfo(tradeType);

  // Get the appropriate estimate hook based on trade type
  const getTradeEstimate = () => {
    switch (tradeType) {
      case "drywall_hanging":
        return hangingEstimate;
      case "drywall_finishing":
        return finishingEstimate;
      case "painting":
        return paintingEstimate;
      default:
        return hangingEstimate;
    }
  };

  const estimate = getTradeEstimate();
  const hours = estimate.directHours;
  const hourlyRate = estimate.hourlyRate;
  const setHours = estimate.setDirectHours;

  // Configure footer - this step is optional, 0 hours is OK
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: false,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  const handleIncrement = () => setHours(hours + 1);
  const handleDecrement = () => setHours(Math.max(0, hours - 1));
  const handleQuickAdd = (amount: number) => setHours(hours + amount);

  const totalCost = hours * hourlyRate;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepHeader
        title={`${tradeInfo.label} Hours`}
        description={`Enter the estimated hours for ${tradeInfo.label.toLowerCase()}`}
      />

      <div className="space-y-6">
        {/* Hours Input */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleDecrement}
              disabled={hours <= 0}
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
                hours > 0
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              )}
            >
              <Minus className="w-6 h-6" />
            </button>

            <div className="text-center">
              <input
                type="number"
                value={hours || ""}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-24 text-center text-4xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                min="0"
                step="0.5"
              />
              <div className="text-sm text-gray-500 mt-1">hours</div>
            </div>

            <button
              onClick={handleIncrement}
              className="w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Add
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_HOURS.map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickAdd(amount)}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-all"
              >
                +{amount} hr{amount !== 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Rate Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Hourly Rate</span>
            <span className="font-medium text-gray-900">
              ${hourlyRate.toFixed(2)}/hr
            </span>
          </div>
        </div>

        {/* Total Preview */}
        {hours > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">
                {tradeInfo.label} Labor Estimate
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {hours} hrs
                </div>
                <div className="text-xs text-orange-600">Total Hours</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-900">
                  ${totalCost.toFixed(0)}
                </div>
                <div className="text-xs text-orange-600">Labor Cost</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
