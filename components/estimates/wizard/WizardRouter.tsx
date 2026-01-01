"use client";

import { useState } from "react";
import {
  Hammer,
  Home,
  Sparkles,
  Paintbrush,
  ArrowLeft,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { WIZARD_TRADE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { EstimateWizard } from "./EstimateWizard";
import { DrywallEstimateWizard } from "./trades/drywall";
import { ProjectWizard } from "./project";

// Icon mapping for trades
const TRADE_ICONS: Record<string, typeof Hammer> = {
  Hammer,
  Home,
  Sparkles,
  Paintbrush,
  Layers,
};

function getTradeIcon(iconName: string) {
  return TRADE_ICONS[iconName] ?? Home;
}

export function WizardRouter() {
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  // If multi_trade is selected, render the project wizard
  if (selectedTrade === "multi_trade") {
    return <ProjectWizard />;
  }

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
      {/* Navbar */}
      <Navbar showNavigation={false} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-8 px-4">
          <div className="w-full max-w-lg mx-auto">
            {/* Back link */}
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex items-center gap-2 mb-8",
                "text-gray-500 hover:text-gray-700",
                "text-sm font-medium transition-colors"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              What type of work?
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Select your trade to get started
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
                      "min-h-[140px] p-6",
                      "bg-white border-2 border-gray-200 rounded-2xl",
                      "hover:border-blue-500 hover:bg-blue-50 hover:shadow-md",
                      "active:scale-[0.98] transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    )}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
                      <Icon className="w-8 h-8 text-gray-600" />
                    </div>
                    <span className="text-base font-semibold text-gray-900">
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
