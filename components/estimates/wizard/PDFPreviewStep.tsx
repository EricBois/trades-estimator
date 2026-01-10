"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useWizard } from "react-use-wizard";
import { Download, Loader2, AlertCircle, FileText } from "lucide-react";
import { useWizardData } from "./WizardDataContext";
import { useWizardFooter } from "./WizardFooterContext";
import { DetailLevelSelector } from "./DetailLevelSelector";
import { useAuth } from "@/contexts/AuthContext";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import {
  calculateEstimateRange,
  formatCurrency,
} from "@/lib/estimateCalculations";
import { WIZARD_TRADE_TYPES, WIZARD_COMPLEXITY_LEVELS } from "@/lib/constants";
import type { DetailLevel, EstimatePDFData, PDFLineItem } from "@/lib/pdf";

export function PDFPreviewStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    tradeType,
    template,
    parameters,
    complexity,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    projectDescription,
    pdfDetailLevel,
    updateData,
  } = useWizardData();
  const { profile, user } = useAuth();
  const { pdfBlobUrl, isGenerating, error, generate, download, cleanup } =
    usePDFGenerator();

  // Local detail level state that syncs with context
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(pdfDetailLevel);

  // Sync detail level changes to context
  const handleDetailLevelChange = useCallback(
    (level: DetailLevel) => {
      setDetailLevel(level);
      updateData({ pdfDetailLevel: level });
    },
    [updateData]
  );

  // Configure footer
  const handleContinue = useCallback(() => {
    cleanup();
    nextStep();
  }, [nextStep, cleanup]);

  useEffect(() => {
    setFooterConfig({
      onContinue: handleContinue,
      continueText: "Continue to Send",
    });
    return () => setFooterConfig(null);
  }, [setFooterConfig, handleContinue]);

  // Calculate estimate range
  const estimateRange = useMemo(() => {
    return calculateEstimateRange({
      template,
      parameters,
      complexity,
      hourlyRate: profile?.hourly_rate ?? 75,
    });
  }, [template, parameters, complexity, profile?.hourly_rate]);

  // Get display values
  const tradeLabel =
    WIZARD_TRADE_TYPES.find((t) => t.value === tradeType)?.label ?? tradeType ?? "Estimate";
  const complexityInfo = WIZARD_COMPLEXITY_LEVELS.find(
    (c) => c.value === complexity
  );
  const complexityLabel = complexityInfo?.label ?? complexity;

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
        name: homeownerName || "Homeowner",
        email: homeownerEmail || "",
        phone: homeownerPhone || undefined,
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
        complexityLabel: complexityLabel,
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
    complexityLabel,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    projectDescription,
  ]);

  // Generate PDF when data or detail level changes
  useEffect(() => {
    if (pdfData) {
      generate(pdfData, detailLevel);
    }
  }, [pdfData, detailLevel, generate]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (pdfData) {
      const filename = `estimate-${homeownerName.toLowerCase().replace(/\s+/g, "-") || "customer"}-${new Date().toISOString().split("T")[0]}.pdf`;
      await download(pdfData, detailLevel, filename);
    }
  }, [pdfData, detailLevel, homeownerName, download]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        PDF Preview
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Review and customize your estimate before sending
      </p>

      {/* Detail Level Selector */}
      <div className="mb-6">
        <DetailLevelSelector
          value={detailLevel}
          onChange={handleDetailLevelChange}
          showExtraDetailed={false} // No rooms for single-trade estimates
        />
      </div>

      {/* PDF Preview Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Preview</span>
          </div>
          <button
            onClick={handleDownload}
            disabled={isGenerating || !pdfBlobUrl}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>

        {/* PDF Embed */}
        <div className="relative min-h-150 bg-gray-100">
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-500">
                  Generating PDF...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center gap-3 text-center px-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          {pdfBlobUrl && !isGenerating && !error && (
            <iframe
              src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-175 border-0"
              title="Estimate PDF Preview"
            />
          )}

          {!pdfBlobUrl && !isGenerating && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-sm text-gray-500">
                Loading preview...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Info */}
      {estimateRange && (
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-600 mb-1">Estimate Total</p>
          <p className="text-2xl font-bold text-blue-900">
            ${formatCurrency(estimateRange.total)}
          </p>
        </div>
      )}
    </div>
  );
}
