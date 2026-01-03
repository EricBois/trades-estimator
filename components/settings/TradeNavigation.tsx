"use client";

import { Hammer, Ruler, Paintbrush, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type TradeTab = "hanging" | "finishing" | "painting" | "framing";

interface Trade {
  id: TradeTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}

export const TRADES: Trade[] = [
  {
    id: "hanging",
    label: "Drywall Hanging",
    shortLabel: "Hanging",
    icon: Hammer,
    description: "Board installation",
  },
  {
    id: "finishing",
    label: "Drywall Finishing",
    shortLabel: "Finishing",
    icon: Ruler,
    description: "Taping & mudding",
  },
  {
    id: "painting",
    label: "Painting",
    shortLabel: "Painting",
    icon: Paintbrush,
    description: "Interior painting",
  },
  {
    id: "framing",
    label: "Framing",
    shortLabel: "Framing",
    icon: Home,
    description: "Coming soon",
  },
];

interface TradeNavigationProps {
  activeTrade: TradeTab;
  onTradeSelect: (trade: TradeTab) => void;
}

export function TradeNavigation({
  activeTrade,
  onTradeSelect,
}: TradeNavigationProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
      {TRADES.map((trade) => {
        const Icon = trade.icon;
        const isActive = activeTrade === trade.id;

        return (
          <button
            key={trade.id}
            type="button"
            onClick={() => onTradeSelect(trade.id)}
            className={cn(
              "flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 px-4 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:block">{trade.shortLabel}</span>
            <span className="block sm:hidden text-xs">{trade.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
