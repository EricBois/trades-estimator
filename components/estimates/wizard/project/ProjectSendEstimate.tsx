"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWizard } from "react-use-wizard";
import { Mail, Phone, User, FileText, Users, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { useCreateProject, useCreateEstimate, useSendEstimateEmail } from "@/hooks";
import { useClient } from "@/hooks/useClients";
import { StepHeader } from "@/components/ui/StepHeader";
import { getTradeDisplayInfo } from "@/lib/project/types";
import type {
  EstimatePDFData,
  PDFTradeBreakdown,
  PDFRoom,
  DetailLevel,
} from "@/lib/pdf/types";

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
  const searchParams = useSearchParams();
  const { goToStep } = useWizard();
  const { user, profile } = useAuth();
  const { setFooterConfig } = useWizardFooter();
  const {
    projectName,
    setProjectName,
    clientId,
    setClientId,
    enabledTrades,
    projectTotals,
    tradeTotals,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
    roomsHook,
    getTradeRoomViews,
  } = useProjectEstimateContext();

  // Fetch selected client details for display
  const { data: selectedClient } = useClient(clientId ?? undefined);

  // Default detail level for PDF
  const pdfDetailLevel: DetailLevel = "detailed";

  const createProject = useCreateProject();
  const createEstimate = useCreateEstimate();
  const sendEstimateEmail = useSendEstimateEmail();

  // Get clientId from URL if present (for deep linking)
  const urlClientId = searchParams.get("clientId");
  const { data: urlClient } = useClient(urlClientId ?? undefined);

  // Form state (only used when no client is selected)
  const [homeownerName, setHomeownerName] = useState("");
  const [homeownerEmail, setHomeownerEmail] = useState("");
  const [homeownerPhone, setHomeownerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize clientId from URL on mount
  useEffect(() => {
    if (urlClientId && !clientId) {
      setClientId(urlClientId);
    }
  }, [urlClientId, clientId, setClientId]);

  // Auto-fill homeowner fields when client is loaded from URL
  useEffect(() => {
    if (urlClient && !homeownerName && !homeownerEmail) {
      setHomeownerName(urlClient.name);
      setHomeownerEmail(urlClient.email ?? "");
      setHomeownerPhone(urlClient.phone ?? "");
    }
  }, [urlClient, homeownerName, homeownerEmail]);

  // Determine if we have an email (from client or manual entry)
  const hasEmail = !!(selectedClient?.email || homeownerEmail.trim());

  // Get the effective recipient data (client takes precedence)
  const recipientName = selectedClient?.name || homeownerName;
  const recipientEmail = selectedClient?.email || homeownerEmail;
  const recipientPhone = selectedClient?.phone || homeownerPhone;

  // Validation - only validate manual fields when no client
  const isEmailValid = !selectedClient && homeownerEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(homeownerEmail) : true;
  const canSubmit = selectedClient ? true : (homeownerName.trim() !== "" && homeownerEmail.trim() !== "" && isEmailValid);

  // Build PDF data for email
  const buildPdfData = useCallback((): EstimatePDFData | null => {
    if (!profile) return null;

    // Build trade breakdowns
    const trades: PDFTradeBreakdown[] = enabledTrades.map((tradeType) => {
      const totals = tradeTotals[tradeType];
      const displayInfo = getTradeDisplayInfo(tradeType);

      // Build room data for this trade
      const tradeRoomViews = getTradeRoomViews(tradeType);
      const rooms: PDFRoom[] = tradeRoomViews
        .filter((r) => !r.excluded)
        .map((room) => ({
          name: room.name,
          wallSqft: room.effectiveWallSqft,
          ceilingSqft: room.effectiveCeilingSqft,
          totalSqft: room.effectiveTotalSqft,
        }));

      return {
        tradeType,
        label: displayInfo.label,
        rooms: rooms.length > 0 ? rooms : undefined,
        materialSubtotal: totals?.materialSubtotal ?? 0,
        laborSubtotal: totals?.laborSubtotal ?? 0,
        addonsSubtotal: totals?.addonsSubtotal ?? 0,
        complexityLabel:
          totals?.complexityMultiplier === 1
            ? undefined
            : totals?.complexityMultiplier === 0.8
              ? "Simple"
              : totals?.complexityMultiplier === 1.3
                ? "Complex"
                : undefined,
        complexityAdjustment: totals?.complexityAdjustment ?? 0,
        total: totals?.total ?? 0,
      };
    });

    // Build overall room summary
    const rooms: PDFRoom[] = roomsHook.rooms.map((room) => ({
      name: room.name,
      wallSqft: room.wallSqft,
      ceilingSqft: room.ceilingSqft,
      totalSqft: room.totalSqft,
    }));

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
      projectName: projectName || "Project Estimate",
      projectDescription: notes || undefined,
      trades,
      rooms: rooms.length > 0 ? rooms : undefined,
      total: projectTotals.combinedTotal,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  }, [
    profile,
    user,
    projectName,
    notes,
    recipientName,
    recipientEmail,
    recipientPhone,
    enabledTrades,
    tradeTotals,
    projectTotals,
    roomsHook.rooms,
    getTradeRoomViews,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!user || !canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create the project
      const project = await createProject.mutateAsync({
        contractorId: user.id,
        clientId: clientId ?? undefined,
        name: projectName || "Multi-Trade Project",
        homeownerName: recipientName || "",
        homeownerEmail: recipientEmail || "",
        homeownerPhone: recipientPhone || undefined,
        projectDescription: notes || undefined,
      });

      // 2. Save rooms to the new project
      await roomsHook.saveRooms(project.id);

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
          clientId: clientId ?? undefined,
          templateType: tradeType,
          homeownerName: recipientName || "",
          homeownerEmail: recipientEmail || "",
          homeownerPhone: recipientPhone || undefined,
          projectDescription: `${projectName} - ${tradeType.replace("_", " ")}`,
          parameters,
          rangeLow: totals.total,
          rangeHigh: totals.total,
          projectId: project.id,
        });
      }

      // 4. Send the email with PDF attachment (only if we have an email)
      const pdfData = buildPdfData();
      if (pdfData && recipientEmail) {
        try {
          await sendEstimateEmail.mutateAsync({
            projectId: project.id,
            recipientEmail: recipientEmail.trim(),
            recipientName: recipientName?.trim() || "",
            recipientPhone: recipientPhone?.trim() || undefined,
            projectName: projectName || "Multi-Trade Project",
            projectDescription: notes || undefined,
            rangeLow: projectTotals.combinedTotal,
            rangeHigh: projectTotals.combinedTotal,
            pdfData,
            detailLevel: pdfDetailLevel || "detailed",
          });
        } catch (emailError) {
          // Log but don't fail - project was created
          console.error("Failed to send email:", emailError);
        }
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
    clientId,
    projectName,
    recipientName,
    recipientEmail,
    recipientPhone,
    notes,
    roomsHook,
    enabledTrades,
    tradeTotals,
    hangingEstimate,
    finishingEstimate,
    paintingEstimate,
    createEstimate,
    sendEstimateEmail,
    buildPdfData,
    projectTotals,
    pdfDetailLevel,
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
      disabled: !hasEmail || !canSubmit,
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, isSubmitting, canSubmit, hasEmail]);

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        title="Send Estimate"
        description="Enter homeowner details to send this project estimate"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Project name - at the top */}
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
            </>
          )}

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
