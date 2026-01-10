"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface Template {
  id: string;
  contractorId: string | null;
  templateName: string;
  tradeType: string;
  description: string | null;
  baseLaborHours: number;
  baseMaterialCost: number;
  complexityMultipliers: Record<string, number> | null;
  requiredFields: Record<string, unknown> | null;
}

interface WizardData {
  tradeType: string | null;
  templateId: string | null;
  template: Template | null;
  parameters: Record<string, string | number>;
  complexity: string;
  clientId: string | null;
  estimateName: string;
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  projectDescription: string;
  pdfDetailLevel: "simple" | "detailed" | "extra_detailed";
}

interface WizardDataContextValue extends WizardData {
  updateData: (updates: Partial<WizardData>) => void;
  setTemplate: (template: Template | null) => void;
  setParameter: (key: string, value: string | number) => void;
  reset: () => void;
}

const initialWizardData: WizardData = {
  tradeType: null,
  templateId: null,
  template: null,
  parameters: {},
  complexity: "standard",
  clientId: null,
  estimateName: "",
  homeownerName: "",
  homeownerEmail: "",
  homeownerPhone: "",
  projectDescription: "",
  pdfDetailLevel: "detailed",
};

const WizardDataContext = createContext<WizardDataContextValue | null>(null);

export function WizardDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(initialWizardData);

  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const setTemplate = useCallback((template: Template | null) => {
    setData((prev) => ({
      ...prev,
      template,
      templateId: template?.id ?? null,
      parameters: {}, // Reset parameters when template changes
    }));
  }, []);

  const setParameter = useCallback((key: string, value: string | number) => {
    setData((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, [key]: value },
    }));
  }, []);

  const reset = useCallback(() => {
    setData(initialWizardData);
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      updateData,
      setTemplate,
      setParameter,
      reset,
    }),
    [data, updateData, setTemplate, setParameter, reset]
  );

  return (
    <WizardDataContext.Provider value={value}>
      {children}
    </WizardDataContext.Provider>
  );
}

export function useWizardData() {
  const context = useContext(WizardDataContext);
  if (!context) {
    throw new Error("useWizardData must be used within WizardDataProvider");
  }
  return context;
}
