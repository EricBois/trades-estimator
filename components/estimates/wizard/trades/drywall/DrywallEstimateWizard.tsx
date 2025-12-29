"use client";

import { Wizard } from "react-use-wizard";
import { WizardProgress } from "../../WizardProgress";
import { WizardNavigation } from "../../WizardNavigation";
import { DrywallEstimateProvider } from "./DrywallEstimateContext";
import { DrywallFinishLevelStep } from "./DrywallFinishLevelStep";
import { DrywallLineItemsStep } from "./DrywallLineItemsStep";
import { DrywallAddonsStep } from "./DrywallAddonsStep";
import { DrywallComplexityStep } from "./DrywallComplexityStep";
import { DrywallPreview } from "./DrywallPreview";
import { DrywallSendEstimate } from "./DrywallSendEstimate";

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

export function DrywallEstimateWizard() {
  return (
    <DrywallEstimateProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Wizard
          header={<WizardProgress />}
          footer={<WizardNavigation />}
          wrapper={<StepWrapper />}
        >
          <DrywallFinishLevelStep />
          <DrywallLineItemsStep />
          <DrywallAddonsStep />
          <DrywallComplexityStep />
          <DrywallPreview />
          <DrywallSendEstimate />
        </Wizard>
      </div>
    </DrywallEstimateProvider>
  );
}
