"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDrywallHangingEstimate } from "@/hooks/trades/useDrywallHangingEstimate";
import { UseDrywallHangingEstimateReturn } from "@/lib/trades/drywallHanging/types";

const HangingEstimateContext =
  createContext<UseDrywallHangingEstimateReturn | null>(null);

export function HangingEstimateProvider({ children }: { children: ReactNode }) {
  const estimate = useDrywallHangingEstimate();

  return (
    <HangingEstimateContext.Provider value={estimate}>
      {children}
    </HangingEstimateContext.Provider>
  );
}

export function useHangingEstimate() {
  const context = useContext(HangingEstimateContext);
  if (!context) {
    throw new Error(
      "useHangingEstimate must be used within HangingEstimateProvider"
    );
  }
  return context;
}

// Safe version that returns null instead of throwing (for reusable components)
export function useHangingEstimateSafe() {
  return useContext(HangingEstimateContext);
}
