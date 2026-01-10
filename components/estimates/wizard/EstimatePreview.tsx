"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { Calculator, Edit2 } from "lucide-react";
import { useWizardData } from "./WizardDataContext";
import { useWizardFooter } from "./WizardFooterContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateEstimateRange,
  formatCurrency,
} from "@/lib/estimateCalculations";
import { WIZARD_TRADE_TYPES, WIZARD_COMPLEXITY_LEVELS } from "@/lib/constants";

export function EstimatePreview() {
  const { nextStep, goToStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { tradeType, template, parameters, complexity } = useWizardData();
  const { profile } = useAuth();

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Send to Homeowner",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  // Calculate estimate range
  const estimateRange = useMemo(() => {
    return calculateEstimateRange({
      template,
      parameters,
      complexity,
      hourlyRate: profile?.hourly_rate ?? 75,
    });
  }, [template, parameters, complexity, profile?.hourly_rate]);

  // Get display values
  const tradeLabel =
    WIZARD_TRADE_TYPES.find((t) => t.value === tradeType)?.label ?? tradeType;
  const complexityLabel =
    WIZARD_COMPLEXITY_LEVELS.find((c) => c.value === complexity)?.label ??
    complexity;

  // Format parameters for display
  const parameterSummary = useMemo(() => {
    return Object.entries(parameters)
      .filter(([, value]) => value !== "" && value !== undefined)
      .map(([key, value]) => {
        // Format key from snake_case to Title Case
        const label = key
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return `${label}: ${value}`;
      })
      .join(" • ");
  }, [parameters]);

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Your Estimate
      </h1>

      {/* Big Price Display */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        {estimateRange ? (
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-900">
              ${formatCurrency(estimateRange.total)}
            </div>
            <p className="text-blue-600 mt-2">Estimate Total</p>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Unable to calculate estimate
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-6">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-500">Trade</p>
            <p className="font-medium text-gray-900">{tradeLabel}</p>
          </div>
          <button
            onClick={() => goToStep(1)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-500">Template</p>
            <p className="font-medium text-gray-900">
              {template?.templateName ?? "None"}
            </p>
          </div>
          <button
            onClick={() => goToStep(2)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {parameterSummary && (
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 min-w-0 mr-2">
              <p className="text-sm text-gray-500">Details</p>
              <p className="font-medium text-gray-900 truncate">
                {parameterSummary}
              </p>
            </div>
            <button
              onClick={() => goToStep(3)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 flex-shrink-0"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-gray-500">Complexity</p>
            <p className="font-medium text-gray-900">{complexityLabel}</p>
          </div>
          <button
            onClick={() => goToStep(4)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
