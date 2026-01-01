"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  useProjectEstimate,
  UseProjectEstimateReturn,
} from "@/hooks/project/useProjectEstimate";

const ProjectEstimateContext = createContext<UseProjectEstimateReturn | null>(
  null
);

export function ProjectEstimateProvider({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId?: string;
}) {
  const estimate = useProjectEstimate(projectId);

  return (
    <ProjectEstimateContext.Provider value={estimate}>
      {children}
    </ProjectEstimateContext.Provider>
  );
}

export function useProjectEstimateContext() {
  const context = useContext(ProjectEstimateContext);
  if (!context) {
    throw new Error(
      "useProjectEstimateContext must be used within ProjectEstimateProvider"
    );
  }
  return context;
}
