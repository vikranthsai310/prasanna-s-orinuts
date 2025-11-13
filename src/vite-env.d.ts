/// <reference types="vite/client" />

declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf';
  
  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: any;
    styles?: any;
    columnStyles?: any;
  }
  
  export interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: AutoTableOptions) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}
