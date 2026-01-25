import { PDFDocument, rgb, degrees } from 'pdf-lib';

export class PdfExportUtilPro {
  static rgbToPdfLib(color) {
    return rgb(color.r, color.g, color.b);
  }

  static async exportPdfWithAnnotations(pdfData, annotations = []) {
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
      
      if (annotations.length > 0) {
        for (const annotation of annotations) {
          const page = pdfDoc.getPage(annotation.pageIndex);
          const { height: pageHeight } = page.getSize();
          
          const yCoord = pageHeight - annotation.y - (annotation.height || 0);
          
          if (annotation.type === 'highlight') {
            page.drawRectangle({
              x: annotation.x,
              y: yCoord,
              width: annotation.width,
              height: annotation.height,
              color: this.rgbToPdfLib(annotation.color),
              opacity: annotation.opacity || 0.4,
              borderWidth: 0,
            });
          } else if (annotation.type === 'text') {
            const fontSize = annotation.fontSize || 14;
            page.drawText(annotation.text, {
              x: annotation.x,
              y: pageHeight - annotation.y,
              size: fontSize,
              color: this.rgbToPdfLib(annotation.color),
            });
          } else if (annotation.type === 'drawing') {
            if (annotation.points && annotation.points.length > 1) {
              const color = this.rgbToPdfLib(annotation.color);
              const lineWidth = annotation.lineWidth || 2;
              
              for (let i = 0; i < annotation.points.length - 1; i++) {
                const p1 = annotation.points[i];
                const p2 = annotation.points[i + 1];
                
                page.drawLine({
                  start: { x: p1.x, y: pageHeight - p1.y },
                  end: { x: p2.x, y: pageHeight - p2.y },
                  thickness: lineWidth,
                  color: color,
                  opacity: 1,
                });
              }
            }
          } else if (annotation.type === 'sticky') {
            const bgColor = this.rgbToPdfLib(annotation.color);
            page.drawRectangle({
              x: annotation.x,
              y: pageHeight - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
              color: bgColor,
              opacity: 0.9,
              borderColor: rgb(0.8, 0.7, 0),
              borderWidth: 2,
            });
            
            if (annotation.text) {
              const lines = this.wrapText(annotation.text, annotation.width - 20, 12);
              let textY = pageHeight - annotation.y - 25;
              
              lines.forEach(line => {
                page.drawText(line, {
                  x: annotation.x + 10,
                  y: textY,
                  size: 12,
                  color: rgb(0, 0, 0),
                });
                textY -= 15;
              });
            }
          } else if (annotation.type === 'redaction') {
            // Redaction - siyah dikdörtgen (kalıcı karartma)
            page.drawRectangle({
              x: annotation.x,
              y: pageHeight - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
              color: rgb(0, 0, 0),
              opacity: 1,
              borderWidth: 0,
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

  static wrapText(text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    const charWidth = fontSize * 0.5;
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length * charWidth < maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
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
