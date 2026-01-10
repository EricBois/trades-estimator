// PDF Generator using pdfmake
import { buildPDFDocument } from "./documentBuilder";
import type { DetailLevel, EstimatePDFData } from "./types";

// Lazy load pdfmake to handle Next.js/Turbopack bundling issues
async function getPdfMake() {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  // Set up fonts - pdfFonts IS the vfs directly
  pdfMake.vfs = pdfFonts as unknown as Record<string, string>;

  return pdfMake;
}

// Convert image URL to base64 data URL with timeout
export async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Prepare PDF data with logo converted to base64
export async function preparePDFData(
  data: EstimatePDFData
): Promise<EstimatePDFData> {
  if (data.contractor.logoUrl && !data.contractor.logoBase64) {
    const logoBase64 = await imageUrlToBase64(data.contractor.logoUrl);
    if (logoBase64) {
      return {
        ...data,
        contractor: {
          ...data.contractor,
          logoBase64,
        },
      };
    }
  }
  return data;
}

// Generate PDF and return as blob
export async function generatePDFBlob(
  data: EstimatePDFData,
  detailLevel: DetailLevel
): Promise<Blob> {
  const pdfMake = await getPdfMake();
  const preparedData = await preparePDFData(data);
  const docDefinition = buildPDFDocument(preparedData, detailLevel);

  // Generate PDF using promise-based API (pdfmake 0.3+)
  const pdfDocGenerator = pdfMake.createPdf(docDefinition) as unknown as {
    pdfDocumentPromise: Promise<{
      end: () => void;
      on: (event: string, cb: (data: unknown) => void) => void;
    }>;
  };

  // Get the PDF document (readable stream)
  const pdfDoc = await pdfDocGenerator.pdfDocumentPromise;

  // Collect stream data
  const chunks: Uint8Array[] = [];
  return new Promise<Blob>((resolve, reject) => {
    pdfDoc.on("data", (chunk) => {
      chunks.push(chunk as Uint8Array);
    });

    pdfDoc.on("end", () => {
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const buffer = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }
      const blob = new Blob([buffer], { type: "application/pdf" });
      resolve(blob);
    });

    pdfDoc.on("error", (err) => {
      reject(err as Error);
    });

    // Trigger the document to finish
    pdfDoc.end();
  });
}

// Generate PDF and return as blob URL (for preview)
export async function generatePDFBlobUrl(
  data: EstimatePDFData,
  detailLevel: DetailLevel
): Promise<string> {
  const blob = await generatePDFBlob(data, detailLevel);
  return URL.createObjectURL(blob);
}

// Generate and download PDF
export async function downloadPDF(
  data: EstimatePDFData,
  detailLevel: DetailLevel,
  filename?: string
): Promise<void> {
  const blob = await generatePDFBlob(data, detailLevel);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `estimate-${data.recipient.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate PDF and open in new window (for print)
export async function printPDF(
  data: EstimatePDFData,
  detailLevel: DetailLevel
): Promise<void> {
  const blob = await generatePDFBlob(data, detailLevel);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// Revoke blob URL to free memory
export function revokePDFBlobUrl(blobUrl: string): void {
  URL.revokeObjectURL(blobUrl);
}

// Generate PDF and return as Buffer (for server-side email attachment)
export async function generatePDFBuffer(
  data: EstimatePDFData,
  detailLevel: DetailLevel
): Promise<Buffer> {
  const pdfMake = await getPdfMake();
  const preparedData = await preparePDFData(data);
  const docDefinition = buildPDFDocument(preparedData, detailLevel);

  // Generate PDF using promise-based API (pdfmake 0.3+)
  const pdfDocGenerator = pdfMake.createPdf(docDefinition) as unknown as {
    pdfDocumentPromise: Promise<{
      end: () => void;
      on: (event: string, cb: (data: unknown) => void) => void;
    }>;
  };

  // Get the PDF document (readable stream)
  const pdfDoc = await pdfDocGenerator.pdfDocumentPromise;

  // Collect stream data
  const chunks: Uint8Array[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on("data", (chunk) => {
      chunks.push(chunk as Uint8Array);
    });

    pdfDoc.on("end", () => {
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const buffer = Buffer.alloc(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(buffer);
    });

    pdfDoc.on("error", (err) => {
      reject(err as Error);
    });

    // Trigger the document to finish
    pdfDoc.end();
  });
}
