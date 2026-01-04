"use client";

import {
  useEffect,
  useCallback,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "react-use-wizard";
import { WizardNavigation } from "../../WizardNavigation";
import {
  WizardFooterProvider,
  useWizardFooter,
} from "../../WizardFooterContext";
import { createWizardWrapper, WizardOuterLayout } from "../../WizardLayout";
import {
  HangingEstimateProvider,
  useHangingEstimate,
} from "./HangingEstimateContext";
import { HangingInputModeStep } from "./HangingInputModeStep";
import { HangingRoomStep } from "./HangingRoomStep";
import { HangingSheetTypeStep } from "./HangingSheetTypeStep";
import { HangingDirectEntryStep } from "./HangingDirectEntryStep";
import { HangingLaborOnlyStep } from "./HangingLaborOnlyStep";
import { HangingAddonsStep } from "./HangingAddonsStep";
import { HangingComplexityStep } from "./HangingComplexityStep";
import { HangingPreview } from "./HangingPreview";
import { HangingSendEstimate } from "./HangingSendEstimate";
import { useAuth } from "@/contexts/AuthContext";
import { useEstimate, useCreateEstimate, useUpdateEstimate } from "@/hooks";

// Step configuration for calculator mode (7 steps)
const CALCULATOR_STEPS = [
  { label: "Input Mode" },
  { label: "Rooms" },
  { label: "Sheet Type" },
  { label: "Add-ons" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Step configuration for direct mode (6 steps)
const DIRECT_STEPS = [
  { label: "Input Mode" },
  { label: "Measurements" },
  { label: "Add-ons" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Step configuration for labor-only mode (5 steps)
const LABOR_ONLY_STEPS = [
  { label: "Input Mode" },
  { label: "Square Footage" },
  { label: "Add-ons" },
  { label: "Complexity" },
  { label: "Preview" },
  { label: "Send" },
];

// Create wrapper components outside of render
const CalculatorWizardWrapper = createWizardWrapper(CALCULATOR_STEPS);
const DirectWizardWrapper = createWizardWrapper(DIRECT_STEPS);
const LaborOnlyWizardWrapper = createWizardWrapper(LABOR_ONLY_STEPS);

interface HangingEstimateWizardProps {
  estimateId?: string;
}

// Component to set up global save draft handler
function SaveDraftHandler({
  estimateId,
  estimateName,
}: {
  estimateId?: string;
  estimateName: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { setGlobalSaveDraft } = useWizardFooter();
  const estimate = useHangingEstimate();

  const createEstimate = useCreateEstimate();
  const updateEstimate = useUpdateEstimate();

  const saveDraft = useCallback(async () => {
    if (!user) {
      console.error("SaveDraft: No user found");
      return;
    }

    try {
      // Build parameters object from estimate state
      const parameters = {
        inputMode: estimate.inputMode,
        pricingMethod: estimate.pricingMethod,
        sheets: estimate.sheets,
        ceilingFactor: estimate.ceilingFactor,
        wasteFactor: estimate.wasteFactor,
        complexity: estimate.complexity,
        addons: estimate.addons,
        customAddons: estimate.customAddons,
        directHours: estimate.directHours,
        rooms: estimate.rooms,
        directSqft: estimate.directSqft,
      };

      if (estimateId) {
        // Update existing draft
        await updateEstimate.mutateAsync({
          id: estimateId,
          name: estimateName || null,
          parameters,
          rangeLow: estimate.totals.total,
          rangeHigh: estimate.totals.total,
          status: "draft",
        });
      } else {
        // Create new draft
        await createEstimate.mutateAsync({
          contractorId: user.id,
          templateType: "drywall",
          name: estimateName || undefined,
          homeownerName: "",
          homeownerEmail: "",
          parameters,
          rangeLow: estimate.totals.total,
          rangeHigh: estimate.totals.total,
        });
      }

      router.push("/estimates");
    } catch (error) {
      console.error("SaveDraft failed:", error);
    }
  }, [
    user,
    estimate,
    estimateId,
    estimateName,
    createEstimate,
    updateEstimate,
    router,
  ]);

  // Register the save draft handler on mount
  useEffect(() => {
    setGlobalSaveDraft(saveDraft);
    return () => setGlobalSaveDraft(null);
  }, [saveDraft, setGlobalSaveDraft]);

  return null;
}

// Inner wizard that can access context
function HangingWizardInner({
  estimateId,
  initialName,
  initialParams,
}: {
  estimateId?: string;
  initialName: string;
  initialParams: Record<string, unknown> | null;
}) {
  const [estimateName, setEstimateName] = useState(initialName);
  const estimate = useHangingEstimate();
  const hydratedRef = useRef(false);

  // Hydrate synchronously on mount using useLayoutEffect
  useLayoutEffect(() => {
    if (initialParams && !hydratedRef.current) {
      hydratedRef.current = true;
      estimate.hydrateFromSaved(initialParams);
    }
  }, [initialParams, estimate]);

  const { inputMode } = estimate;

  // Steps vary based on input mode:
  // Calculator:  InputMode -> Rooms -> SheetType -> Addons -> Complexity -> Preview -> Send
  // Direct:      InputMode -> DirectEntry -> Addons -> Complexity -> Preview -> Send
  // Labor Only:  InputMode -> LaborOnly (sqft) -> Addons -> Complexity -> Preview -> Send

  const WizardWrapper =
    inputMode === "calculator"
      ? CalculatorWizardWrapper
      : inputMode === "labor_only"
      ? LaborOnlyWizardWrapper
      : DirectWizardWrapper;

  return (
    <WizardFooterProvider>
      <SaveDraftHandler estimateId={estimateId} estimateName={estimateName} />
      <WizardOuterLayout>
        <Wizard footer={<WizardNavigation />} wrapper={<WizardWrapper />}>
          {/* Step 0: Input Mode Selection */}
          <HangingInputModeStep
            estimateName={estimateName}
            onEstimateNameChange={setEstimateName}
          />

          {/* Steps 1-2 vary by mode */}
          {inputMode === "calculator" && <HangingRoomStep />}
          {inputMode === "calculator" && <HangingSheetTypeStep />}
          {inputMode === "direct" && <HangingDirectEntryStep />}
          {inputMode === "labor_only" && <HangingLaborOnlyStep />}
          {/* Common steps */}
          <HangingAddonsStep />
          <HangingComplexityStep />
          <HangingPreview />
          <HangingSendEstimate
            estimateId={estimateId}
            estimateName={estimateName}
          />
        </Wizard>
      </WizardOuterLayout>
    </WizardFooterProvider>
  );
}

export function HangingEstimateWizard({
  estimateId,
}: HangingEstimateWizardProps) {
  const { data: existingEstimate, isLoading } = useEstimate(estimateId);

  // Show loading while fetching existing estimate
  if (estimateId && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const initialName = existingEstimate?.name ?? "";
  const initialParams = existingEstimate?.parameters as Record<
    string,
    unknown
  > | null;

  return (
    <HangingEstimateProvider>
      <HangingWizardInner
        estimateId={estimateId}
        initialName={initialName}
        initialParams={initialParams}
      />
    </HangingEstimateProvider>
  );
}
