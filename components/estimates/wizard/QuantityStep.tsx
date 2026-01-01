"use client";

import { useMemo, useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { Plus, Minus } from "lucide-react";
import { useWizardData } from "./WizardDataContext";
import { useWizardFooter } from "./WizardFooterContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateEstimateRange,
  formatCurrency,
} from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface RequiredField {
  type: "text" | "number" | "select" | "textarea";
  label: string;
  placeholder?: string;
  options?: SelectOption[] | string[];
  min?: number;
  max?: number;
  unit?: string;
}

function normalizeOptions(
  options: SelectOption[] | string[] | undefined
): SelectOption[] {
  if (!options || !Array.isArray(options)) return [];
  return options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });
}

export function QuantityStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const { template, parameters, setParameter, complexity } = useWizardData();
  const { profile } = useAuth();

  // Configure footer
  const handleContinue = useCallback(() => nextStep(), [nextStep]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  // Parse required fields from template
  const requiredFields = useMemo(() => {
    if (!template?.requiredFields) return [];
    const fields = template.requiredFields as Record<string, RequiredField>;
    return Object.entries(fields).map(([key, field]) => ({
      key,
      ...field,
    }));
  }, [template]);

  // Calculate estimate range
  const estimateRange = useMemo(() => {
    return calculateEstimateRange({
      template,
      parameters,
      complexity,
      hourlyRate: profile?.hourly_rate ?? 75,
    });
  }, [template, parameters, complexity, profile?.hourly_rate]);

  const handleNumberChange = (
    key: string,
    delta: number,
    min?: number,
    max?: number
  ) => {
    const currentValue = (parameters[key] as number) || 0;
    let newValue = currentValue + delta;
    if (min !== undefined) newValue = Math.max(min, newValue);
    if (max !== undefined) newValue = Math.min(max, newValue);
    setParameter(key, newValue);
  };

  // No required fields - show simple continue
  if (requiredFields.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Ready to continue
        </h1>
        <p className="text-gray-500 text-center mb-8">
          No additional details needed for this template
        </p>

        {estimateRange && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 mb-6 text-center">
            <span className="text-sm text-blue-600">Estimated: </span>
            <span className="text-xl font-bold text-blue-900">
              ${formatCurrency(estimateRange.total)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Quick details
      </h1>
      <p className="text-gray-500 text-center mb-8">Adjust the job specifics</p>

      <div className="space-y-6">
        {requiredFields.map((field) => (
          <div
            key={field.key}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <label className="block text-base font-medium text-gray-700 mb-3">
              {field.label}
              {field.unit && (
                <span className="text-gray-400 font-normal">
                  {" "}
                  ({field.unit})
                </span>
              )}
            </label>

            {field.type === "number" ? (
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <button
                  onClick={() =>
                    handleNumberChange(field.key, -1, field.min, field.max)
                  }
                  className={cn(
                    "w-14 h-14 sm:w-16 sm:h-16 rounded-xl",
                    "bg-gray-100 hover:bg-gray-200",
                    "flex items-center justify-center",
                    "active:scale-95 transition-all cursor-pointer"
                  )}
                >
                  <Minus className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600" />
                </button>
                <input
                  type="number"
                  value={parameters[field.key] ?? field.min ?? 0}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      let newVal = val;
                      if (field.min !== undefined)
                        newVal = Math.max(field.min, newVal);
                      if (field.max !== undefined)
                        newVal = Math.min(field.max, newVal);
                      setParameter(field.key, newVal);
                    }
                  }}
                  min={field.min}
                  max={field.max}
                  className={cn(
                    "w-28 sm:w-32 text-center text-3xl sm:text-4xl font-bold text-gray-900",
                    "border-2 border-gray-200 rounded-xl py-3",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  )}
                />
                <button
                  onClick={() =>
                    handleNumberChange(field.key, 1, field.min, field.max)
                  }
                  className={cn(
                    "w-14 h-14 sm:w-16 sm:h-16 rounded-xl",
                    "bg-blue-100 hover:bg-blue-200",
                    "flex items-center justify-center",
                    "active:scale-95 transition-all cursor-pointer"
                  )}
                >
                  <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </button>
              </div>
            ) : field.type === "select" ? (
              <div className="grid grid-cols-2 gap-2">
                {normalizeOptions(field.options).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setParameter(field.key, opt.value)}
                    className={cn(
                      "min-h-[50px] px-4 py-3 rounded-lg border-2 text-base",
                      "transition-all",
                      parameters[field.key] === opt.value
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                value={String(parameters[field.key] ?? "")}
                onChange={(e) => setParameter(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className={cn(
                  "w-full px-4 py-3 border border-gray-300 rounded-lg",
                  "text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                )}
              />
            ) : (
              <input
                type="text"
                value={String(parameters[field.key] ?? "")}
                onChange={(e) => setParameter(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={cn(
                  "w-full min-h-[50px] px-4 py-3 border border-gray-300 rounded-lg",
                  "text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Price preview */}
      {estimateRange && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-4 text-center">
          <span className="text-sm text-blue-600">Estimated: </span>
          <span className="text-xl font-bold text-blue-900">
            ${formatCurrency(estimateRange.total)}
          </span>
        </div>
      )}
    </div>
  );
}
