"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useWizard } from "react-use-wizard";
import { Download, Loader2, AlertCircle, FileText } from "lucide-react";
import { useProjectEstimateContext } from "./ProjectEstimateContext";
import { useWizardFooter } from "../WizardFooterContext";
import { DetailLevelSelector } from "../DetailLevelSelector";
import { useAuth } from "@/contexts/AuthContext";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { formatCurrency } from "@/lib/estimateCalculations";
import { getTradeDisplayInfo } from "@/lib/project/types";
import type {
  DetailLevel,
  EstimatePDFData,
  PDFTradeBreakdown,
  PDFRoom,
} from "@/lib/pdf";

export function ProjectPDFPreviewStep() {
  const { nextStep } = useWizard();
  const { setFooterConfig } = useWizardFooter();
  const {
    projectName,
    enabledTrades,
    tradeTotals,
    projectTotals,
    roomsHook,
    getTradeRoomViews,
  } = useProjectEstimateContext();
  const { profile, user } = useAuth();
  const { pdfBlobUrl, isGenerating, error, generate, download, cleanup } =
    usePDFGenerator();

  // Local detail level state
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("detailed");

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

  // Check if we have rooms for extra detailed view
  const hasRooms = roomsHook.rooms.length > 0;

  // Build PDF data
  const pdfData = useMemo((): EstimatePDFData | null => {
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
        name: "Homeowner", // Will be filled in on send step
        email: "",
      },
      projectName: projectName || "Project Estimate",
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
    enabledTrades,
    tradeTotals,
    projectTotals,
    roomsHook.rooms,
    getTradeRoomViews,
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
      const filename = `project-estimate-${projectName.toLowerCase().replace(/\s+/g, "-") || "project"}-${new Date().toISOString().split("T")[0]}.pdf`;
      await download(pdfData, detailLevel, filename);
    }
  }, [pdfData, detailLevel, projectName, download]);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
        PDF Preview
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Review and customize your project estimate before sending
      </p>

      {/* Detail Level Selector */}
      <div className="mb-6">
        <DetailLevelSelector
          value={detailLevel}
          onChange={setDetailLevel}
          showExtraDetailed={hasRooms}
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
              title="Project Estimate PDF Preview"
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

      {/* Project Summary */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-blue-600 mb-3 text-center">Project Total</p>
        <p className="text-3xl font-bold text-blue-900 text-center mb-4">
          ${formatCurrency(projectTotals.combinedTotal)}
        </p>

        {/* Trade breakdown */}
        <div className="space-y-2">
          {enabledTrades.map((tradeType) => {
            const totals = tradeTotals[tradeType];
            const displayInfo = getTradeDisplayInfo(tradeType);
            return (
              <div
                key={tradeType}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-blue-700">{displayInfo.label}</span>
                <span className="font-medium text-blue-900">
                  ${formatCurrency(totals?.total ?? 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
