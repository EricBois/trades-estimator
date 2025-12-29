"use client";

import { useEffect } from "react";
import { Wizard } from "react-use-wizard";
import { WizardDataProvider, useWizardData } from "./WizardDataContext";
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { TemplateStep } from "./TemplateStep";
import { QuantityStep } from "./QuantityStep";
import { ComplexityStep } from "./ComplexityStep";
import { EstimatePreview } from "./EstimatePreview";
import { SendEstimate } from "./SendEstimate";

interface EstimateWizardProps {
  initialTrade?: string;
}

function WizardContent({ initialTrade }: EstimateWizardProps) {
  const { updateData } = useWizardData();

  // Set initial trade if provided
  useEffect(() => {
    if (initialTrade) {
      updateData({ tradeType: initialTrade });
    }
  }, [initialTrade, updateData]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Wizard
        header={<WizardProgress />}
        footer={<WizardNavigation />}
        wrapper={<StepWrapper />}
      >
        <TemplateStep />
        <QuantityStep />
        <ComplexityStep />
        <EstimatePreview />
        <SendEstimate />
      </Wizard>
    </div>
  );
}

export function EstimateWizard({ initialTrade }: EstimateWizardProps) {
  return (
    <WizardDataProvider>
      <WizardContent initialTrade={initialTrade} />
    </WizardDataProvider>
  );
}

// Wrapper component for consistent step layout
function StepWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="py-6 pb-28">
        {children}
      </div>
    </div>
  );
}
