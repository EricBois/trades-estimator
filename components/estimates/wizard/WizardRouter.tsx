"use client";

import { useState } from "react";
import { ArrowLeft, X, Hammer, Home, Sparkles, Paintbrush } from "lucide-react";
import Link from "next/link";
import { WIZARD_TRADE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { EstimateWizard } from "./EstimateWizard";
import { DrywallEstimateWizard } from "./trades/drywall";

// Icon mapping for trades
const TRADE_ICONS: Record<string, typeof Hammer> = {
  Hammer,
  Home,
  Sparkles,
  Paintbrush,
};

function getTradeIcon(iconName: string) {
  return TRADE_ICONS[iconName] ?? Home;
}

export function WizardRouter() {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  // If drywall_finishing is selected, render the drywall wizard
  if (selectedTrade === "drywall_finishing") {
    return <DrywallEstimateWizard />;
  }

  // If another trade is selected, render the standard wizard
  // Note: For now, other trades still use the standard wizard flow
  // We pass the pre-selected trade to skip the trade selection step
  if (selectedTrade) {
    return <EstimateWizard initialTrade={selectedTrade} />;
  }

  // Show trade selector
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Close</span>
          </Link>
          <span className="text-sm text-gray-500">New Estimate</span>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-8 px-4">
          <div className="w-full max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              What type of work?
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Select your trade
            </p>

            <div className="grid grid-cols-2 gap-4">
              {WIZARD_TRADE_TYPES.map((trade) => {
                const Icon = getTradeIcon(trade.icon);

                return (
                  <button
                    key={trade.value}
                    onClick={() => setSelectedTrade(trade.value)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3",
                      "min-h-[120px] p-6",
                      "bg-white border-2 border-gray-200 rounded-xl",
                      "hover:border-blue-500 hover:bg-blue-50",
                      "active:scale-[0.98] transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    )}
                  >
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-gray-600" />
                    </div>
                    <span className="text-base font-medium text-gray-900">
                      {trade.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
