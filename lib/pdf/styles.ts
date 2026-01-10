// PDF Styling Constants for pdfmake

export const PDF_COLORS = {
  primary: "#1e40af", // Blue-800
  primaryLight: "#3b82f6", // Blue-500
  secondary: "#6b7280", // Gray-500
  text: "#1f2937", // Gray-800
  textLight: "#4b5563", // Gray-600
  textMuted: "#9ca3af", // Gray-400
  border: "#e5e7eb", // Gray-200
  background: "#f9fafb", // Gray-50
  white: "#ffffff",
};

export const PDF_FONTS = {
  default: "Roboto",
};

// pdfmake style definitions
export const PDF_STYLES = {
  // Headers
  header: {
    fontSize: 24,
    bold: true,
    color: PDF_COLORS.text,
  },
  companyName: {
    fontSize: 20,
    bold: true,
    color: PDF_COLORS.primary,
  },
  title: {
    fontSize: 28,
    bold: true,
    color: PDF_COLORS.text,
    alignment: "right" as const,
  },
  subtitle: {
    fontSize: 10,
    color: PDF_COLORS.textMuted,
    alignment: "right" as const,
  },

  // Section headers
  sectionHeader: {
    fontSize: 14,
    bold: true,
    color: PDF_COLORS.text,
    margin: [0, 20, 0, 8] as [number, number, number, number],
  },
  tradeHeader: {
    fontSize: 16,
    bold: true,
    color: PDF_COLORS.primary,
    margin: [0, 24, 0, 12] as [number, number, number, number],
  },

  // Body text
  body: {
    fontSize: 10,
    color: PDF_COLORS.textLight,
  },
  bodySmall: {
    fontSize: 9,
    color: PDF_COLORS.textMuted,
  },
  label: {
    fontSize: 9,
    color: PDF_COLORS.textMuted,
    bold: true,
  },

  // Table styles
  tableHeader: {
    fontSize: 9,
    bold: true,
    color: PDF_COLORS.text,
    fillColor: PDF_COLORS.background,
  },
  tableCell: {
    fontSize: 9,
    color: PDF_COLORS.textLight,
  },
  tableCellRight: {
    fontSize: 9,
    color: PDF_COLORS.textLight,
    alignment: "right" as const,
  },

  // Totals
  subtotalLabel: {
    fontSize: 10,
    color: PDF_COLORS.textLight,
  },
  subtotalValue: {
    fontSize: 10,
    color: PDF_COLORS.textLight,
    alignment: "right" as const,
  },
  totalLabel: {
    fontSize: 14,
    bold: true,
    color: PDF_COLORS.text,
  },
  totalValue: {
    fontSize: 14,
    bold: true,
    color: PDF_COLORS.primary,
    alignment: "right" as const,
  },
  grandTotalLabel: {
    fontSize: 16,
    bold: true,
    color: PDF_COLORS.text,
  },
  grandTotalValue: {
    fontSize: 16,
    bold: true,
    color: PDF_COLORS.primary,
    alignment: "right" as const,
  },

  // Footer
  footer: {
    fontSize: 8,
    color: PDF_COLORS.textMuted,
    alignment: "center" as const,
  },

  // Links
  link: {
    fontSize: 10,
    color: PDF_COLORS.primaryLight,
  },
};

// Table layouts
export const PDF_TABLE_LAYOUTS = {
  // No borders, just header background
  headerOnly: {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 6,
    paddingBottom: () => 6,
  },

  // Light horizontal lines
  lightHorizontal: {
    hLineWidth: (i: number, node: unknown) => {
      const tableNode = node as { table: { body: unknown[] } };
      return i === 0 || i === tableNode.table.body.length ? 0 : 0.5;
    },
    vLineWidth: () => 0,
    hLineColor: () => PDF_COLORS.border,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 6,
    paddingBottom: () => 6,
  },

  // Box with header
  boxed: {
    hLineWidth: (i: number, node: unknown) => {
      const tableNode = node as { table: { body: unknown[] } };
      return i === 0 || i === 1 || i === tableNode.table.body.length ? 1 : 0.5;
    },
    vLineWidth: (i: number, node: unknown) => {
      const tableNode = node as { table: { widths: unknown[] } };
      return i === 0 || i === tableNode.table.widths.length ? 1 : 0;
    },
    hLineColor: (i: number) => (i === 1 ? PDF_COLORS.primary : PDF_COLORS.border),
    vLineColor: () => PDF_COLORS.border,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 6,
    paddingBottom: () => 6,
  },

  // Totals section (no lines except top)
  totals: {
    hLineWidth: (i: number) => (i === 0 ? 1 : 0),
    vLineWidth: () => 0,
    hLineColor: () => PDF_COLORS.border,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 8,
    paddingBottom: () => 4,
  },
};

// Page margins
export const PDF_MARGINS = {
  page: [40, 60, 40, 60] as [number, number, number, number],
  section: [0, 16, 0, 0] as [number, number, number, number],
};

// Default document options
export const PDF_DEFAULT_OPTIONS = {
  pageSize: "LETTER" as const,
  pageMargins: PDF_MARGINS.page,
  defaultStyle: {
    font: PDF_FONTS.default,
    fontSize: 10,
    color: PDF_COLORS.text,
  },
  styles: PDF_STYLES,
};
