// Type declarations for pdfmake
// Based on pdfmake 0.3.0

declare module "pdfmake/build/pdfmake" {
  interface TDocumentDefinitions {
    content: Content | Content[];
    pageSize?: string;
    pageMargins?: [number, number, number, number];
    defaultStyle?: Style;
    styles?: Record<string, Style>;
    header?: Content | ((currentPage: number, pageCount: number) => Content);
    footer?: Content | ((currentPage: number, pageCount: number) => Content);
  }

  interface Style {
    font?: string;
    fontSize?: number;
    bold?: boolean;
    italics?: boolean;
    color?: string;
    fillColor?: string;
    alignment?: "left" | "center" | "right" | "justify";
    margin?: number | [number, number] | [number, number, number, number];
  }

  type Content =
    | string
    | ContentText
    | ContentColumns
    | ContentStack
    | ContentTable
    | ContentImage
    | ContentCanvas
    | ContentColumn
    | null
    | undefined
    | Content[];

  interface ContentText {
    text: string | Content[];
    style?: string | string[];
    fontSize?: number;
    bold?: boolean;
    italics?: boolean;
    color?: string;
    alignment?: "left" | "center" | "right" | "justify";
    margin?: number | [number, number] | [number, number, number, number];
    colSpan?: number;
    rowSpan?: number;
    pageBreak?: "before" | "after";
  }

  interface ContentColumns {
    columns: (Content | ContentColumn)[];
    columnGap?: number;
    margin?: number | [number, number] | [number, number, number, number];
  }

  interface ContentColumn {
    width?: number | string | "*" | "auto";
    text?: string | Content[];
    stack?: Content[];
    image?: string;
    style?: string | string[];
    margin?: number | [number, number] | [number, number, number, number];
    bold?: boolean;
    fontSize?: number;
    color?: string;
    alignment?: "left" | "center" | "right" | "justify";
    colSpan?: number;
    rowSpan?: number;
    fillColor?: string;
  }

  interface ContentStack {
    stack: Content[];
    margin?: number | [number, number] | [number, number, number, number];
  }

  interface ContentTable {
    table: {
      headerRows?: number;
      widths?: (string | number)[];
      body: Content[][];
    };
    layout?:
      | string
      | {
          hLineWidth?: (i: number, node: unknown) => number;
          vLineWidth?: (i: number, node: unknown) => number;
          hLineColor?: (i: number, node: unknown) => string;
          vLineColor?: (i: number, node: unknown) => string;
          paddingLeft?: (i: number, node: unknown) => number;
          paddingRight?: (i: number, node: unknown) => number;
          paddingTop?: (i: number, node: unknown) => number;
          paddingBottom?: (i: number, node: unknown) => number;
        };
    margin?: number | [number, number] | [number, number, number, number];
  }

  interface ContentImage {
    image: string;
    width?: number;
    height?: number;
    fit?: [number, number];
    margin?: number | [number, number] | [number, number, number, number];
  }

  interface ContentCanvas {
    canvas: CanvasElement[];
    margin?: number | [number, number] | [number, number, number, number];
  }

  interface CanvasElement {
    type: "line" | "rect" | "ellipse" | "polyline";
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    lineWidth?: number;
    lineColor?: string;
  }

  interface PdfDocumentGenerator {
    getBlob(callback: (blob: Blob) => void): void;
    download(filename?: string): void;
    open(): void;
  }

  interface PdfMakeStatic {
    vfs: Record<string, string>;
    createPdf(docDefinition: TDocumentDefinitions): PdfDocumentGenerator;
  }

  const pdfMake: PdfMakeStatic;
  export default pdfMake;
  export { TDocumentDefinitions, Content, Style };
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string>;
  export default { vfs };
}
