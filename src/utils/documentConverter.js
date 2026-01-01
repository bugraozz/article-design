// src/utils/documentConverter.js
// Belge dönüştürme yardımcı fonksiyonları

/**
 * Sayfaları tam HTML belgesine dönüştür (Adobe HTMLToPDFJob için)
 * Absolute positioning ile overlay yapısını koruyarak
 */
export function convertPagesToHTML(pages, articleSettings) {
  let fullHTML = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Article Document</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${articleSettings?.bodyFontFamily || 'Arial, sans-serif'};
      background: white;
      color: #000;
      margin: 0;
      padding: 0;
    }
    
    .page {
      width: 768px;
      height: 1104px;
      margin: 0 auto;
      background: white;
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
    }
    
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    
    .overlay-container {
      position: relative;
      width: 100%;
      min-height: 200px;
    }
    
    .overlay {
      position: absolute;
    }
    
    .overlay img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin: 0.5em 0;
      font-weight: bold;
    }
    
    p {
      margin: 0.5em 0;
      line-height: 1.6;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    
    td, th {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
  </style>
</head>
<body>
`;

  // Her sayfayı HTML'e çevir
  pages.forEach((page, index) => {
    const isLastPage = index === pages.length - 1;
    
    fullHTML += `
  <div class="page${!isLastPage ? ' page-break' : ''}">
`;

    // Belge modu - TipTap içeriği
    if (page.mode === 'document' && page.documentContent) {
      fullHTML += page.documentContent;
    }
    
    // Serbest mod - overlaylar
    else if (page.mode === 'free') {
      // Sayfa boyutunu hesapla (overlaylar için container)
      const maxHeight = Math.max(
        ...page.overlays?.map(o => o.y + o.height) || [0],
        ...page.images?.map(i => i.y + i.height) || [0],
        ...page.tables?.map(t => t.y + 400) || [0],
        1000
      );
      
      fullHTML += `<div class="overlay-container" style="height: ${maxHeight}px;">`;
      
      // Text overlaylar
      page.overlays?.forEach(overlay => {
        if (overlay.type === 'text') {
          fullHTML += `
    <div class="overlay" style="left: ${overlay.x}px; top: ${overlay.y}px; width: ${overlay.width}px; height: ${overlay.height}px; font-size: ${overlay.fontSize || 14}px; color: ${overlay.color || '#000'}; line-height: ${overlay.lineHeight || 1.4}; transform: rotate(${overlay.rotate || 0}deg);">
      ${overlay.html}
    </div>
`;
        }
      });

      // Image overlaylar
      page.images?.forEach(img => {
        if (img.src) {
          const borderRadius = img.borderRadius ? `${img.borderRadius}%` : '0px';
          fullHTML += `
    <div class="overlay" style="left: ${img.x}px; top: ${img.y}px; width: ${img.width}px; height: ${img.height}px; transform: rotate(${img.angle || 0}deg);">
      <img src="${img.src}" alt="Image" style="border-radius: ${borderRadius};" />
    </div>
`;
        }
      });

      // Tablolar
      page.tables?.forEach(table => {
        let tableHTML = `
    <div class="overlay" style="left: ${table.x}px; top: ${table.y}px; width: ${table.width}px;">
      <table>
`;
        for (let r = 0; r < table.rows; r++) {
          tableHTML += '        <tr>';
          for (let c = 0; c < table.cols; c++) {
            const cellData = table.data?.[r]?.[c] || '';
            const tag = (table.headerRow && r === 0) ? 'th' : 'td';
            tableHTML += `<${tag}>${cellData}</${tag}>`;
          }
          tableHTML += '</tr>\n';
        }
        tableHTML += `
      </table>
    </div>
`;
        fullHTML += tableHTML;
      });
      
      fullHTML += `</div>`;
    }

    fullHTML += `
  </div>
`;
  });

  fullHTML += `
</body>
</html>
`;

  return fullHTML;
}

/**
 * Adobe Extract API'den gelen içeriği sayfalara dönüştür
 * PDF koordinat sistemini HTML koordinat sistemine çevirerek
 */
export function parseDocumentToPages(extractedData) {
  console.log('📄 Adobe Extract data:', extractedData);
  
  if (!extractedData || !extractedData.data) {
    console.warn('⚠️ No extraction data found');
    return [{
      id: 1,
      title: 'Sayfa 1',
      type: 'content',
      mode: 'free',
      overlays: [],
      images: [],
      tables: [],
      documentContent: '',
      pageSettings: {
        marginTop: 0,    // Import'ta margin kullanma
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
      },
    }];
  }

  const pagesMap = {}; // Sayfa numarasına göre elementleri grupla
  const structuredData = extractedData.data;
  
  // Backend'den gelen gerçek sayfa boyutunu kullan
  const pdfPageWidth = extractedData.pageSize?.width || 595;
  const pdfPageHeight = extractedData.pageSize?.height || 842;
  
  console.log(`📐 Backend'den gelen PDF boyutu: ${pdfPageWidth}pt x ${pdfPageHeight}pt`);
  
  // HTML canvas boyutu (A4 @ 96dpi: 8.27" x 11.69")
  const htmlPageWidth = 794;   // 8.27 inch * 96 = 794 pixels
  const htmlPageHeight = 1123;  // 11.69 inch * 96 = 1123 pixels
  
  // Ölçek faktörü (dinamik - gerçek PDF boyutuna göre)
  const scaleX = htmlPageWidth / pdfPageWidth;
  const scaleY = htmlPageHeight / pdfPageHeight;
  
  console.log(`📏 Ölçekleme faktörü: X=${scaleX.toFixed(3)}, Y=${scaleY.toFixed(3)}`);
  
  // Adobe Extract API'nin yapısı: elements array içinde her element bir Text, Figure, Table vb.
  if (structuredData.elements && Array.isArray(structuredData.elements)) {
    
    console.log(`🔍 Total elements: ${structuredData.elements.length}`);
    
    structuredData.elements.forEach((element, idx) => {
      const pageNum = element.Page || 1;
      
      // Sayfa yoksa oluştur
      if (!pagesMap[pageNum]) {
        pagesMap[pageNum] = {
          id: pageNum,
          title: `Sayfa ${pageNum}`,
          type: 'content',
          mode: 'free',
          overlays: [],
          images: [],
          tables: [],
          documentContent: '',
          pageSettings: {
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
          },
        };
      }
      
      const page = pagesMap[pageNum];
      
      // Bounds bilgisini al (PDF koordinat sisteminde - sol alt köşe başlangıç)
      const bounds = element.Bounds || element.Path?.[0]?.Bounds;
      
      if (!bounds || bounds.length < 4) {
        if (idx < 10) console.warn(`⚠️ Element ${idx} bounds bulunamadı:`, { Text: element.Text?.substring(0, 50), Type: element.hasOwnProperty('Text') ? 'Text' : element.hasOwnProperty('Table') ? 'Table' : 'Other' });
        return;
      }
      
      // PDF Bounds formatı: [x1, y1, x2, y2] 
      // PDF'de (0,0) SOL ALT köşededir ve Y yukarı doğru artar
      const pdfX1 = bounds[0];
      const pdfY1 = bounds[1]; // Alt kenar
      const pdfX2 = bounds[2];
      const pdfY2 = bounds[3]; // Üst kenar
      
      const pdfWidth = pdfX2 - pdfX1;
      const pdfHeight = pdfY2 - pdfY1;
      
      // HTML koordinat sistemine çevir (sol üst köşe başlangıç, Y aşağı doğru artar)
      // Y_html = PageHeight - Y_pdf(üst)
      const htmlX = Math.round(pdfX1 * scaleX);
      const htmlY = Math.round((pdfPageHeight - pdfY2) * scaleY); // Y eksenini çevir
      const htmlWidth = Math.round(pdfWidth * scaleX);
      const htmlHeight = Math.round(pdfHeight * scaleY);
      
      if (idx < 10) {
        console.log(`📍 Element ${idx} [Page ${pageNum}]:`, {
          text: element.Text?.substring(0, 30),
          pdfBounds: `[${pdfX1.toFixed(1)}, ${pdfY1.toFixed(1)}, ${pdfX2.toFixed(1)}, ${pdfY2.toFixed(1)}]`,
          pdfSize: `${pdfWidth.toFixed(1)}x${pdfHeight.toFixed(1)}`,
          calculation: `Y_html = (${pdfPageHeight} - ${pdfY2.toFixed(1)}) * ${scaleY.toFixed(3)} = ${htmlY}`,
          htmlPos: `(${htmlX}, ${htmlY})`,
          htmlSize: `${htmlWidth}x${htmlHeight}`
        });
      }
      
      // Metin elementleri - overlay olarak ekle
      if (element.Text) {
        const text = element.Text;
        const fontSize = Math.round((element.Font?.size || 12) * scaleY);
        const fontName = element.Font?.name || 'Arial';
        
        // HTML içeriği oluştur
        let htmlContent = '';
        if (fontSize > 18) {
          htmlContent = `<h2 style="font-family: ${fontName}; margin: 0;">${text}</h2>`;
        } else if (fontSize > 14) {
          htmlContent = `<h3 style="font-family: ${fontName}; margin: 0;">${text}</h3>`;
        } else {
          htmlContent = `<p style="font-family: ${fontName}; margin: 0; line-height: 1.2;">${text}</p>`;
        }
        
        page.overlays.push({
          id: `overlay-${pageNum}-${page.overlays.length}`,
          type: 'text',
          x: htmlX,
          y: htmlY,
          width: htmlWidth,
          height: htmlHeight,
          html: htmlContent,
          fontSize: fontSize,
          color: '#000000',
          rotate: 0,
          lineHeight: 1.2,
          zIndex: page.overlays.length
        });
      }
      
      // Tablo elementleri - table olarak ekle
      if (element.Table) {
        const tableData = [];
        let maxCols = 0;
        
        if (element.Table.rows && Array.isArray(element.Table.rows)) {
          element.Table.rows.forEach(row => {
            const rowData = [];
            if (row.cells && Array.isArray(row.cells)) {
              row.cells.forEach(cell => {
                rowData.push(cell.content || '');
              });
              maxCols = Math.max(maxCols, rowData.length);
            }
            tableData.push(rowData);
          });
        }
        
        page.tables.push({
          id: `table-${pageNum}-${page.tables.length}`,
          x: htmlX,
          y: htmlY,
          width: htmlWidth,
          height: htmlHeight,
          rows: tableData.length,
          cols: maxCols,
          data: tableData,
          headerRow: true,
          headerCol: false
        });
      }
      
      // Figure/Image elementleri
      if (element.Figure && element.filePaths && element.filePaths.length > 0) {
        page.images.push({
          id: `image-${pageNum}-${page.images.length}`,
          x: htmlX,
          y: htmlY,
          width: htmlWidth,
          height: htmlHeight,
          src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==',
          angle: 0,
          borderRadius: 0
        });
      }
    });
  }
  
  // Map'i array'e çevir
  const pages = Object.values(pagesMap).sort((a, b) => a.id - b.id);
  
  // Eğer hiç sayfa oluşturulmadıysa boş sayfa ekle
  if (pages.length === 0) {
    pages.push({
      id: 1,
      title: 'Sayfa 1',
      type: 'content',
      mode: 'free',
      overlays: [],
      images: [],
      tables: [],
      documentContent: '',
      pageSettings: {
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
      },
    });
  }

  console.log(`✅ ${pages.length} sayfa oluşturuldu (PDF→HTML koordinat dönüşümü yapıldı)`);
  pages.forEach((p, i) => {
    console.log(`  Sayfa ${i+1}: ${p.overlays.length} overlay, ${p.images.length} görsel, ${p.tables.length} tablo`);
  });
  
  return pages;
}

/**
 * Blob'u base64'e çevir
 */
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Base64'ü blob'a çevir
 */
export function base64ToBlob(base64, contentType = '') {
  const byteCharacters = atob(base64.split(',')[1]);
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

  return new Blob(byteArrays, { type: contentType });
}
