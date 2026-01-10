"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  generatePDFBlobUrl,
  downloadPDF,
  revokePDFBlobUrl,
  type DetailLevel,
  type EstimatePDFData,
} from "@/lib/pdf";

export interface UsePDFGeneratorReturn {
  // State
  pdfBlobUrl: string | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generate: (data: EstimatePDFData, detailLevel: DetailLevel) => Promise<void>;
  download: (
    data: EstimatePDFData,
    detailLevel: DetailLevel,
    filename?: string
  ) => Promise<void>;
  cleanup: () => void;
}

export function usePDFGenerator(): UsePDFGeneratorReturn {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track blob URL for cleanup
  const currentBlobUrlRef = useRef<string | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (currentBlobUrlRef.current) {
      revokePDFBlobUrl(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
    setPdfBlobUrl(null);
    setError(null);
  }, []);

  // Generate PDF for preview
  const generate = useCallback(
    async (data: EstimatePDFData, detailLevel: DetailLevel) => {
      try {
        setIsGenerating(true);
        setError(null);

        // Cleanup previous blob URL
        if (currentBlobUrlRef.current) {
          revokePDFBlobUrl(currentBlobUrlRef.current);
        }

        // Generate new PDF
        const blobUrl = await generatePDFBlobUrl(data, detailLevel);
        currentBlobUrlRef.current = blobUrl;
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        console.error("Error generating PDF:", err);
        const message =
          err instanceof Error ? err.message : "Failed to generate PDF";
        setError(message);
        setPdfBlobUrl(null);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Download PDF
  const download = useCallback(
    async (
      data: EstimatePDFData,
      detailLevel: DetailLevel,
      filename?: string
    ) => {
      try {
        setIsGenerating(true);
        setError(null);
        await downloadPDF(data, detailLevel, filename);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to download PDF";
        setError(message);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        revokePDFBlobUrl(currentBlobUrlRef.current);
      }
    };
  }, []);

  return {
    pdfBlobUrl,
    isGenerating,
    error,
    generate,
    download,
    cleanup,
  };
}
