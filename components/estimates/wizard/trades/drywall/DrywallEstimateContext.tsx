"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useDrywallFinishingEstimate,
} from "@/hooks/trades/useDrywallFinishingEstimate";
import { UseDrywallFinishingEstimateReturn } from "@/lib/trades/drywallFinishing/types";

const DrywallEstimateContext = createContext<UseDrywallFinishingEstimateReturn | null>(null);

export function DrywallEstimateProvider({ children }: { children: ReactNode }) {
  const estimate = useDrywallFinishingEstimate();

  return (
    <DrywallEstimateContext.Provider value={estimate}>
      {children}
    </DrywallEstimateContext.Provider>
  );
}

export function useDrywallEstimate() {
  const context = useContext(DrywallEstimateContext);
  if (!context) {
    throw new Error("useDrywallEstimate must be used within DrywallEstimateProvider");
  }
  return context;
}
