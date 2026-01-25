import { PDFDocument, rgb } from 'pdf-lib';

export class RedactionManager {
  constructor() {
    this.redactions = [];
    this.listeners = [];
  }

  addRedaction(pageIndex, x, y, width, height) {
    this.redactions.push({
      id: Date.now() + Math.random(),
      pageIndex,
      x,
      y,
      width,
      height,
      timestamp: new Date().toISOString(),
    });
    this.notifyListeners();
  }

  removeRedaction(id) {
    this.redactions = this.redactions.filter(r => r.id !== id);
    this.notifyListeners();
  }

  getRedactions(pageIndex = null) {
    if (pageIndex !== null) {
      return this.redactions.filter(r => r.pageIndex === pageIndex);
    }
    return this.redactions;
  }

  clearRedactions() {
    this.redactions = [];
    this.notifyListeners();
  }

  onChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.redactions));
  }

  async applyRedactions(pdfData) {
    try {
      // Create a new Uint8Array copy to prevent detached error
      let clonedData;
      if (pdfData instanceof Uint8Array) {
        clonedData = new Uint8Array(pdfData);
      } else if (pdfData instanceof ArrayBuffer) {
        clonedData = new Uint8Array(pdfData);
      } else {
        clonedData = new Uint8Array(pdfData);
      }
      
      const pdfDoc = await PDFDocument.load(clonedData);
      
      for (const redaction of this.redactions) {
        const page = pdfDoc.getPage(redaction.pageIndex);
        const { height: pageHeight } = page.getSize();
        
        page.drawRectangle({
          x: redaction.x,
          y: pageHeight - redaction.y - redaction.height,
          width: redaction.width,
          height: redaction.height,
          color: rgb(0, 0, 0),
          opacity: 1,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('Redaction application error:', error);
      throw error;
    }
  }

  async exportRedactedPdf(pdfData, fileName = 'redacted.pdf') {
    const pdfBytes = await this.applyRedactions(pdfData);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
