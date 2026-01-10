// Document definition builders for pdfmake
import type { Content, TDocumentDefinitions } from "pdfmake/build/pdfmake";
import {
  PDF_COLORS,
  PDF_STYLES,
  PDF_TABLE_LAYOUTS,
  PDF_DEFAULT_OPTIONS,
} from "./styles";
import type {
  DetailLevel,
  EstimatePDFData,
  PDFLineItem,
  PDFRoom,
  PDFTradeBreakdown,
} from "./types";

// Format currency without using Math.abs (per project rules)
function formatCurrency(value: number): string {
  const isNegative = value < 0;
  const absValue = isNegative ? -value : value;
  const formatted = absValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return isNegative ? `(${formatted})` : formatted;
}

// Format date
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Create header with logo and company name
function createHeader(data: EstimatePDFData): Content {
  const columns: Content[] = [];

  // Logo + company name column
  if (data.contractor.logoBase64) {
    columns.push({
      width: "auto",
      stack: [
        {
          image: data.contractor.logoBase64,
          width: 50,
          margin: [0, 0, 12, 0],
        },
      ],
    });
  }

  columns.push({
    width: "*",
    stack: [
      { text: data.contractor.companyName, style: "companyName" },
      { text: data.contractor.email, style: "bodySmall" },
      data.contractor.phone
        ? { text: data.contractor.phone, style: "bodySmall" }
        : null,
    ].filter(Boolean) as Content[],
  });

  // Estimate title column
  columns.push({
    width: "auto",
    stack: [
      { text: "ESTIMATE", style: "title" },
      { text: formatDate(data.createdAt), style: "subtitle" },
    ],
  });

  return {
    columns,
    columnGap: 20,
    margin: [0, 0, 0, 20],
  };
}

// Create recipient section
function createRecipientSection(data: EstimatePDFData): Content {
  const stack: Content[] = [
    { text: "PREPARED FOR", style: "label", margin: [0, 0, 0, 4] },
    { text: data.recipient.name, style: "body", bold: true },
    { text: data.recipient.email, style: "body" },
  ];

  if (data.recipient.phone) {
    stack.push({ text: data.recipient.phone, style: "body" });
  }

  if (data.projectName) {
    stack.push({ text: "", margin: [0, 8, 0, 0] });
    stack.push({ text: "PROJECT", style: "label", margin: [0, 0, 0, 4] });
    stack.push({ text: data.projectName, style: "body", bold: true });
  }

  if (data.projectDescription) {
    stack.push({ text: data.projectDescription, style: "bodySmall", margin: [0, 4, 0, 0] });
  }

  return {
    stack,
    margin: [0, 0, 0, 20],
  };
}

// Create horizontal divider
function createDivider(): Content {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 515,
        y2: 0,
        lineWidth: 1,
        lineColor: PDF_COLORS.border,
      },
    ],
    margin: [0, 8, 0, 8],
  };
}

// Create simple totals box
function createSimpleTotalsBox(data: EstimatePDFData): Content {
  const hasRange = data.rangeLow !== undefined && data.rangeHigh !== undefined && data.rangeLow !== data.rangeHigh;
  const totalText = hasRange
    ? `${formatCurrency(data.rangeLow!)} - ${formatCurrency(data.rangeHigh!)}`
    : formatCurrency(data.total);

  return {
    table: {
      widths: ["*", "auto"],
      body: [
        [
          { text: "TOTAL ESTIMATE", style: "grandTotalLabel" },
          { text: totalText, style: "grandTotalValue" },
        ],
      ],
    },
    layout: PDF_TABLE_LAYOUTS.totals,
    margin: [0, 20, 0, 0],
  };
}

// Create line items table
function createLineItemsTable(lineItems: PDFLineItem[]): Content {
  const body: Content[][] = [
    // Header row
    [
      { text: "Description", style: "tableHeader" },
      { text: "Qty", style: "tableHeader", alignment: "right" as const },
      { text: "Rate", style: "tableHeader", alignment: "right" as const },
      { text: "Amount", style: "tableHeader", alignment: "right" as const },
    ],
  ];

  // Data rows
  for (const item of lineItems) {
    body.push([
      { text: item.description, style: "tableCell" },
      {
        text: item.quantity ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : "-",
        style: "tableCellRight",
      },
      { text: item.rate ? formatCurrency(item.rate) : "-", style: "tableCellRight" },
      { text: formatCurrency(item.amount), style: "tableCellRight" },
    ]);
  }

  return {
    table: {
      headerRows: 1,
      widths: ["*", 60, 70, 80],
      body,
    },
    layout: PDF_TABLE_LAYOUTS.lightHorizontal,
  };
}

// Create rooms table for extra detailed view
function createRoomsTable(rooms: PDFRoom[]): Content {
  const body: Content[][] = [
    // Header row
    [
      { text: "Room", style: "tableHeader" },
      { text: "Walls", style: "tableHeader", alignment: "right" as const },
      { text: "Ceiling", style: "tableHeader", alignment: "right" as const },
      { text: "Total", style: "tableHeader", alignment: "right" as const },
    ],
  ];

  // Data rows
  for (const room of rooms) {
    body.push([
      { text: room.name, style: "tableCell" },
      { text: `${room.wallSqft.toLocaleString()} sqft`, style: "tableCellRight" },
      { text: `${room.ceilingSqft.toLocaleString()} sqft`, style: "tableCellRight" },
      { text: `${room.totalSqft.toLocaleString()} sqft`, style: "tableCellRight" },
    ]);
  }

  // Summary row
  const totalWall = rooms.reduce((sum, r) => sum + r.wallSqft, 0);
  const totalCeiling = rooms.reduce((sum, r) => sum + r.ceilingSqft, 0);
  const totalSqft = rooms.reduce((sum, r) => sum + r.totalSqft, 0);

  body.push([
    { text: "Total", style: "tableCell", bold: true },
    { text: `${totalWall.toLocaleString()} sqft`, style: "tableCellRight", bold: true },
    { text: `${totalCeiling.toLocaleString()} sqft`, style: "tableCellRight", bold: true },
    { text: `${totalSqft.toLocaleString()} sqft`, style: "tableCellRight", bold: true },
  ]);

  return {
    table: {
      headerRows: 1,
      widths: ["*", 80, 80, 80],
      body,
    },
    layout: PDF_TABLE_LAYOUTS.lightHorizontal,
  };
}

// Create trade breakdown section
function createTradeBreakdown(trade: PDFTradeBreakdown, showRooms: boolean): Content[] {
  const content: Content[] = [
    { text: trade.label, style: "tradeHeader" },
  ];

  // Room breakdown for extra detailed
  if (showRooms && trade.rooms && trade.rooms.length > 0) {
    content.push(createRoomsTable(trade.rooms));
  }

  // Line items for detailed view
  if (trade.lineItems && trade.lineItems.length > 0) {
    content.push(createLineItemsTable(trade.lineItems));
  }

  // Subtotals
  const subtotalsBody: Content[][] = [];

  if (trade.materialSubtotal > 0) {
    subtotalsBody.push([
      { text: "Materials", style: "subtotalLabel" },
      { text: formatCurrency(trade.materialSubtotal), style: "subtotalValue" },
    ]);
  }

  if (trade.laborSubtotal > 0) {
    subtotalsBody.push([
      { text: "Labor", style: "subtotalLabel" },
      { text: formatCurrency(trade.laborSubtotal), style: "subtotalValue" },
    ]);
  }

  if (trade.addonsSubtotal > 0) {
    subtotalsBody.push([
      { text: "Add-ons", style: "subtotalLabel" },
      { text: formatCurrency(trade.addonsSubtotal), style: "subtotalValue" },
    ]);
  }

  if (trade.complexityAdjustment !== 0 && trade.complexityLabel) {
    subtotalsBody.push([
      { text: `Complexity (${trade.complexityLabel})`, style: "subtotalLabel" },
      { text: formatCurrency(trade.complexityAdjustment), style: "subtotalValue" },
    ]);
  }

  // Trade total
  subtotalsBody.push([
    { text: "Trade Total", style: "totalLabel" },
    { text: formatCurrency(trade.total), style: "totalValue" },
  ]);

  if (subtotalsBody.length > 0) {
    content.push({
      table: {
        widths: ["*", "auto"],
        body: subtotalsBody,
      },
      layout: PDF_TABLE_LAYOUTS.headerOnly,
      margin: [0, 12, 0, 0],
    });
  }

  return content;
}

// Create footer
function createFooter(data: EstimatePDFData): Content {
  const lines: string[] = [];

  if (data.validUntil) {
    lines.push(`Valid until ${formatDate(data.validUntil)}`);
  }

  lines.push(`Contact: ${data.contractor.email}`);

  if (data.contractor.phone) {
    lines.push(data.contractor.phone);
  }

  return {
    stack: lines.map((line) => ({ text: line, style: "footer" })),
    margin: [0, 30, 0, 0],
  };
}

// Build Simple PDF document
export function buildSimplePDF(data: EstimatePDFData): TDocumentDefinitions {
  const content: Content[] = [
    createHeader(data),
    createRecipientSection(data),
    createDivider(),
    createSimpleTotalsBox(data),
    createFooter(data),
  ];

  return {
    ...PDF_DEFAULT_OPTIONS,
    content,
  };
}

// Build Detailed PDF document
export function buildDetailedPDF(data: EstimatePDFData): TDocumentDefinitions {
  const content: Content[] = [
    createHeader(data),
    createRecipientSection(data),
    createDivider(),
  ];

  // Single trade estimate
  if (data.singleTrade) {
    content.push({ text: data.singleTrade.tradeLabel, style: "sectionHeader" });

    // Line items
    if (data.singleTrade.lineItems && data.singleTrade.lineItems.length > 0) {
      content.push(createLineItemsTable(data.singleTrade.lineItems));
    }

    // Subtotals section
    const subtotalsBody: Content[][] = [];

    if (data.singleTrade.materialSubtotal && data.singleTrade.materialSubtotal > 0) {
      subtotalsBody.push([
        { text: "Materials", style: "subtotalLabel" },
        { text: formatCurrency(data.singleTrade.materialSubtotal), style: "subtotalValue" },
      ]);
    }

    if (data.singleTrade.laborSubtotal && data.singleTrade.laborSubtotal > 0) {
      subtotalsBody.push([
        { text: "Labor", style: "subtotalLabel" },
        { text: formatCurrency(data.singleTrade.laborSubtotal), style: "subtotalValue" },
      ]);
    }

    if (data.singleTrade.addonsSubtotal && data.singleTrade.addonsSubtotal > 0) {
      subtotalsBody.push([
        { text: "Add-ons", style: "subtotalLabel" },
        { text: formatCurrency(data.singleTrade.addonsSubtotal), style: "subtotalValue" },
      ]);
    }

    if (data.singleTrade.complexityAdjustment && data.singleTrade.complexityAdjustment !== 0) {
      subtotalsBody.push([
        { text: `Complexity (${data.singleTrade.complexityLabel || "Adjusted"})`, style: "subtotalLabel" },
        { text: formatCurrency(data.singleTrade.complexityAdjustment), style: "subtotalValue" },
      ]);
    }

    if (subtotalsBody.length > 0) {
      content.push({
        table: {
          widths: ["*", "auto"],
          body: subtotalsBody,
        },
        layout: PDF_TABLE_LAYOUTS.headerOnly,
        margin: [0, 12, 0, 0],
      });
    }
  }

  // Multi-trade project
  if (data.trades && data.trades.length > 0) {
    for (const trade of data.trades) {
      content.push(...createTradeBreakdown(trade, false));
    }
  }

  // Grand total
  content.push(createSimpleTotalsBox(data));
  content.push(createFooter(data));

  return {
    ...PDF_DEFAULT_OPTIONS,
    content,
  };
}

// Build Extra Detailed PDF document
export function buildExtraDetailedPDF(data: EstimatePDFData): TDocumentDefinitions {
  const content: Content[] = [
    createHeader(data),
    createRecipientSection(data),
    createDivider(),
  ];

  // Rooms summary (if available)
  if (data.rooms && data.rooms.length > 0) {
    content.push({ text: "Project Scope", style: "sectionHeader" });
    content.push(createRoomsTable(data.rooms));
  }

  // Multi-trade project with room breakdown
  if (data.trades && data.trades.length > 0) {
    for (const trade of data.trades) {
      content.push(...createTradeBreakdown(trade, true));
    }

    // Project summary
    content.push({ text: "Project Summary", style: "sectionHeader" });

    const summaryBody: Content[][] = data.trades.map((trade) => [
      { text: trade.label, style: "subtotalLabel" },
      { text: formatCurrency(trade.total), style: "subtotalValue" },
    ]);

    summaryBody.push([
      { text: "PROJECT TOTAL", style: "grandTotalLabel" },
      { text: formatCurrency(data.total), style: "grandTotalValue" },
    ]);

    content.push({
      table: {
        widths: ["*", "auto"],
        body: summaryBody,
      },
      layout: PDF_TABLE_LAYOUTS.totals,
    });
  } else {
    // Single trade - show detailed breakdown
    content.push(createSimpleTotalsBox(data));
  }

  content.push(createFooter(data));

  return {
    ...PDF_DEFAULT_OPTIONS,
    content,
  };
}

// Main builder function
export function buildPDFDocument(
  data: EstimatePDFData,
  detailLevel: DetailLevel
): TDocumentDefinitions {
  switch (detailLevel) {
    case "simple":
      return buildSimplePDF(data);
    case "detailed":
      return buildDetailedPDF(data);
    case "extra_detailed":
      return buildExtraDetailedPDF(data);
    default:
      return buildDetailedPDF(data);
  }
}
