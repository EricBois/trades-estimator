"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { z } from "zod";
import { Layers, FileText } from "lucide-react";
import { useDrywallEstimateSafe } from "./DrywallEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { DRYWALL_FINISH_LEVELS } from "@/lib/trades/drywallFinishing/constants";
import {
  DrywallFinishLevel,
  UseDrywallFinishingEstimateReturn,
} from "@/lib/trades/drywallFinishing/types";
import { cn } from "@/lib/utils";
import { ZodForm } from "@/components/ui/ZodForm";

const finishLevelSchema = z.object({
  estimateName: z.string().optional(),
});

interface DrywallFinishLevelStepProps {
  finishingEstimate?: UseDrywallFinishingEstimateReturn;
  estimateName?: string;
  onEstimateNameChange?: (name: string) => void;
}

// Wrapper component that provides ZodForm context
export function DrywallFinishLevelStep({
  finishingEstimate,
  estimateName = "",
  onEstimateNameChange,
}: DrywallFinishLevelStepProps) {
  return (
    <ZodForm schema={finishLevelSchema} defaultValues={{ estimateName }}>
      <DrywallFinishLevelStepContent
        finishingEstimate={finishingEstimate}
        estimateName={estimateName}
        onEstimateNameChange={onEstimateNameChange}
      />
    </ZodForm>
  );
}

// Content component
function DrywallFinishLevelStepContent({
  finishingEstimate,
  estimateName = "",
  onEstimateNameChange,
}: DrywallFinishLevelStepProps) {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();

  // Use prop if provided, otherwise fall back to context (backwards compatible)
  const contextEstimate = useDrywallEstimateSafe();
  const estimate = finishingEstimate ?? contextEstimate;

  if (!estimate) {
    throw new Error(
      "DrywallFinishLevelStep requires either finishingEstimate prop or DrywallEstimateProvider"
    );
  }

  const { finishLevel, setFinishLevel } = estimate;

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
      disabled: !finishLevel,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue, finishLevel]);

  const handleSelect = (level: DrywallFinishLevel) => {
    setFinishLevel(level);
    nextStep();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      {/* Estimate Name Input */}
      {onEstimateNameChange && (
        <div className="mb-8">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Estimate Name (optional)
          </label>
          <input
            type="text"
            value={estimateName}
            onChange={(e) => onEstimateNameChange(e.target.value)}
            placeholder="e.g., Smith Kitchen Remodel"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1.5 text-sm text-gray-500">
            Give your estimate a name to find it later
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Finish Level
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Select the drywall finish quality
      </p>

      <div className="space-y-3">
        {DRYWALL_FINISH_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => handleSelect(level.value as DrywallFinishLevel)}
            className={cn(
              "w-full flex items-start gap-4 p-5 sm:p-6",
              "bg-white border-2 rounded-xl",
              "hover:border-blue-500 hover:bg-blue-50",
              "active:scale-[0.99] transition-all cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "text-left",
              finishLevel === level.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                finishLevel === level.value ? "bg-blue-100" : "bg-gray-100"
              )}
            >
              <Layers
                className={cn(
                  "w-6 h-6",
                  finishLevel === level.value
                    ? "text-blue-600"
                    : "text-gray-500"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900">
                {level.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{level.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                ~${level.sqftRate.toFixed(2)}/sqft base rate
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
