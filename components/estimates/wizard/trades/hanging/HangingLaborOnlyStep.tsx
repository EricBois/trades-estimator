"use client";

import { useEffect, useCallback } from "react";
import { useWizard } from "react-use-wizard";
import { z } from "zod";
import { Minus, Plus, Hammer, Clock } from "lucide-react";
import { useHangingEstimate } from "./HangingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { ZodForm } from "@/components/ui/ZodForm";

const laborOnlyStepSchema = z.object({
  directSqft: z.number().min(0).optional(),
  directHours: z.number().min(0).optional(),
});

// Wrapper component that provides ZodForm context
export function HangingLaborOnlyStep() {
  const { directSqft, directHours } = useHangingEstimate();

  return (
    <ZodForm
      schema={laborOnlyStepSchema}
      defaultValues={{ directSqft, directHours }}
    >
      <HangingLaborOnlyStepContent />
    </ZodForm>
  );
}

// Content component
function HangingLaborOnlyStepContent() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    directSqft,
    setDirectSqft,
    directHours,
    setDirectHours,
    totals,
    defaultRates,
    hourlyRate,
  } = useHangingEstimate();

  const canContinue = directSqft > 0 || directHours > 0;
  const laborRate = defaultRates.labor_per_sqft ?? 0.35;

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

  const handleSqftChange = (value: number) => {
    if (value >= 0) {
      setDirectSqft(value);
    }
  };

  const handleHoursChange = (value: number) => {
    if (value >= 0) {
      setDirectHours(value);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-2xl flex items-center justify-center">
          <Hammer className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Labor Only Estimate
        </h1>
        <p className="text-gray-500">
          Client supplies materials - enter square footage and/or hours
        </p>
      </div>

      {/* Rate info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-amber-800">Labor Rate (sqft)</span>
          <span className="font-semibold text-amber-900">
            ${laborRate.toFixed(2)}/sqft
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-amber-800">Hourly Rate</span>
          <span className="font-semibold text-amber-900">
            ${hourlyRate.toFixed(2)}/hr
          </span>
        </div>
      </div>

      {/* Sqft input */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
          Square Footage
        </label>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleSqftChange(Math.max(0, directSqft - 100))}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
            disabled={directSqft < 100}
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>

          <input
            type="number"
            value={directSqft || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              handleSqftChange(isNaN(val) ? 0 : val);
            }}
            className="w-32 text-center text-3xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
            step="10"
          />

          <button
            onClick={() => handleSqftChange(directSqft + 100)}
            className="w-12 h-12 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-2">sqft</p>

        {/* Quick add buttons */}
        <div className="flex justify-center gap-2 mt-4">
          {[500, 1000, 2000].map((amount) => (
            <button
              key={amount}
              onClick={() => setDirectSqft(amount)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                directSqft === amount
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {amount} sqft
            </button>
          ))}
        </div>
      </div>

      {/* Hours input */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">
            Additional Hours
          </label>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleHoursChange(Math.max(0, directHours - 1))}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95 transition-all"
            disabled={directHours < 1}
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>

          <input
            type="number"
            value={directHours || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              handleHoursChange(isNaN(val) ? 0 : val);
            }}
            className="w-32 text-center text-3xl font-bold text-gray-900 border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
            step="0.5"
          />

          <button
            onClick={() => handleHoursChange(directHours + 1)}
            className="w-12 h-12 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-2">hours</p>

        {/* Quick add buttons */}
        <div className="flex justify-center gap-2 mt-4">
          {[2, 4, 8].map((amount) => (
            <button
              key={amount}
              onClick={() => setDirectHours(amount)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                directHours === amount
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {amount} hrs
            </button>
          ))}
        </div>
      </div>

      {/* Estimate preview */}
      {(directSqft > 0 || directHours > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-700 font-medium">Labor Estimate</span>
            <span className="text-2xl font-bold text-blue-900">
              ${formatCurrency(totals.laborSubtotal)}
            </span>
          </div>
          <div className="space-y-1 text-sm text-blue-600">
            {directSqft > 0 && (
              <p>
                {directSqft} sqft × ${laborRate.toFixed(2)}/sqft = $
                {formatCurrency(directSqft * laborRate)}
              </p>
            )}
            {directHours > 0 && (
              <p>
                {directHours} hrs × ${hourlyRate.toFixed(2)}/hr = $
                {formatCurrency(directHours * hourlyRate)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
