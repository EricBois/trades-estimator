"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, User, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { useCreateProject, useCreateEstimate } from "@/hooks";
import { StepHeader } from "@/components/ui/StepHeader";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProjectSendEstimate() {
  const router = useRouter();
  const { user } = useAuth();
  const { setFooterConfig } = useWizardFooter();
  const {
    projectName,
    setProjectName,
    enabledTrades,
    projectTotals,
    tradeTotals,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
    roomsHook,
  } = useProjectEstimateContext();

  const createProject = useCreateProject();
  const createEstimate = useCreateEstimate();

  // Form state
  const [homeownerName, setHomeownerName] = useState("");
  const [homeownerEmail, setHomeownerEmail] = useState("");
  const [homeownerPhone, setHomeownerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(homeownerEmail);
  const canSubmit =
    homeownerName.trim() !== "" && homeownerEmail.trim() !== "" && isEmailValid;

  const handleSubmit = useCallback(async () => {
    if (!user || !canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create the project
      const project = await createProject.mutateAsync({
        contractorId: user.id,
        name: projectName || "Multi-Trade Project",
        homeownerName,
        homeownerEmail,
        homeownerPhone: homeownerPhone || undefined,
        projectDescription: notes || undefined,
      });

      // 2. Save rooms to project
      await roomsHook.saveRooms();

      // 3. Create estimates for each enabled trade
      for (const tradeType of enabledTrades) {
        const totals = tradeTotals[tradeType];
        if (!totals) continue;

        let parameters: Record<string, unknown> = {};

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
          homeownerName,
          homeownerEmail,
          homeownerPhone: homeownerPhone || undefined,
          projectDescription: `${projectName} - ${tradeType.replace("_", " ")}`,
          parameters,
          rangeLow: totals.total,
          rangeHigh: totals.total,
          projectId: project.id,
        });
      }

      // Navigate to project or estimates page
      router.push("/estimates");
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    user,
    canSubmit,
    createProject,
    projectName,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    notes,
    roomsHook,
    enabledTrades,
    tradeTotals,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
    createEstimate,
    router,
  ]);

  // Use ref to avoid useEffect dependency on handleSubmit
  const handleSubmitRef = useRef(handleSubmit);

  // Update ref in an effect to satisfy linter
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // Configure footer with send button
  useEffect(() => {
    setFooterConfig({
      onContinue: () => handleSubmitRef.current(),
      continueText: "Send Estimate",
      icon: "send",
      isLoading: isSubmitting,
      loadingText: "Sending...",
      disabled: !canSubmit,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, isSubmitting, canSubmit]);

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Send Estimate"
        description="Enter homeowner details to send this project estimate"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Project name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Kitchen Renovation"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Homeowner name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homeowner Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={homeownerName}
                onChange={(e) => setHomeownerName(e.target.value)}
                placeholder="John Smith"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Homeowner email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homeowner Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={homeownerEmail}
                onChange={(e) => setHomeownerEmail(e.target.value)}
                placeholder="john@example.com"
                className={cn(
                  "w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-0",
                  homeownerEmail && !isEmailValid
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-500"
                )}
              />
            </div>
            {homeownerEmail && !isEmailValid && (
              <p className="mt-1 text-sm text-red-500">
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Homeowner phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={homeownerPhone}
                onChange={(e) => setHomeownerPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the project..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-blue-800">
                  Project Total
                </div>
                <div className="text-xs text-blue-600">
                  {enabledTrades.length} trade
                  {enabledTrades.length > 1 ? "s" : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-900">
                  {formatCurrency(projectTotals.combinedTotal)}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
