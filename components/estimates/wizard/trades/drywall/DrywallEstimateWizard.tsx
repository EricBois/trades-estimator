"use client";

import { Wizard } from "react-use-wizard";
import { WizardNavigation } from "../../WizardNavigation";
import { WizardFooterProvider } from "../../WizardFooterContext";
import { createWizardWrapper, WizardOuterLayout } from "../../WizardLayout";
import { DrywallEstimateProvider } from "./DrywallEstimateContext";
import { DrywallFinishLevelStep } from "./DrywallFinishLevelStep";
import { DrywallLineItemsStep } from "./DrywallLineItemsStep";
import { DrywallAddonsStep } from "./DrywallAddonsStep";
import { DrywallMaterialsStep } from "./DrywallMaterialsStep";
import { DrywallComplexityStep } from "./DrywallComplexityStep";
import { DrywallPreview } from "./DrywallPreview";
import { DrywallSendEstimate } from "./DrywallSendEstimate";

// Step configuration for the drywall wizard
const DRYWALL_STEPS = [
  { label: "Finish Level" },
  { label: "Line Items" },
  { label: "Add-ons" },
  { label: "Materials" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Create wrapper component outside of render
const DrywallWizardWrapper = createWizardWrapper(DRYWALL_STEPS);

export function DrywallEstimateWizard() {
  return (
    <DrywallEstimateProvider>
      <WizardFooterProvider>
        <WizardOuterLayout>
          <Wizard
            footer={<WizardNavigation />}
            wrapper={<DrywallWizardWrapper />}
          >
            <DrywallFinishLevelStep />
            <DrywallLineItemsStep />
            <DrywallAddonsStep />
            <DrywallMaterialsStep />
            <DrywallComplexityStep />
            <DrywallPreview />
            <DrywallSendEstimate />
          </Wizard>
        </WizardOuterLayout>
      </WizardFooterProvider>
    </DrywallEstimateProvider>
  );
}
