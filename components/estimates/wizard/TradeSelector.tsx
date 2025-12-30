"use client";

import { useWizard } from "react-use-wizard";
import { Hammer, Home, Sparkles, Paintbrush } from "lucide-react";
import { useWizardData } from "./WizardDataContext";
import { WIZARD_TRADE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TRADE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  framing: Hammer,
  drywall: Home,
  drywall_finishing: Sparkles,
  painting: Paintbrush,
};

export function TradeSelector() {
  const { nextStep } = useWizard();
  const { updateData } = useWizardData();

  const handleSelect = (tradeValue: string) => {
    updateData({ tradeType: tradeValue });
    nextStep();
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        What are you estimating?
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Select the type of work
      </p>

      <div className="grid grid-cols-2 gap-4">
        {WIZARD_TRADE_TYPES.map((trade) => {
          const Icon = TRADE_ICONS[trade.value];
          return (
            <button
              key={trade.value}
              onClick={() => handleSelect(trade.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-3",
                "min-h-[120px] p-6",
                "bg-white border-2 border-gray-200 rounded-xl",
                "hover:border-blue-500 hover:bg-blue-50",
                "active:scale-[0.98] transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              {Icon && <Icon className="w-10 h-10 text-blue-600" />}
              <span className="text-lg font-medium text-gray-900">
                {trade.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
