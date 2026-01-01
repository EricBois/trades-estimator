"use client";

import { useMemo } from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { WizardNavigation } from "../WizardNavigation";
import { WizardFooterProvider } from "../WizardFooterContext";
import { WizardOuterLayout } from "../WizardLayout";
import { WizardStepper } from "@/components/ui/WizardStepper";
import {
  ProjectEstimateProvider,
  useProjectEstimateContext,
} from "./ProjectEstimateContext";
import { ProjectTradeSelectionStep } from "./ProjectTradeSelectionStep";
import { ProjectRoomsStep } from "./ProjectRoomsStep";
import { ProjectHangingConfigStep } from "./ProjectHangingConfigStep";
import { ProjectFinishingConfigStep } from "./ProjectFinishingConfigStep";
import { ProjectPaintingConfigStep } from "./ProjectPaintingConfigStep";
import { ProjectCombinedPreview } from "./ProjectCombinedPreview";
import { ProjectSendEstimate } from "./ProjectSendEstimate";
import { DrywallMaterialsStep } from "../trades/drywall/DrywallMaterialsStep";

// Step type
interface Step {
  label: string;
}

// Base steps that are always present
const BASE_STEPS: Step[] = [{ label: "Trades" }, { label: "Rooms" }];

// Trade-specific step labels (arrays to support multiple steps per trade)
const TRADE_STEP_LABELS: Record<string, Step[]> = {
  drywall_hanging: [{ label: "Hanging" }],
  drywall_finishing: [{ label: "Finishing" }, { label: "Materials" }],
  painting: [{ label: "Painting" }],
};

// Final steps
const FINAL_STEPS: Step[] = [{ label: "Preview" }, { label: "Send" }];

// Wrapper that takes steps as a prop
function ProjectWizardWrapper({
  steps,
  children,
}: {
  steps: Step[];
  children?: React.ReactNode;
}) {
  const { activeStep } = useWizard();

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile horizontal stepper */}
      <div className="lg:hidden">
        <WizardStepper steps={steps} currentStep={activeStep} />
      </div>

      {/* Desktop sidebar stepper */}
      <div className="hidden lg:block">
        <WizardStepper steps={steps} currentStep={activeStep} />
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto py-6 px-4 pb-28">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Inner wizard that can access context
function ProjectWizardInner() {
  const { enabledTrades, finishingEstimate } = useProjectEstimateContext();

  // Build dynamic step configuration based on enabled trades
  const steps = useMemo(() => {
    const tradeSteps = enabledTrades.flatMap(
      (trade) => TRADE_STEP_LABELS[trade]
    );
    return [...BASE_STEPS, ...tradeSteps, ...FINAL_STEPS];
  }, [enabledTrades]);

  return (
    <WizardFooterProvider>
      <WizardOuterLayout>
        <Wizard
          footer={<WizardNavigation />}
          wrapper={<ProjectWizardWrapper steps={steps} />}
        >
          {/* Step 0: Trade Selection */}
          <ProjectTradeSelectionStep />

          {/* Step 1: Rooms */}
          <ProjectRoomsStep />

          {/* Dynamic trade config steps */}
          {enabledTrades.includes("drywall_hanging") && (
            <ProjectHangingConfigStep />
          )}
          {enabledTrades.includes("drywall_finishing") && (
            <ProjectFinishingConfigStep />
          )}
          {enabledTrades.includes("drywall_finishing") && (
            <DrywallMaterialsStep finishingEstimate={finishingEstimate} />
          )}
          {enabledTrades.includes("painting") && <ProjectPaintingConfigStep />}

          {/* Final steps */}
          <ProjectCombinedPreview />
          <ProjectSendEstimate />
        </Wizard>
      </WizardOuterLayout>
    </WizardFooterProvider>
  );
}

export function ProjectWizard({ projectId }: { projectId?: string }) {
  return (
    <ProjectEstimateProvider projectId={projectId}>
      <ProjectWizardInner />
    </ProjectEstimateProvider>
  );
}
