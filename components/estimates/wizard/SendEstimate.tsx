"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizard } from "react-use-wizard";
import { z } from "zod";
import { Mail, User, Phone, FileText, Users, Edit2 } from "lucide-react";
import { useWizardData } from "./WizardDataContext";
import { useWizardFooter } from "./WizardFooterContext";
import { useCreateEstimate, useSendEstimateEmail } from "@/hooks";
import { useClient } from "@/hooks/useClients";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateEstimateRange,
  formatCurrency,
} from "@/lib/estimateCalculations";
import { WIZARD_TRADE_TYPES, WIZARD_COMPLEXITY_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EstimatePDFData, PDFLineItem } from "@/lib/pdf/types";

export function SendEstimate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { goToStep } = useWizard();
  const { profile, user } = useAuth();
  const { setFooterConfig } = useWizardFooter();
  const createEstimate = useCreateEstimate();
  const sendEstimateEmail = useSendEstimateEmail();
  const {
    tradeType,
    templateId,
    template,
    parameters,
    complexity,
    clientId,
    estimateName,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    projectDescription,
    pdfDetailLevel,
    updateData,
  } = useWizardData();

  // Fetch selected client details for display
  const { data: selectedClient } = useClient(clientId ?? undefined);

  // Get clientId from URL if present (for deep linking)
  const urlClientId = searchParams.get("clientId");
  const { data: urlClient } = useClient(urlClientId ?? undefined);

  // Initialize clientId from URL on mount
  useEffect(() => {
    if (urlClientId && !clientId) {
      updateData({ clientId: urlClientId });
    }
  }, [urlClientId, clientId, updateData]);

  // Auto-fill homeowner fields when client is loaded from URL
  useEffect(() => {
    if (urlClient && !homeownerName && !homeownerEmail) {
      updateData({
        homeownerName: urlClient.name,
        homeownerEmail: urlClient.email ?? "",
        homeownerPhone: urlClient.phone ?? "",
      });
    }
  }, [urlClient, homeownerName, homeownerEmail, updateData]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if we have an email (from client or manual entry)
  const hasEmail = !!(selectedClient?.email || homeownerEmail.trim());

  // Get the effective recipient data (client takes precedence)
  const recipientName = selectedClient?.name || homeownerName;
  const recipientEmail = selectedClient?.email || homeownerEmail;
  const recipientPhone = selectedClient?.phone || homeownerPhone;

  // Calculate estimate range
  const estimateRange = useMemo(() => {
    return calculateEstimateRange({
      template,
      parameters,
      complexity,
      hourlyRate: profile?.hourly_rate ?? 75,
    });
  }, [template, parameters, complexity, profile?.hourly_rate]);

  // Get display values for PDF
  const tradeLabel = useMemo(() => {
    return WIZARD_TRADE_TYPES.find((t) => t.value === tradeType)?.label ?? tradeType ?? "Estimate";
  }, [tradeType]);

  const complexityInfo = useMemo(() => {
    return WIZARD_COMPLEXITY_LEVELS.find((c) => c.value === complexity);
  }, [complexity]);

  // Build PDF data
  const pdfData = useMemo((): EstimatePDFData | null => {
    if (!profile || !estimateRange) return null;

    // Build line items for detailed view
    const lineItems: PDFLineItem[] = [];

    // Add labor
    if (template?.baseLaborHours) {
      const laborHours = template.baseLaborHours;
      const laborRate = profile.hourly_rate ?? 75;
      lineItems.push({
        description: "Labor",
        quantity: laborHours,
        unit: "hrs",
        rate: laborRate,
        amount: laborHours * laborRate,
      });
    }

    // Add material
    if (template?.baseMaterialCost) {
      lineItems.push({
        description: "Materials",
        amount: template.baseMaterialCost,
      });
    }

    // Calculate complexity adjustment
    const baseAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const complexityMultiplier = complexityInfo?.multiplier ?? 1;
    const complexityAdjustment = baseAmount * (complexityMultiplier - 1);

    return {
      contractor: {
        companyName: profile.company_name ?? "Contractor",
        email: user?.email ?? "",
        logoUrl: profile.logo_url ?? undefined,
      },
      recipient: {
        name: recipientName || "Homeowner",
        email: recipientEmail || "",
        phone: recipientPhone || undefined,
      },
      projectName: tradeLabel,
      projectDescription: projectDescription || undefined,
      singleTrade: {
        tradeType: tradeType ?? "",
        tradeLabel,
        lineItems: lineItems.length > 0 ? lineItems : undefined,
        materialSubtotal: template?.baseMaterialCost,
        laborSubtotal: template?.baseLaborHours
          ? template.baseLaborHours * (profile.hourly_rate ?? 75)
          : undefined,
        complexityLabel: complexityInfo?.label,
        complexityAdjustment:
          complexityAdjustment !== 0 ? complexityAdjustment : undefined,
      },
      total: estimateRange.total,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  }, [
    profile,
    user,
    template,
    estimateRange,
    tradeType,
    tradeLabel,
    complexityInfo,
    recipientName,
    recipientEmail,
    recipientPhone,
    projectDescription,
  ]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Only validate manual entry fields if no client is selected
    if (!selectedClient) {
      if (!homeownerName.trim()) {
        newErrors.homeownerName = "Name is required";
      }
      if (!homeownerEmail.trim()) {
        newErrors.homeownerEmail = "Email is required";
      } else if (!z.string().email().safeParse(homeownerEmail).success) {
        newErrors.homeownerEmail = "Please enter a valid email";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate() || !estimateRange || !profile || !tradeType || !pdfData) return;

    setIsSubmitting(true);

    try {
      // Create the estimate first
      const estimate = await createEstimate.mutateAsync({
        contractorId: profile.id,
        clientId: clientId ?? undefined,
        templateType: tradeType,
        templateId: templateId ?? undefined,
        homeownerName: recipientName?.trim() || "",
        homeownerEmail: recipientEmail?.trim() || "",
        homeownerPhone: recipientPhone?.trim() || undefined,
        projectDescription: projectDescription.trim() || undefined,
        parameters: { ...parameters, complexity },
        rangeLow: estimateRange.low,
        rangeHigh: estimateRange.high,
      });

      // Send the email with PDF attachment
      try {
        await sendEstimateEmail.mutateAsync({
          estimateId: estimate.id,
          recipientEmail: recipientEmail?.trim() || "",
          recipientName: recipientName?.trim() || "",
          recipientPhone: recipientPhone?.trim() || undefined,
          projectName: tradeLabel,
          projectDescription: projectDescription.trim() || undefined,
          rangeLow: estimateRange.low,
          rangeHigh: estimateRange.high,
          pdfData,
          detailLevel: pdfDetailLevel,
        });
      } catch (emailError) {
        // Log but don't fail the whole operation - estimate was created
        console.error("Failed to send email:", emailError);
        // Still redirect, estimate was created
      }

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
    sendEstimateEmail,
    clientId,
    templateId,
    recipientName,
    recipientEmail,
    recipientPhone,
    projectDescription,
    parameters,
    complexity,
    pdfData,
    pdfDetailLevel,
    tradeLabel,
    router,
  ]);

  // Use ref to avoid useEffect dependency on handleSubmit
  const handleSubmitRef = useRef(handleSubmit);

  // Update ref in an effect to satisfy linter
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // Configure footer - always show Send Estimate but disable when no email
  useEffect(() => {
    setFooterConfig({
      onContinue: () => handleSubmitRef.current(),
      continueText: "Send Estimate",
      icon: "send",
      isLoading: isSubmitting,
      loadingText: "Sending...",
      disabled: !hasEmail,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, isSubmitting, hasEmail]);

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
        {/* Estimate Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Estimate Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={estimateName}
            onChange={(e) => updateData({ estimateName: e.target.value })}
            placeholder="e.g., Kitchen Drywall"
            className={cn(
              "w-full min-h-[56px] px-4 py-3 text-base",
              "border border-gray-300 rounded-xl bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
        </div>

        {/* Selected Client Display - shows when client is selected */}
        {selectedClient ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedClient.name}</p>
                  {selectedClient.email ? (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedClient.email}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 mt-1">No email on file</p>
                  )}
                  {selectedClient.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedClient.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Change
              </button>
            </div>
          </div>
        ) : (
          /* Manual entry fields - show when no client selected */
          <>
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
          </>
        )}

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
