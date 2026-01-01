// src/services/adobeService.js
// Adobe PDF Services Backend API Client

/**
 * Adobe PDF Services Client (via Backend)
 * Communicates with Node.js backend server that uses official Adobe SDK
 */

class AdobeService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  }

  /**
   * Check backend health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw new Error('Backend server is not running. Please start it with: cd server && npm start');
    }
  }

  /**
   * Convert HTML to PDF using Adobe PDF Services (via backend)
   */
  async htmlToPdf(htmlContent, filename = 'document.pdf') {
    try {
      console.log('📄 Sending HTML to Adobe backend for PDF conversion...');

      const response = await fetch(`${this.backendUrl}/api/html-to-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          filename: filename
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'PDF conversion failed');
      }

      const data = await response.json();
      console.log('✅ PDF created successfully via Adobe SDK');
      
      return {
        data: data.pdf,
        filename: data.filename
      };
    } catch (error) {
      console.error('❌ HTML to PDF conversion error:', error);
      throw error;
    }
  }

  /**
   * Convert PDF to Word using Adobe PDF Services (via backend)
   */
  async pdfToWord(pdfData, filename = 'document.docx') {
    try {
      console.log('📝 Sending PDF to Adobe backend for Word conversion...');

      const response = await fetch(`${this.backendUrl}/api/pdf-to-word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf: pdfData,
          filename: filename
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Word conversion failed');
      }

      const data = await response.json();
      console.log('✅ Word document created successfully via Adobe SDK');
      
      return {
        data: data.word,
        filename: data.filename
      };
    } catch (error) {
      console.error('❌ PDF to Word conversion error:', error);
      throw error;
    }
  }

  /**
   * Extract content from PDF or Word document (via backend)
   */
  async extractDocument(file) {
    try {
      console.log('🔍 Sending document to Adobe backend for extraction...');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.backendUrl}/api/extract-document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Document extraction failed');
      }

      const data = await response.json();
      console.log('✅ Document extracted successfully via Adobe SDK');
      
      return data;
    } catch (error) {
      console.error('❌ Document extraction error:', error);
      throw error;
    }
  }

  /**
   * Convert Word to PDF then extract (via backend) - For Word document import
   */
  async wordToPdfAndExtract(file) {
    try {
      console.log('📄 Converting Word to PDF and extracting content...');

      const formData = new FormData();
      formData.append('file', file);

      // Önce Word'ü PDF'e çevir
      const pdfResponse = await fetch(`${this.backendUrl}/api/word-to-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!pdfResponse.ok) {
        const error = await pdfResponse.json();
        throw new Error(error.details || 'Word to PDF conversion failed');
      }

      const pdfData = await pdfResponse.json();
      console.log('✅ Word converted to PDF');

      // PDF'i base64'ten blob'a çevir
      const pdfBase64 = pdfData.pdf.replace(/^data:application\/pdf;base64,/, '');
      const pdfBlob = this.base64ToBlob(pdfBase64, 'application/pdf');

      // Şimdi PDF'den içeriği çıkar
      const extractFormData = new FormData();
      extractFormData.append('file', pdfBlob, 'converted.pdf');

      const extractResponse = await fetch(`${this.backendUrl}/api/extract-document`, {
        method: 'POST',
        body: extractFormData,
      });

      if (!extractResponse.ok) {
        const error = await extractResponse.json();
        throw new Error(error.details || 'PDF extraction failed');
      }

      const extractedData = await extractResponse.json();
      console.log('✅ Content extracted from converted PDF');
      
      return extractedData;
    } catch (error) {
      console.error('❌ Word to PDF and extract error:', error);
      throw error;
    }
  }

  /**
   * Helper: Convert base64 to Blob
   */
  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }
}

export default new AdobeService();
