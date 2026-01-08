/**
 * PDF Renderer - Adobe Extract API'den gelen verileri orijinal düzeniyle HTML'e çevirir
 * Absolute positioning kullanarak PDF'in tam kopyasını oluşturur
 */

/**
 * Adobe Extract API'den gelen PDF verilerini sayfalara ayırıp HTML'e çevir
 * @param {Object} extractedData - Adobe Extract API response
 * @returns {Array} Array of page objects with HTML content
 */
export function renderPdfToPages(extractedData) {
  const data = extractedData.data || extractedData;
  
  if (!data || !data.elements) {
    console.error('Invalid Adobe Extract data');
    return [];
  }

  console.log('📄 ===== ADOBE EXTRACT DEBUG =====');
  console.log('📄 Total elements:', data.elements.length);
  console.log('📄 Sample element:', data.elements[0]);
  console.log('📄 Page size from backend:', extractedData.pageSize);
  console.log('📄 All data keys:', Object.keys(data));

  // Görselleri al
  const images = data.imageAssets || {};
  console.log('📄 Total images:', Object.keys(images).length);

  // Sayfa boyutunu al - Adobe Extract pt (point) birimi kullanır
  const pageSize = extractedData.pageSize || { width: 595, height: 842 }; // A4 default
  console.log(`📄 Using page size: ${pageSize.width}pt x ${pageSize.height}pt`);
  console.log('⚠️ Adobe Extract uses POINTS (pt), not pixels!');

  // Elementleri sayfalara göre grupla
  const elementsByPage = {};
  data.elements.forEach(element => {
    const pageNum = element.Page || 0;
    if (!elementsByPage[pageNum]) {
      elementsByPage[pageNum] = [];
    }
    elementsByPage[pageNum].push(element);
  });

  console.log(`📄 Total pages: ${Object.keys(elementsByPage).length}`);

  const pages = [];

  // Her sayfayı işle
  Object.entries(elementsByPage).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([pageNum, pageElements], index) => {
    console.log(`📄 ===== PAGE ${pageNum} (${pageElements.length} elements) =====`);
    
    // İlk 5 elementi detaylı logla
    pageElements.slice(0, 5).forEach((el, idx) => {
      console.log(`  Element ${idx}:`, {
        Text: el.Text?.substring(0, 50),
        Bounds: el.Bounds,
        Font: el.Font,
        Page: el.Page
      });
    });

    // Absolute positioning ile HTML oluştur - Adobe Extract pt (point) kullanır!
    let html = `<div style="position: relative; width: ${pageSize.width}pt; height: ${pageSize.height}pt; background: white; overflow: hidden; border: 1px solid #ddd;">`;

    pageElements.forEach(element => {
      // Metin elementi
      if (element.Text) {
        html += renderTextElementPositioned(element, pageSize);
      }
      // Tablo elementi
      else if (element.Table) {
        html += renderTableElementPositioned(element, pageSize);
      }
      // Görsel/Figure elementi (logo, grafikler, resimler)
      else if (element.filePaths && element.filePaths.length > 0) {
        const imagePath = element.filePaths[0];
        if (images[imagePath]) {
          html += renderImageElementPositioned(element, images[imagePath], pageSize);
        }
      }
      // Path elementi (çizgiler, şekiller, arka plan)
      else if (element.Path) {
        console.log('📐 Path/Shape element detected:', element.Path);
        // Path elementleri çizgi/şekil olabilir, şimdilik skip
      }
    });

    html += '</div>';

    pages.push({
      id: index + 1, // 1-based index for consistency
      mode: 'document',
      documentContent: html,
      overlays: [],
      images: [],
      tables: []
    });
  });

  console.log(`✅ Rendered ${pages.length} pages with original layout`);
  return pages;
}

/**
 * Metin elementini orijinal pozisyonuyla HTML'e çevir
 */
function renderTextElementPositioned(element, pageSize) {
  const text = element.Text?.trim() || '';
  if (!text) {
    // Text yoksa veya boşsa, bu element muhtemelen grafik/çizgi
    console.log('⚠️ Skipping element with no text:', element);
    return '';
  }

  const bounds = element.Bounds;
  if (!bounds || bounds.length < 4) {
    console.warn('⚠️ Invalid bounds for text element:', element);
    return '';
  }
  
  const font = element.Font || {};
  
  // PDF koordinatları: [x1, y1, x2, y2]
  // y1 = bottom, y2 = top (PDF koordinat sistemi alt-üst ters)
  const x = bounds[0];
  const y = pageSize.height - bounds[3]; // PDF'ten HTML koordinatına çevir
  const width = bounds[2] - bounds[0];
  const height = bounds[3] - bounds[1];

  // İlk birkaç elementi debug için logla
  if (Math.random() < 0.05) { // %5 şans ile logla
    console.log('🔍 Text element:', {
      text: text.substring(0, 30),
      bounds,
      calculated: { x, y, width, height },
      pageSize,
      font: font
    });
  }

  const fontSize = font.size || 12;
  const fontName = font.name || '';
  const fontWeight = font.weight || 400;

  // Stil oluştur - Adobe Extract pt (point) kullanır!
  let style = `position: absolute; left: ${x}pt; top: ${y}pt; width: ${width}pt; min-height: ${height}pt;`;
  style += ` font-size: ${fontSize}pt; line-height: ${Math.max(height, fontSize * 1.2)}pt;`;
  style += ` margin: 0; padding: 0; white-space: pre-wrap; overflow: visible;`;
  
  // Font ailesi
  if (fontName.includes('Arial') || fontName.includes('Helvetica')) {
    style += ' font-family: Arial, sans-serif;';
  } else if (fontName.includes('Times')) {
    style += ' font-family: "Times New Roman", serif;';
  } else if (fontName.includes('Courier')) {
    style += ' font-family: "Courier New", monospace;';
  } else {
    style += ' font-family: Arial, sans-serif;';
  }
  
  // Bold
  if (fontWeight >= 600 || fontName.includes('Bold')) {
    style += ' font-weight: bold;';
  }
  
  // Italic
  if (fontName.includes('Italic') || fontName.includes('Oblique')) {
    style += ' font-style: italic;';
  }

  // Metin rengi (eğer varsa)
  if (font.color) {
    style += ` color: ${font.color};`;
  }

  return `<div style="${style}">${escapeHtml(text)}</div>`;
}

/**
 * Tablo elementini orijinal pozisyonuyla HTML'e çevir
 */
function renderTableElementPositioned(element, pageSize) {
  const bounds = element.Bounds || [0, 0, 200, 100];
  const x = bounds[0];
  const y = pageSize.height - bounds[3];
  const width = bounds[2] - bounds[0];
  const height = bounds[3] - bounds[1];

  let style = `position: absolute; left: ${x}pt; top: ${y}pt; width: ${width}pt; height: ${height}pt;`;
  style += ' border: 1px solid #ccc; padding: 5pt; font-size: 10pt;';

  return `<div style="${style}"><em>[Tablo]</em></div>`;
}

/**
 * Görsel elementini orijinal pozisyonuyla HTML'e çevir
 */
function renderImageElementPositioned(element, imageSrc, pageSize) {
  const bounds = element.Bounds || element.Path?.[0]?.Bounds || [0, 0, 100, 100];
  const x = bounds[0];
  const y = pageSize.height - bounds[3];
  const width = bounds[2] - bounds[0];
  const height = bounds[3] - bounds[1];
  
  return `<img src="${imageSrc}" style="position: absolute; left: ${x}pt; top: ${y}pt; width: ${width}pt; height: ${height}pt; object-fit: contain;" alt="PDF Image" />`;
}

/**
 * HTML escape
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
