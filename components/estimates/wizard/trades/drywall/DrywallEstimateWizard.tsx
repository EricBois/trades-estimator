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
  DrywallEstimateProvider,
  useDrywallEstimate,
} from "./DrywallEstimateContext";
import { DrywallFinishLevelStep } from "./DrywallFinishLevelStep";
import { DrywallLineItemsStep } from "./DrywallLineItemsStep";
import { DrywallAddonsStep } from "./DrywallAddonsStep";
import { DrywallMaterialsStep } from "./DrywallMaterialsStep";
import { DrywallComplexityStep } from "./DrywallComplexityStep";
import { DrywallPreview } from "./DrywallPreview";
import { DrywallSendEstimate } from "./DrywallSendEstimate";
import { useAuth } from "@/contexts/AuthContext";
import { useEstimate, useCreateEstimate, useUpdateEstimate } from "@/hooks";

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

interface DrywallEstimateWizardProps {
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
  const estimate = useDrywallEstimate();

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
        finishLevel: estimate.finishLevel,
        lineItems: estimate.lineItems,
        complexity: estimate.complexity,
        addons: estimate.addons,
        customAddons: estimate.customAddons,
        materials: estimate.materials,
        directHours: estimate.directHours,
      };

      if (estimateId) {
        // Update existing draft
        await updateEstimate.mutateAsync({
          id: estimateId,
          name: estimateName || null,
          parameters,
          rangeLow: estimate.totals.range.low,
          rangeHigh: estimate.totals.range.high,
          status: "draft",
        });
      } else {
        // Create new draft
        await createEstimate.mutateAsync({
          contractorId: user.id,
          templateType: "drywall_finishing",
          name: estimateName || undefined,
          homeownerName: "",
          homeownerEmail: "",
          parameters,
          rangeLow: estimate.totals.range.low,
          rangeHigh: estimate.totals.range.high,
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
function DrywallWizardInner({
  estimateId,
  initialName,
  initialParams,
}: {
  estimateId?: string;
  initialName: string;
  initialParams: Record<string, unknown> | null;
}) {
  const [estimateName, setEstimateName] = useState(initialName);
  const estimate = useDrywallEstimate();
  const hydratedRef = useRef(false);

  // Hydrate synchronously on mount using useLayoutEffect
  useLayoutEffect(() => {
    if (initialParams && !hydratedRef.current) {
      hydratedRef.current = true;
      estimate.hydrateFromSaved(initialParams);
    }
  }, [initialParams, estimate]);

  return (
    <WizardFooterProvider>
      <SaveDraftHandler estimateId={estimateId} estimateName={estimateName} />
      <WizardOuterLayout>
        <Wizard
          footer={<WizardNavigation />}
          wrapper={<DrywallWizardWrapper />}
        >
          <DrywallFinishLevelStep
            estimateName={estimateName}
            onEstimateNameChange={setEstimateName}
          />
          <DrywallLineItemsStep />
          <DrywallAddonsStep />
          <DrywallMaterialsStep />
          <DrywallComplexityStep />
          <DrywallPreview />
          <DrywallSendEstimate
            estimateId={estimateId}
            estimateName={estimateName}
          />
        </Wizard>
      </WizardOuterLayout>
    </WizardFooterProvider>
  );
}

export function DrywallEstimateWizard({
  estimateId,
}: DrywallEstimateWizardProps) {
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
    <DrywallEstimateProvider>
      <DrywallWizardInner
        estimateId={estimateId}
        initialName={initialName}
        initialParams={initialParams}
      />
    </DrywallEstimateProvider>
  );
}
