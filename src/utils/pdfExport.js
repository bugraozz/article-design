import { PDFDocument } from 'pdf-lib';

export class PdfExportUtil {
  static async exportPdfWithAnnotations(pdfData, annotations = []) {
    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      
      if (annotations.length > 0) {
        for (const annotation of annotations) {
          const page = pdfDoc.getPage(annotation.pageIndex);
          
          if (annotation.type === 'highlight') {
            page.drawRectangle({
              x: annotation.x,
              y: annotation.y,
              width: annotation.width,
              height: annotation.height,
              color: annotation.color || { r: 1, g: 1, b: 0 },
              opacity: 0.3,
            });
          } else if (annotation.type === 'text') {
            page.drawText(annotation.text, {
              x: annotation.x,
              y: annotation.y,
              size: annotation.fontSize || 12,
              color: annotation.color || { r: 0, g: 0, b: 0 },
            });
          }
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }

  static async downloadPdf(pdfBytes, fileName = 'document.pdf') {
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

  static async exportAndDownload(pdfData, annotations = [], fileName = 'document.pdf') {
    const pdfBytes = await this.exportPdfWithAnnotations(pdfData, annotations);
    await this.downloadPdf(pdfBytes, fileName);
  }
}
