declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  interface PDFOptions {
    pagerender?: (pageData: any) => string;
    max?: number;
  }

  function PDFParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  
  export = PDFParse;
} 