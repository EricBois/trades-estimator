"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "react-use-wizard";
import { WizardDataProvider, useWizardData } from "./WizardDataContext";
import { WizardNavigation } from "./WizardNavigation";
import { WizardFooterProvider, useWizardFooter } from "./WizardFooterContext";
import { createWizardWrapper, WizardOuterLayout } from "./WizardLayout";
import { TemplateStep } from "./TemplateStep";
import { QuantityStep } from "./QuantityStep";
import { ComplexityStep } from "./ComplexityStep";
import { EstimatePreview } from "./EstimatePreview";
import { SendEstimate } from "./SendEstimate";
import { DrywallEstimateWizard } from "./trades/drywall/DrywallEstimateWizard";
import { HangingEstimateWizard } from "./trades/hanging/HangingEstimateWizard";
import { useAuth } from "@/contexts/AuthContext";
import { useEstimate, useCreateEstimate, useUpdateEstimate } from "@/hooks";

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
  estimateId?: string;
}

// Component to set up global save draft handler
function SaveDraftHandler({ estimateId }: { estimateId?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { setGlobalSaveDraft } = useWizardFooter();
  const wizardData = useWizardData();

  const createEstimate = useCreateEstimate();
  const updateEstimate = useUpdateEstimate();

  const saveDraft = useCallback(async () => {
    if (!user) {
      console.error("SaveDraft: No user found");
      return;
    }

    if (!wizardData.tradeType && !estimateId) {
      console.error("SaveDraft: No trade type selected");
      return;
    }

    try {
      // Build parameters object from wizard data
      const parameters = {
        templateId: wizardData.templateId,
        parameters: wizardData.parameters,
        complexity: wizardData.complexity,
      };

      if (estimateId) {
        // Update existing draft
        await updateEstimate.mutateAsync({
          id: estimateId,
          name: wizardData.estimateName || null,
          homeownerName: wizardData.homeownerName || "",
          homeownerEmail: wizardData.homeownerEmail || "",
          homeownerPhone: wizardData.homeownerPhone || null,
          projectDescription: wizardData.projectDescription || null,
          parameters,
          rangeLow: 0,
          rangeHigh: 0,
          status: "draft",
        });
      } else {
        // Create new draft
        await createEstimate.mutateAsync({
          contractorId: user.id,
          templateType: wizardData.tradeType!,
          templateId: wizardData.templateId ?? undefined,
          name: wizardData.estimateName || undefined,
          homeownerName: wizardData.homeownerName || "",
          homeownerEmail: wizardData.homeownerEmail || "",
          homeownerPhone: wizardData.homeownerPhone || undefined,
          projectDescription: wizardData.projectDescription || undefined,
          parameters,
          rangeLow: 0,
          rangeHigh: 0,
        });
      }

      router.push("/estimates");
    } catch (error) {
      console.error("SaveDraft failed:", error);
    }
  }, [user, wizardData, estimateId, createEstimate, updateEstimate, router]);

  // Register the save draft handler on mount
  useEffect(() => {
    setGlobalSaveDraft(saveDraft);
    return () => setGlobalSaveDraft(null);
  }, [saveDraft, setGlobalSaveDraft]);

  return null;
}

function WizardContent({ initialTrade, estimateId }: EstimateWizardProps) {
  const { updateData } = useWizardData();
  const { data: existingEstimate } = useEstimate(estimateId);

  // Load existing estimate data when editing
  useEffect(() => {
    if (existingEstimate && estimateId) {
      const params = existingEstimate.parameters as Record<
        string,
        unknown
      > | null;
      updateData({
        tradeType: existingEstimate.templateType,
        templateId: existingEstimate.templateId,
        estimateName: existingEstimate.name ?? "",
        homeownerName: existingEstimate.homeownerName,
        homeownerEmail: existingEstimate.homeownerEmail,
        homeownerPhone: existingEstimate.homeownerPhone ?? "",
        projectDescription: existingEstimate.projectDescription ?? "",
        parameters:
          (params?.parameters as Record<string, string | number>) ?? {},
        complexity: (params?.complexity as string) ?? "standard",
      });
    }
  }, [existingEstimate, estimateId, updateData]);

  // Set initial trade if provided (new estimate only)
  useEffect(() => {
    if (initialTrade && !estimateId) {
      updateData({ tradeType: initialTrade });
    }
  }, [initialTrade, estimateId, updateData]);

  return (
    <WizardFooterProvider>
      <SaveDraftHandler estimateId={estimateId} />
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

export function EstimateWizard({
  initialTrade,
  estimateId,
}: EstimateWizardProps) {
  // Route to specialized wizards for specific trades
  if (initialTrade === "drywall_finishing") {
    return <DrywallEstimateWizard estimateId={estimateId} />;
  }

  if (initialTrade === "drywall") {
    return <HangingEstimateWizard estimateId={estimateId} />;
  }

  // Default template-based wizard for other trades
  return (
    <WizardDataProvider>
      <WizardContent initialTrade={initialTrade} estimateId={estimateId} />
    </WizardDataProvider>
  );
}
