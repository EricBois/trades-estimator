"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Mail, User, Phone, FileText } from "lucide-react";
import { useWizardData } from "./WizardDataContext";
import { useWizardFooter } from "./WizardFooterContext";
import { useCreateEstimate } from "@/hooks/useEstimates";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateEstimateRange,
  formatCurrency,
} from "@/lib/estimateCalculations";
import { cn } from "@/lib/utils";

export function SendEstimate() {
  const router = useRouter();
  const { profile } = useAuth();
  const { setFooterConfig } = useWizardFooter();
  const createEstimate = useCreateEstimate();
  const {
    tradeType,
    templateId,
    template,
    parameters,
    complexity,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    projectDescription,
    updateData,
  } = useWizardData();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate estimate range
  const estimateRange = useMemo(() => {
    return calculateEstimateRange({
      template,
      parameters,
      complexity,
      hourlyRate: profile?.hourly_rate ?? 75,
    });
  }, [template, parameters, complexity, profile?.hourly_rate]);

  const validate = () => {
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
  };

  const handleSubmit = useCallback(async () => {
    if (!validate() || !estimateRange || !profile || !tradeType) return;

    setIsSubmitting(true);

    try {
      const estimate = await createEstimate.mutateAsync({
        contractorId: profile.id,
        templateType: tradeType,
        templateId: templateId ?? undefined,
        homeownerName: homeownerName.trim(),
        homeownerEmail: homeownerEmail.trim(),
        homeownerPhone: homeownerPhone.trim() || undefined,
        projectDescription: projectDescription.trim() || undefined,
        parameters: { ...parameters, complexity },
        rangeLow: estimateRange.low,
        rangeHigh: estimateRange.high,
      });

      router.push(`/estimates/${estimate.id}`);
    } catch (error) {
      console.error("Failed to create estimate:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create estimate",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    estimateRange,
    profile,
    tradeType,
    createEstimate,
    templateId,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    projectDescription,
    parameters,
    complexity,
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
      loadingText: "Creating...",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, isSubmitting]);

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Send Estimate
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Enter the homeowner&apos;s details
      </p>

      {/* Price summary */}
      {estimateRange && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 text-center">
          <span className="text-lg font-bold text-blue-900">
            ${formatCurrency(estimateRange.total)}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Name
          </label>
          <input
            type="text"
            value={homeownerName}
            onChange={(e) => updateData({ homeownerName: e.target.value })}
            placeholder="John Smith"
            className={cn(
              "w-full min-h-[56px] px-4 py-3 text-base",
              "border rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.homeownerName ? "border-red-300" : "border-gray-300"
            )}
          />
          {errors.homeownerName && (
            <p className="mt-1 text-sm text-red-600">{errors.homeownerName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={homeownerEmail}
            onChange={(e) => updateData({ homeownerEmail: e.target.value })}
            placeholder="john@example.com"
            inputMode="email"
            className={cn(
              "w-full min-h-[56px] px-4 py-3 text-base",
              "border rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              errors.homeownerEmail ? "border-red-300" : "border-gray-300"
            )}
          />
          {errors.homeownerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.homeownerEmail}</p>
          )}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={homeownerPhone}
            onChange={(e) => updateData({ homeownerPhone: e.target.value })}
            placeholder="(555) 555-5555"
            inputMode="tel"
            className={cn(
              "w-full min-h-[56px] px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={projectDescription}
            onChange={(e) => updateData({ projectDescription: e.target.value })}
            placeholder="Any additional notes about the project..."
            rows={3}
            className={cn(
              "w-full px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}
