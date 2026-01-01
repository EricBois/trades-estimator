"use client";

import { useWizard } from "react-use-wizard";
import { ChevronRight, Minus, Plus, Hammer } from "lucide-react";
import { useHangingEstimate } from "./HangingEstimateContext";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

export function HangingLaborOnlyStep() {
  const { nextStep } = useWizard();
  const { directSqft, setDirectSqft, totals, defaultRates } =
    useHangingEstimate();

  const handleSqftChange = (value: number) => {
    if (value >= 0) {
      setDirectSqft(value);
    }
  };

  const handleIncrement = (amount: number) => {
    setDirectSqft(directSqft + amount);
  };

  const handleDecrement = (amount: number) => {
    const newValue = directSqft - amount;
    if (newValue >= 0) {
      setDirectSqft(newValue);
    }
  };

  const handleContinue = () => {
    nextStep();
  };

  const canContinue = directSqft > 0;
  const laborRate = defaultRates.labor_per_sqft ?? 0.35;

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
          Client supplies materials - enter total square footage
        </p>
      </div>

      {/* Labor rate info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-amber-800">Labor Rate</span>
          <span className="font-semibold text-amber-900">
            ${laborRate.toFixed(2)}/sqft
          </span>
        </div>
      </div>

      {/* Sqft input */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
          Total Square Footage
        </label>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleDecrement(100)}
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
            onClick={() => handleIncrement(100)}
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

      {/* Estimate preview */}
      {directSqft > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700">Labor Estimate</span>
            <span className="text-2xl font-bold text-blue-900">
              ${formatCurrency(totals.laborSubtotal)}
            </span>
          </div>
          <p className="text-sm text-blue-600">
            {directSqft} sqft x ${laborRate.toFixed(2)}/sqft
          </p>
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className={cn(
          "w-full flex items-center justify-center gap-2",
          "min-h-[60px] px-6",
          "rounded-xl transition-all font-medium text-lg",
          canContinue
            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        Continue
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
