"use client";

import { useEffect } from "react";
import { Wizard } from "react-use-wizard";
import { WizardDataProvider, useWizardData } from "./WizardDataContext";
import { WizardNavigation } from "./WizardNavigation";
import { WizardFooterProvider } from "./WizardFooterContext";
import { createWizardWrapper, WizardOuterLayout } from "./WizardLayout";
import { TemplateStep } from "./TemplateStep";
import { QuantityStep } from "./QuantityStep";
import { ComplexityStep } from "./ComplexityStep";
import { EstimatePreview } from "./EstimatePreview";
import { SendEstimate } from "./SendEstimate";
import { DrywallEstimateWizard } from "./trades/drywall/DrywallEstimateWizard";
import { HangingEstimateWizard } from "./trades/hanging/HangingEstimateWizard";

// Step configuration for the stepper
const WIZARD_STEPS = [
  { label: "Template" },
  { label: "Details" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Create wrapper component outside of render
const StandardWizardWrapper = createWizardWrapper(WIZARD_STEPS);

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
    <WizardFooterProvider>
      <WizardOuterLayout>
        <Wizard
          footer={<WizardNavigation />}
          wrapper={<StandardWizardWrapper />}
        >
          <TemplateStep />
          <QuantityStep />
          <ComplexityStep />
          <EstimatePreview />
          <SendEstimate />
        </Wizard>
      </WizardOuterLayout>
    </WizardFooterProvider>
  );
}

export function EstimateWizard({ initialTrade }: EstimateWizardProps) {
  // Route to specialized wizards for specific trades
  if (initialTrade === "drywall_finishing") {
    return <DrywallEstimateWizard />;
  }

  if (initialTrade === "drywall") {
    return <HangingEstimateWizard />;
  }

  // Default template-based wizard for other trades
  return (
    <WizardDataProvider>
      <WizardContent initialTrade={initialTrade} />
    </WizardDataProvider>
  );
}
