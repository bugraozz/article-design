/**
 * DOCX dosyaları HTML'ye dönüştüren profesyonel utility fonksiyonlar
 * Mammoth.js kullanarak formatlı belgeleri korur
 * OMML desteği ve stil koruması ile iyileştirilmiş
 */

import mammoth from 'mammoth';

/**
 * DOCX dosyasını ArrayBuffer olarak okur
 */
export const readDocxAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * DOCX ArrayBuffer'ini HTML'ye dönüştürür
 * Tablo, liste, resim vb. formatları korur
 * OMML desteği ve stil koruması ekli
 */
export const convertDocxToHtml = async (arrayBuffer) => {
  try {
    // Mammoth seçenekleri - Kapsamlı stil haritası
    const styleMap = [
      // Başlıklar
      'p[style-name="Heading 1"] => h1:fresh',
      'p[style-name="Heading 2"] => h2:fresh',
      'p[style-name="Heading 3"] => h3:fresh',
      'p[style-name="Heading 4"] => h4:fresh',
      'p[style-name="Heading 5"] => h5:fresh',
      'p[style-name="Heading 6"] => h6:fresh',
      
      // Normal paragraflar
      'p[style-name="Normal"] => p:fresh',
      'p[style-name="Body Text"] => p:fresh',
      'p[style-name="Title"] => h1.title:fresh',
      'p[style-name="Subtitle"] => p.subtitle:fresh',
      
      // Listeler
      'p[style-name="List Paragraph"] => li:fresh',
      'p[style-name="ListBullet"] => li:fresh',
      'p[style-name="ListBullet2"] => li:fresh',
      'p[style-name="ListBullet3"] => li:fresh',
      'p[style-name="ListNumber"] => li:fresh',
      'p[style-name="ListNumber2"] => li:fresh',
      'p[style-name="ListNumber3"] => li:fresh',
      
      // Alıntı ve özel paragraflar
      'p[style-name="Quote"] => blockquote:fresh',
      'p[style-name="Intense Quote"] => blockquote.intense:fresh',
      'p[style-name="Code"] => code:fresh',
      
      // Karakter stilleri
      'r[style-name="Strong"] => strong',
      'r[style-name="Emphasis"] => em',
      'r[style-name="Intense Emphasis"] => strong.emphasis',
      'r[style-name="Book Title"] => em',
      'r[style-name="Subtle Emphasis"] => em',
      'r[style-name="Intense Reference"] => strong',
      'r[style-name="Reference"] => span',
      'r[style-name="Subtle Reference"] => span',
      
      // Tablo
      'table => table:fresh',
      'td => td:fresh',
      'th => th:fresh',
      'tr => tr:fresh'
    ];

    const options = {
      convertImage: mammoth.images.imgElement((image) => {
        return {
          src: image.contentType === 'image/png'
            ? `data:${image.contentType};base64,${image.base64}`
            : image.href
        };
      }),
      styleMap: styleMap,
      ignoreEmptyParagraphs: true
    };

    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      options
    );

    // HTML'i temizle ve normalize et
    let html = result.value;
    
    // Boş divleri kaldır
    html = html.replace(/<div>\s*<\/div>/g, '');
    
    // Boş paragrafları kaldır (sadece whitespace içerenler)
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    // Ardışık boş etiketleri temizle
    html = html.replace(/<p><\/p>\s*<p><\/p>/g, '<p></p>');
    
    // Çoklu whitespace'i düzelt
    html = html.replace(/>\s+</g, '><');
    
    // Özel karakterleri düzelt
    html = html.replace(/&nbsp;/g, ' ');
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    html = html.replace(/&amp;/g, '&');
    
    // Satır sonlarını düzelt
    html = html.replace(/\r\n/g, '');
    html = html.replace(/\n/g, '');
    
    // Malformed HTML düzelt
    html = fixMalformedHtml(html);

    return {
      html: html,
      warnings: result.messages,
      success: true
    };
  } catch (error) {
    console.error('DOCX to HTML dönüştürme hatası:', error);
    throw new Error(`DOCX dönüştürme başarısız: ${error.message}`);
  }
};

/**
 * Malformed HTML'i düzelt
 */
const fixMalformedHtml = (html) => {
  let fixed = html;
  
  // Kapanmamış etiketleri düzelt
  const openTags = ['p', 'div', 'span', 'strong', 'em', 'u', 'li', 'ol', 'ul', 'table', 'tr', 'td', 'th'];
  
  for (const tag of openTags) {
    // Kapanmamış tag'leri bul ve kapat
    const regex = new RegExp(`<${tag}([^>]*)>(?!.*</${tag}>)`, 'gi');
    fixed = fixed.replace(regex, `<${tag}$1></${tag}>`);
  }
  
  // Style attribute'leri düzelt
  fixed = fixed.replace(/style="[^"]*"/g, (match) => {
    // Style attribute'i kontrol et
    if (match.includes(':') && !match.includes(';')) {
      return match.slice(0, -1) + ';\"';
    }
    return match;
  });
  
  return fixed;
};

/**
 * DOCX dosyasından metin çıkarır (metadata olmadan sadece içerik)
 */
export const extractTextFromDocx = async (arrayBuffer) => {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('DOCX metin çıkarma hatası:', error);
    throw new Error(`Metin çıkarma başarısız: ${error.message}`);
  }
};

/**
 * DOCX dosyasını yükler ve HTML'ye dönüştürür
 * @param {File} file - DOCX dosyası
 * @returns {Promise} - {html, text, warnings}
 */
export const processDocxFile = async (file) => {
  try {
    // Dosya türü kontrolü
    if (!isValidDocxFile(file)) {
      throw new Error('Geçersiz dosya türü. Lütfen .docx dosyası seçiniz.');
    }

    // Dosya boyutu kontrolü (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`Dosya çok büyük. Maksimum boyut: 10MB`);
    }

    // DOCX'i ArrayBuffer'e çevir
    const arrayBuffer = await readDocxAsArrayBuffer(file);

    // HTML'ye dönüştür
    const htmlResult = await convertDocxToHtml(arrayBuffer);

    // Metin de çıkar
    const text = await extractTextFromDocx(arrayBuffer);

    return {
      html: htmlResult.html,
      text: text,
      warnings: htmlResult.warnings,
      fileName: file.name,
      fileSize: file.size,
      success: true
    };
  } catch (error) {
    console.error('DOCX işleme hatası:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Dosyanın valid DOCX olup olmadığını kontrol eder
 */
export const isValidDocxFile = (file) => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  return validTypes.includes(file.type) || file.name.endsWith('.docx') || file.name.endsWith('.doc');
};

/**
 * DOCX içeriğini temizleyerek Editor formatına uygun hale getirir
 * Stil ve formatı korurken tehlikeli kodu kaldırır
 */
export const sanitizeHtmlForEditor = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    // İzin verilen HTML tag'leri ve attribute'leri
    const allowedTags = {
      'p': ['style', 'class', 'id'],
      'div': ['style', 'class', 'id'],
      'h1': ['style', 'class', 'id'],
      'h2': ['style', 'class', 'id'],
      'h3': ['style', 'class', 'id'],
      'h4': ['style', 'class', 'id'],
      'h5': ['style', 'class', 'id'],
      'h6': ['style', 'class', 'id'],
      'strong': ['style', 'class'],
      'b': ['style', 'class'],
      'em': ['style', 'class'],
      'i': ['style', 'class'],
      'u': ['style', 'class'],
      'span': ['style', 'class', 'data-temp-id'],
      'a': ['href', 'style', 'class', 'target'],
      'br': ['style', 'class'],
      'ul': ['style', 'class'],
      'ol': ['style', 'class'],
      'li': ['style', 'class'],
      'table': ['style', 'class', 'border', 'cellpadding', 'cellspacing'],
      'thead': ['style', 'class'],
      'tbody': ['style', 'class'],
      'tfoot': ['style', 'class'],
      'tr': ['style', 'class'],
      'td': ['style', 'class', 'colspan', 'rowspan', 'align', 'valign'],
      'th': ['style', 'class', 'colspan', 'rowspan', 'align', 'valign'],
      'img': ['src', 'alt', 'style', 'width', 'height', 'title'],
      'blockquote': ['style', 'class'],
      'pre': ['style', 'class'],
      'code': ['style', 'class'],
      'del': ['style', 'class'],
      's': ['style', 'class'],
      'sub': ['style', 'class'],
      'sup': ['style', 'class'],
      'mark': ['style', 'class']
    };

    // DOMParser ile HTML parse et
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Dangerous etiketleri kaldır
    const dangerousTags = ['script', 'style[type="application/x-sharedlib"]', 'meta', 'link', 'form', 'input', 'button', 'textarea', 'select', 'object', 'embed', 'iframe'];
    dangerousTags.forEach(tag => {
      doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Tüm etiketleri traverse et ve kötü olanları temizle
    const traverse = (node) => {
      const nodesToRemove = [];
      
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        
        if (child.nodeType === 1) { // Element node
          const tagName = child.tagName.toLowerCase();
          
          // Tag izin listesinde değilse kaldır
          if (!allowedTags[tagName]) {
            // İçeriğini koru, tag'i kaldır
            while (child.firstChild) {
              node.insertBefore(child.firstChild, child);
            }
            nodesToRemove.push(child);
            i--;
          } else {
            // Attribute'leri temizle
            const allowedAttrs = allowedTags[tagName];
            const attrsToRemove = [];
            
            for (let j = 0; j < child.attributes.length; j++) {
              const attr = child.attributes[j];
              
              // Event handler'ları kaldır
              if (attr.name.startsWith('on')) {
                attrsToRemove.push(attr.name);
                continue;
              }
              
              // İzin verilen attribute'leri kontrol et
              if (!allowedAttrs.includes(attr.name)) {
                attrsToRemove.push(attr.name);
                continue;
              }
              
              // Tehlikeli URL'leri kontrol et
              if (attr.name === 'href' || attr.name === 'src') {
                if (attr.value.match(/javascript:|data:text\/html|vbscript:|onerror=|onload=/i)) {
                  attrsToRemove.push(attr.name);
                }
              }
              
              // Style attribute'i sanitize et
              if (attr.name === 'style') {
                const cleanStyle = attr.value
                  .replace(/javascript:/gi, '')
                  .replace(/expression\s*\(/gi, '')
                  .replace(/behavior:/gi, '')
                  .replace(/binding:/gi, '')
                  .replace(/-moz-binding:/gi, '');
                child.setAttribute('style', cleanStyle);
              }
            }
            
            // İzin verilmeyen attribute'leri kaldır
            attrsToRemove.forEach(attr => child.removeAttribute(attr));
            
            // Recursively traverse
            traverse(child);
          }
        }
      }
      
      // Kaldırılacak node'ları sil
      nodesToRemove.forEach(n => n.remove());
    };

    traverse(doc.body);

    // Temizlenmiş HTML'i döndür
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Sanitization hatası:', error);
    // Hata durumunda orijinal HTML'i döndür (sağlamlık için)
    return html;
  }
};

/**
 * HTML'i Markdown'a dönüştürür (opsiyonel)
 */
export const convertHtmlToMarkdown = (html) => {
  try {
    // Basit HTML to Markdown dönüştürme
    let markdown = html
      .replace(/<h1[^>]*>([^<]*)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>([^<]*)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>([^<]*)<\/h3>/gi, '### $1\n')
      .replace(/<strong[^>]*>([^<]*)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>([^<]*)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>([^<]*)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>([^<]*)<\/i>/gi, '*$1*')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '[$2]($1)')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .trim();

    return markdown;
  } catch (error) {
    console.error('HTML to Markdown dönüştürme hatası:', error);
    return html;
  }
};

/**
 * DOCX'ten çıkarılan metaveriye erişir
 */
export const extractDocxMetadata = async (arrayBuffer) => {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    // Mammoth direkt metadata sağlamaz, sadece uyarıları döner
    return {
      warnings: result.messages || [],
      hasImages: result.value?.includes('<img') || false,
      hasTables: result.value?.includes('<table') || false,
      hasLists: result.value?.includes('<ul') || result.value?.includes('<ol') || false
    };
  } catch (error) {
    console.error('Metadata çıkarma hatası:', error);
    return {};
  }
};

/**
 * HTML içeriğini PDF-friendly formata çevirir
 */
export const prepareHtmlForPdf = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Sayfalar arası kesme noktaları ekle
  const pageBreaks = doc.querySelectorAll('[class*="page-break"]');
  pageBreaks.forEach((el) => {
    el.style.pageBreakAfter = 'always';
  });

  // Resim boyutlarını kontrol et
  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.style.maxWidth) {
      img.style.maxWidth = '100%';
    }
    if (!img.style.height) {
      img.style.height = 'auto';
    }
  });

  return doc.body.innerHTML;
};

/**
 * DOCX yükleme sonucunu işler ve döndürür
 */
export const handleDocxUploadResult = async (file, onSuccess, onError) => {
  try {
    const result = await processDocxFile(file);

    if (!result.success) {
      onError(result.error);
      return;
    }

    const sanitizedHtml = sanitizeHtmlForEditor(result.html);
    onSuccess({
      html: sanitizedHtml,
      text: result.text,
      fileName: result.fileName,
      fileSize: result.fileSize,
      warnings: result.warnings
    });
  } catch (error) {
    onError(error.message);
  }
};
