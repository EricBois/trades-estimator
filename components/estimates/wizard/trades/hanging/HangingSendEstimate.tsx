"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useHangingEstimate } from "./HangingEstimateContext";
import { useWizardFooter } from "../../WizardFooterContext";
import { useCreateEstimate } from "@/hooks/useEstimates";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";
import { StepHeader } from "@/components/ui/StepHeader";

interface HangingSendEstimateProps {
  estimateId?: string;
  estimateName?: string;
}

export function HangingSendEstimate({
  estimateName,
}: HangingSendEstimateProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const { setFooterConfig } = useWizardFooter();
  const {
    rooms,
    sheets,
    addons,
    complexity,
    ceilingFactor,
    wasteFactor,
    totals,
    inputMode,
  } = useHangingEstimate();
  const createEstimate = useCreateEstimate();

  const [homeownerName, setHomeownerName] = useState("");
  const [homeownerEmail, setHomeownerEmail] = useState("");
  const [homeownerPhone, setHomeownerPhone] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!homeownerName.trim()) {
      newErrors.homeownerName = "Name is required";
    }
    if (!homeownerEmail.trim()) {
      newErrors.homeownerEmail = "Email is required";
    } else if (!z.string().email().safeParse(homeownerEmail).success) {
      newErrors.homeownerEmail = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [homeownerName, homeownerEmail]);

  const handleSubmit = useCallback(async () => {
    if (!validate() || !profile) return;

    try {
      // Prepare drywall hanging-specific parameters
      const parameters = {
        inputMode,
        rooms: rooms.map((r) => ({
          name: r.name,
          lengthFeet: r.lengthFeet,
          lengthInches: r.lengthInches,
          widthFeet: r.widthFeet,
          widthInches: r.widthInches,
          heightFeet: r.heightFeet,
          heightInches: r.heightInches,
          includeCeiling: r.includeCeiling,
          doors: r.doors.map((d) => ({
            label: d.label,
            width: d.width,
            height: d.height,
            quantity: d.quantity,
          })),
          windows: r.windows.map((w) => ({
            label: w.label,
            width: w.width,
            height: w.height,
            quantity: w.quantity,
          })),
          totalSqft: r.totalSqft,
        })),
        sheets: sheets.map((s) => ({
          typeId: s.typeId,
          size: s.size,
          quantity: s.quantity,
          materialCost: s.materialCost,
          laborCost: s.laborCost,
        })),
        addons: addons.map((a) => ({
          id: a.id,
          quantity: a.quantity,
          total: a.total,
        })),
        complexity,
        ceilingFactor,
        wasteFactor,
        totals: {
          totalSqft: totals.totalSqft,
          sheetsNeeded: totals.sheetsNeeded,
          materialSubtotal: totals.materialSubtotal,
          laborSubtotal: totals.laborSubtotal,
          addonsSubtotal: totals.addonsSubtotal,
          complexityAdjustment: totals.complexityAdjustment,
          total: totals.total,
        },
      };

      const estimate = await createEstimate.mutateAsync({
        contractorId: profile.id,
        templateType: "drywall_hanging",
        name: estimateName?.trim() || undefined,
        homeownerName: homeownerName.trim(),
        homeownerEmail: homeownerEmail.trim(),
        homeownerPhone: homeownerPhone.trim() || undefined,
        projectDescription: projectDescription.trim() || undefined,
        parameters,
        rangeLow: totals.total,
        rangeHigh: totals.total,
      });

      router.push(`/estimates/${estimate.id}`);
    } catch (error) {
      console.error("Failed to create estimate:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create estimate",
      });
    }
  }, [
    validate,
    profile,
    inputMode,
    rooms,
    sheets,
    addons,
    complexity,
    ceilingFactor,
    wasteFactor,
    totals,
    createEstimate,
    estimateName,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    projectDescription,
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
      isLoading: createEstimate.isPending,
      loadingText: "Creating...",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, createEstimate.isPending]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <StepHeader
        title="Send Estimate"
        description="Enter homeowner details to send the estimate"
      />

      {/* Total reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
        <div className="text-sm text-blue-600">Estimate Total</div>
        <div className="text-3xl font-bold text-blue-900">
          ${formatCurrency(totals.total)}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Homeowner Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={homeownerName}
            onChange={(e) => setHomeownerName(e.target.value)}
            placeholder="John Smith"
            className={cn(
              "w-full h-14 px-4 text-lg border-2 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.homeownerName ? "border-red-300" : "border-gray-200"
            )}
          />
          {errors.homeownerName && (
            <p className="text-sm text-red-500 mt-1">{errors.homeownerName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={homeownerEmail}
            onChange={(e) => setHomeownerEmail(e.target.value)}
            placeholder="john@example.com"
            className={cn(
              "w-full h-14 px-4 text-lg border-2 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.homeownerEmail ? "border-red-300" : "border-gray-200"
            )}
          />
          {errors.homeownerEmail && (
            <p className="text-sm text-red-500 mt-1">{errors.homeownerEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="tel"
            value={homeownerPhone}
            onChange={(e) => setHomeownerPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className={cn(
              "w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Description{" "}
            <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Any additional notes for the homeowner..."
            rows={3}
            className={cn(
              "w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl resize-none",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  );
}
