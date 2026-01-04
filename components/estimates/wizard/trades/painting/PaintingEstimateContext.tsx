"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePaintingEstimate } from "@/hooks/trades/usePaintingEstimate";
import { UsePaintingEstimateReturn } from "@/lib/trades/painting/types";

const PaintingEstimateContext =
  createContext<UsePaintingEstimateReturn | null>(null);

export function PaintingEstimateProvider({ children }: { children: ReactNode }) {
  const estimate = usePaintingEstimate();

  return (
    <PaintingEstimateContext.Provider value={estimate}>
      {children}
    </PaintingEstimateContext.Provider>
  );
}

export function usePaintingEstimateContext() {
  const context = useContext(PaintingEstimateContext);
  if (!context) {
    throw new Error(
      "usePaintingEstimateContext must be used within PaintingEstimateProvider"
    );
  }
  return context;
}

// Safe version that returns null instead of throwing (for reusable components)
export function usePaintingEstimateSafe() {
  return useContext(PaintingEstimateContext);
}
