/**
 * wordService.js
 * Word dosya işleme ve DOCX yönetimi için profesyonel servisleri
 */

import {
  processDocxFile,
  sanitizeHtmlForEditor,
  convertHtmlToMarkdown,
  prepareHtmlForPdf,
  extractDocxMetadata,
  isValidDocxFile
} from '../utils/docxConverter';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Word dosyasını sunucuya yükle ve işle
 */
export const uploadWordDocumentToServer = async (file, options = {}) => {
  const {
    preserveFormatting = true,
    extractMetadata = true,
    includeImages = true,
    convertToMarkdown = false
  } = options;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preserveFormatting', preserveFormatting);
    formData.append('extractMetadata', extractMetadata);
    formData.append('includeImages', includeImages);

    const response = await fetch(`${API_BASE_URL}/api/upload/docx`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu hatası: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Yükleme başarısız');
    }

    // Markdown'a dönüştür (eğer istenirse)
    if (convertToMarkdown && data.html) {
      data.markdown = convertHtmlToMarkdown(data.html);
    }

    return {
      success: true,
      ...data
    };
  } catch (error) {
    console.error('Sunucu yükleme hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * İstemci tarafında Word dosyasını işle (sunucu olmadan)
 */
export const processWordDocumentLocally = async (file, options = {}) => {
  const {
    extractMetadata = true,
    convertToMarkdown = false,
    preparePdf = false
  } = options;

  try {
    if (!isValidDocxFile(file)) {
      throw new Error('Geçersiz Word dosya formatı');
    }

    const result = await processDocxFile(file);

    if (!result.success) {
      throw new Error(result.error);
    }

    let processedResult = {
      html: sanitizeHtmlForEditor(result.html),
      text: result.text,
      fileName: result.fileName,
      fileSize: result.fileSize,
      warnings: result.warnings
    };

    // Metadata çıkar
    if (extractMetadata && result.arrayBuffer) {
      const metadata = await extractDocxMetadata(result.arrayBuffer);
      processedResult.metadata = metadata;
    }

    // Markdown'a dönüştür
    if (convertToMarkdown) {
      processedResult.markdown = convertHtmlToMarkdown(processedResult.html);
    }

    // PDF için hazırla
    if (preparePdf) {
      processedResult.htmlForPdf = prepareHtmlForPdf(processedResult.html);
    }

    return {
      success: true,
      ...processedResult
    };
  } catch (error) {
    console.error('Yerel işleme hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Word belgesini PDF'e dönüştür
 */
export const convertWordToPdf = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/convert/docx-to-pdf`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Dönüştürme hatası: ${response.statusText}`);
    }

    const blob = await response.blob();
    return {
      success: true,
      blob: blob,
      fileName: file.name.replace(/\.[^.]+$/, '.pdf')
    };
  } catch (error) {
    console.error('PDF dönüştürme hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Birden fazla Word dosyasını toplu işle
 */
export const batchProcessWordDocuments = async (files, options = {}) => {
  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      const result = await processWordDocumentLocally(file, options);
      if (result.success) {
        results.push(result);
      } else {
        errors.push({ file: file.name, error: result.error });
      }
    } catch (error) {
      errors.push({ file: file.name, error: error.message });
    }
  }

  return {
    success: errors.length === 0,
    processedCount: results.length,
    totalCount: files.length,
    results,
    errors
  };
};

/**
 * HTML'i DOCX formatına dönüştür
 * (Bu işlem için sunucu tarafında implementation gerekir)
 */
export const convertHtmlToWord = async (html, fileName = 'document.docx') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/convert/html-to-docx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html })
    });

    if (!response.ok) {
      throw new Error(`Dönüştürme hatası: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      success: true,
      message: 'DOCX dosyası indirildi'
    };
  } catch (error) {
    console.error('HTML to DOCX dönüştürme hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Word belge öğelerini çıkar (paragraf, tablo, vb.)
 */
export const extractWordDocumentElements = async (file) => {
  try {
    const result = await processWordDocumentLocally(file);

    if (!result.success) {
      throw new Error(result.error);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(result.html, 'text/html');

    return {
      success: true,
      elements: {
        paragraphs: Array.from(doc.querySelectorAll('p')).map((p) => p.textContent),
        headings: Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((h) => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent
        })),
        tables: Array.from(doc.querySelectorAll('table')).length,
        images: Array.from(doc.querySelectorAll('img')).length,
        links: Array.from(doc.querySelectorAll('a')).map((a) => ({
          text: a.textContent,
          href: a.href
        })),
        lists: {
          ordered: Array.from(doc.querySelectorAll('ol')).length,
          unordered: Array.from(doc.querySelectorAll('ul')).length
        }
      }
    };
  } catch (error) {
    console.error('Öğe çıkarma hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Word belgesinin istatistiklerini al
 */
export const getWordDocumentStats = async (file) => {
  try {
    const result = await processWordDocumentLocally(file);

    if (!result.success) {
      throw new Error(result.error);
    }

    const text = result.text || '';
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const paragraphs = result.html?.split(/<\/p>/gi).filter((p) => p.trim().length > 0).length || 0;

    return {
      success: true,
      stats: {
        characters: text.length,
        charactersWithoutSpaces: text.replace(/\s/g, '').length,
        words: words.length,
        sentences: sentences.length,
        paragraphs: paragraphs,
        averageWordLength: words.length > 0 ? (text.length / words.length).toFixed(2) : 0,
        averageWordsPerSentence: sentences.length > 0 ? (words.length / sentences.length).toFixed(2) : 0,
        readingTimeMinutes: Math.ceil(words.length / 200) // 200 WPM varsayımı
      }
    };
  } catch (error) {
    console.error('İstatistik hesaplama hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Word belgesine değişiklik izini ekle
 */
export const enableTrackChanges = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Değişiklik izine uygun stil ekle
  const style = document.createElement('style');
  style.textContent = `
    .tracked-change {
      position: relative;
    }
    .tracked-addition {
      background-color: #c6e0b4;
      text-decoration: underline;
    }
    .tracked-deletion {
      background-color: #fccccb;
      text-decoration: line-through;
    }
  `;
  doc.head.appendChild(style);

  return doc.documentElement.outerHTML;
};

/**
 * Word dosya önizlemesi oluştur
 */
export const generateWordDocumentPreview = (html, maxLength = 500) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  let preview = doc.body.textContent || '';

  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }

  return preview;
};

export default {
  uploadWordDocumentToServer,
  processWordDocumentLocally,
  convertWordToPdf,
  batchProcessWordDocuments,
  convertHtmlToWord,
  extractWordDocumentElements,
  getWordDocumentStats,
  enableTrackChanges,
  generateWordDocumentPreview
};
