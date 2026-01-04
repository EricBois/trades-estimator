"use client";

import { useMemo, useEffect, useCallback } from "react";
import { Wizard, useWizard } from "react-use-wizard";
import { useRouter } from "next/navigation";
import { WizardNavigation } from "../WizardNavigation";
import { WizardFooterProvider, useWizardFooter } from "../WizardFooterContext";
import { WizardOuterLayout } from "../WizardLayout";
import { WizardStepper } from "@/components/ui/WizardStepper";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProject, useCreateEstimate } from "@/hooks";
import {
  ProjectEstimateProvider,
  useProjectEstimateContext,
} from "./ProjectEstimateContext";
import { ProjectTradeSelectionStep } from "./ProjectTradeSelectionStep";
import { ProjectRoomsStep } from "./ProjectRoomsStep";
import { TradeRoomSelectionStep } from "./TradeRoomSelectionStep";
import { TradeHoursStep } from "./TradeHoursStep";
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
// Standalone painting steps
import { PaintingCoatStep } from "../trades/painting/PaintingCoatStep";
import { PaintingQualityStep } from "../trades/painting/PaintingQualityStep";
import { PaintingSurfacePrepStep } from "../trades/painting/PaintingSurfacePrepStep";
import { PaintingComplexityStep } from "../trades/painting/PaintingComplexityStep";
import { PaintingAddonsStep } from "../trades/painting/PaintingAddonsStep";

// Step type
interface Step {
  label: string;
}

// Base steps that are always present
const BASE_STEPS: Step[] = [{ label: "Trades" }, { label: "Rooms" }];

// Trade-specific step labels (arrays to support multiple steps per trade)
// Note: "Rooms" step auto-skips in manual mode
const TRADE_STEP_LABELS: Record<string, Step[]> = {
  drywall_hanging: [
    { label: "Hanging Rooms" }, // Skips in manual mode
    { label: "Extra Hours" },
    { label: "Sheets" },
    { label: "Complexity" },
    { label: "Add-ons" },
  ],
  drywall_finishing: [
    { label: "Finishing Rooms" }, // Skips in manual mode
    { label: "Extra Hours" },
    { label: "Finish" },
    { label: "Complexity" },
    { label: "Add-ons" },
    { label: "Materials" },
  ],
  painting: [
    { label: "Paint Rooms" }, // Skips in manual mode
    { label: "Extra Hours" },
    { label: "Coats" },
    { label: "Quality" },
    { label: "Prep" },
    { label: "Complexity" },
    { label: "Add-ons" },
  ],
};

// Final steps
const FINAL_STEPS: Step[] = [{ label: "Preview" }, { label: "Send" }];

// Component to set up global save draft handler
function SaveDraftHandler() {
  const router = useRouter();
  const { user } = useAuth();
  const { setGlobalSaveDraft } = useWizardFooter();
  const {
    projectName,
    enabledTrades,
    tradeTotals,
    roomsHook,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
  } = useProjectEstimateContext();

  const createProject = useCreateProject();
  const createEstimate = useCreateEstimate();

  const saveDraft = useCallback(async () => {
    if (!user) return;

    // 1. Create the project as draft (no homeowner info required)
    const project = await createProject.mutateAsync({
      contractorId: user.id,
      name: projectName || "Untitled Project",
    });

    // 2. Save rooms to the new project
    if (roomsHook.rooms.length > 0) {
      await roomsHook.saveRooms(project.id);
    }

    // 3. Create estimates for each enabled trade
    for (const tradeType of enabledTrades) {
      const totals = tradeTotals[tradeType];
      if (!totals) continue;

      let parameters = {};

      if (tradeType === "drywall_hanging") {
        parameters = {
          inputMode: hangingEstimate.inputMode,
          pricingMethod: hangingEstimate.pricingMethod,
          sheets: hangingEstimate.sheets,
          ceilingFactor: hangingEstimate.ceilingFactor,
          wasteFactor: hangingEstimate.wasteFactor,
          complexity: hangingEstimate.complexity,
          addons: hangingEstimate.addons,
        };
      } else if (tradeType === "drywall_finishing") {
        parameters = {
          finishLevel: finishingEstimate.finishLevel,
          lineItems: finishingEstimate.lineItems,
          complexity: finishingEstimate.complexity,
          addons: finishingEstimate.addons,
          materials: finishingEstimate.materials,
        };
      } else if (tradeType === "painting") {
        parameters = {
          coatCount: paintingEstimate.coatCount,
          paintQuality: paintingEstimate.paintQuality,
          surfacePrep: paintingEstimate.surfacePrep,
          complexity: paintingEstimate.complexity,
          addons: paintingEstimate.addons,
          wallSqft: paintingEstimate.wallSqft,
          ceilingSqft: paintingEstimate.ceilingSqft,
        };
      }

      await createEstimate.mutateAsync({
        contractorId: user.id,
        templateType: tradeType,
        homeownerName: "",
        homeownerEmail: "",
        projectDescription: `${projectName} - ${tradeType.replace(/_/g, " ")}`,
        parameters,
        rangeLow: totals.total,
        rangeHigh: totals.total,
        projectId: project.id,
      });
    }

    // Navigate to projects list
    router.push("/estimates");
  }, [
    user,
    createProject,
    projectName,
    roomsHook,
    enabledTrades,
    tradeTotals,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
    createEstimate,
    router,
  ]);

  // Register the save draft handler on mount
  useEffect(() => {
    setGlobalSaveDraft(saveDraft);
    return () => setGlobalSaveDraft(null);
  }, [saveDraft, setGlobalSaveDraft]);

  return null;
}

// Wrapper that takes steps as a prop
function ProjectWizardWrapper({
  steps,
  children,
}: {
  steps: Step[];
  children?: React.ReactNode;
}) {
  const { activeStep } = useWizard();
  const { setLastVisitedStep } = useWizardFooter();

  // Track step changes for navigation direction detection
  useEffect(() => {
    setLastVisitedStep(activeStep);
  }, [activeStep, setLastVisitedStep]);

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
  const {
    enabledTrades,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
  } = useProjectEstimateContext();

  // Build dynamic step configuration based on enabled trades
  const steps = useMemo(() => {
    const tradeSteps = enabledTrades.flatMap(
      (trade) => TRADE_STEP_LABELS[trade]
    );
    return [...BASE_STEPS, ...tradeSteps, ...FINAL_STEPS];
  }, [enabledTrades]);

  return (
    <WizardFooterProvider>
      <SaveDraftHandler />
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
            <TradeRoomSelectionStep tradeType="drywall_hanging" />
          )}
          {enabledTrades.includes("drywall_hanging") && (
            <TradeHoursStep tradeType="drywall_hanging" />
          )}
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
            <TradeRoomSelectionStep tradeType="drywall_finishing" />
          )}
          {enabledTrades.includes("drywall_finishing") && (
            <TradeHoursStep tradeType="drywall_finishing" />
          )}
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

          {/* Dynamic painting steps (now using standalone components) */}
          {enabledTrades.includes("painting") && (
            <TradeRoomSelectionStep tradeType="painting" />
          )}
          {enabledTrades.includes("painting") && (
            <TradeHoursStep tradeType="painting" />
          )}
          {enabledTrades.includes("painting") && (
            <PaintingCoatStep paintingEstimate={paintingEstimate} />
          )}
          {enabledTrades.includes("painting") && (
            <PaintingQualityStep paintingEstimate={paintingEstimate} />
          )}
          {enabledTrades.includes("painting") && (
            <PaintingSurfacePrepStep paintingEstimate={paintingEstimate} />
          )}
          {enabledTrades.includes("painting") && (
            <PaintingComplexityStep paintingEstimate={paintingEstimate} />
          )}
          {enabledTrades.includes("painting") && (
            <PaintingAddonsStep paintingEstimate={paintingEstimate} />
          )}

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
