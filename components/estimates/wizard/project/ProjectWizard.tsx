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
import { ProjectPaintingConfigStep } from "./ProjectPaintingConfigStep";
import { ProjectCombinedPreview } from "./ProjectCombinedPreview";
import { ProjectSendEstimate } from "./ProjectSendEstimate";
// Standalone hanging steps
import { HangingSheetTypeStep } from "../trades/hanging/HangingSheetTypeStep";
import { HangingComplexityStep } from "../trades/hanging/HangingComplexityStep";
import { HangingAddonsStep } from "../trades/hanging/HangingAddonsStep";
// Standalone finishing steps
import { DrywallFinishLevelStep } from "../trades/drywall/DrywallFinishLevelStep";
import { DrywallComplexityStep } from "../trades/drywall/DrywallComplexityStep";
import { DrywallAddonsStep } from "../trades/drywall/DrywallAddonsStep";
import { DrywallMaterialsStep } from "../trades/drywall/DrywallMaterialsStep";

// Step type
interface Step {
  label: string;
}

// Base steps that are always present
const BASE_STEPS: Step[] = [{ label: "Trades" }, { label: "Rooms" }];

// Trade-specific step labels (arrays to support multiple steps per trade)
const TRADE_STEP_LABELS: Record<string, Step[]> = {
  drywall_hanging: [
    { label: "Sheets" },
    { label: "Complexity" },
    { label: "Add-ons" },
  ],
  drywall_finishing: [
    { label: "Finish" },
    { label: "Complexity" },
    { label: "Add-ons" },
    { label: "Materials" },
  ],
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
  const { enabledTrades, hangingEstimate, finishingEstimate } =
    useProjectEstimateContext();

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

          {/* Dynamic hanging steps */}
          {enabledTrades.includes("drywall_hanging") && (
            <HangingSheetTypeStep hangingEstimate={hangingEstimate} />
          )}
          {enabledTrades.includes("drywall_hanging") && (
            <HangingComplexityStep hangingEstimate={hangingEstimate} />
          )}
          {enabledTrades.includes("drywall_hanging") && (
            <HangingAddonsStep hangingEstimate={hangingEstimate} />
          )}

          {/* Dynamic finishing steps */}
          {enabledTrades.includes("drywall_finishing") && (
            <DrywallFinishLevelStep finishingEstimate={finishingEstimate} />
          )}
          {enabledTrades.includes("drywall_finishing") && (
            <DrywallComplexityStep finishingEstimate={finishingEstimate} />
          )}
          {enabledTrades.includes("drywall_finishing") && (
            <DrywallAddonsStep finishingEstimate={finishingEstimate} />
          )}
          {enabledTrades.includes("drywall_finishing") && (
            <DrywallMaterialsStep finishingEstimate={finishingEstimate} />
          )}

          {/* Painting step (consolidated - no standalone steps exist yet) */}
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
