// PDF Generation Types

export const DETAIL_LEVELS = ["simple", "detailed", "extra_detailed"] as const;
export type DetailLevel = (typeof DETAIL_LEVELS)[number];

// Contractor info for PDF header
export interface PDFContractor {
  companyName: string;
  email: string;
  phone?: string;
  logoUrl?: string;
  logoBase64?: string; // Converted logo for embedding
}

// Homeowner/client info
export interface PDFRecipient {
  name: string;
  email: string;
  phone?: string;
}

// Single line item for detailed view
export interface PDFLineItem {
  description: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  amount: number;
}

// Room data for extra detailed view
export interface PDFRoom {
  name: string;
  wallSqft: number;
  ceilingSqft: number;
  totalSqft: number;
  subtotal?: number;
}

// Trade breakdown for projects
export interface PDFTradeBreakdown {
  tradeType: string;
  label: string;
  rooms?: PDFRoom[];
  lineItems?: PDFLineItem[];
  materialSubtotal: number;
  laborSubtotal: number;
  addonsSubtotal: number;
  complexityLabel?: string;
  complexityAdjustment: number;
  total: number;
}

// Addon item
export interface PDFAddon {
  label: string;
  quantity: number;
  total: number;
}

// Main data structure for PDF generation
export interface EstimatePDFData {
  // Header info
  contractor: PDFContractor;
  recipient: PDFRecipient;

  // Estimate details
  estimateId?: string;
  projectName?: string;
  projectDescription?: string;

  // For single-trade estimates
  singleTrade?: {
    tradeType: string;
    tradeLabel: string;
    lineItems?: PDFLineItem[];
    materialSubtotal?: number;
    laborSubtotal?: number;
    addonsSubtotal?: number;
    addons?: PDFAddon[];
    complexityLabel?: string;
    complexityAdjustment?: number;
  };

  // For multi-trade projects
  trades?: PDFTradeBreakdown[];
  rooms?: PDFRoom[];

  // Totals (always present)
  subtotal?: number;
  total: number;
  rangeLow?: number;
  rangeHigh?: number;

  // Dates
  createdAt: Date;
  validUntil?: Date;
}

// Detail level descriptions
export const DETAIL_LEVEL_INFO: Record<
  DetailLevel,
  { label: string; description: string }
> = {
  simple: {
    label: "Simple",
    description: "Totals only",
  },
  detailed: {
    label: "Detailed",
    description: "Line items + subtotals",
  },
  extra_detailed: {
    label: "Extra Detailed",
    description: "Room-by-room breakdown",
  },
};
