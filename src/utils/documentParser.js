/**
 * Document Parser for PDF (Adobe Extract API) and Word (Mammoth.js)
 * Converts extracted document data to TipTap JSON format
 */

/**
 * Parse Adobe Extract API results to TipTap JSON format
 * @param {Object} extractedData - Adobe Extract API response
 * @returns {Array} Array of page objects with TipTap content
 */
export function parseAdobeExtractToTipTap(extractedData) {
  // Backend'den gelen veri yapısını kontrol et
  const data = extractedData.data || extractedData;
  
  if (!data || !data.elements) {
    console.error('Invalid Adobe Extract data:', extractedData);
    console.error('Expected structure: { data: { elements: [...] } }');
    return [];
  }

  console.log('📄 Parsing Adobe Extract data...');
  console.log(`📄 Total elements: ${data.elements.length}`);

  // Group elements by page
  const elementsByPage = groupByPage(data.elements);
  console.log(`📄 Total pages: ${Object.keys(elementsByPage).length}`);

  const pages = [];

  // Process each page
  Object.entries(elementsByPage).forEach(([pageNum, pageElements]) => {
    console.log(`📄 Processing page ${pageNum} with ${pageElements.length} elements`);

    // Sort by Y coordinate (top to bottom in PDF coordinates)
    pageElements.sort((a, b) => {
      const aY = a.Bounds ? a.Bounds[3] : 0; // Use top Y coordinate
      const bY = b.Bounds ? b.Bounds[3] : 0;
      return bY - aY; // Descending order (PDF coords go bottom-up)
    });

    const content = [];

    pageElements.forEach((element, idx) => {
      // Handle Text elements
      if (element.Text) {
        const node = createTextNode(element);
        if (node) {
          content.push(node);
        }
      }
      // Handle Table elements
      else if (element.Table) {
        const tableNode = createTableNode(element);
        if (tableNode) {
          content.push(tableNode);
        }
      }
      // Handle Figure/Image elements
      else if (element.Path && element.filePaths) {
        const imageNode = createImageNode(element);
        if (imageNode) {
          content.push(imageNode);
        }
      }
    });

    // If no content, add empty paragraph
    if (content.length === 0) {
      content.push({
        type: 'paragraph',
        content: []
      });
    }

    pages.push({
      content: {
        type: 'doc',
        content: content
      }
    });
  });

  console.log(`✅ Parsed ${pages.length} pages successfully`);
  return pages;
}

/**
 * Group elements by page number
 */
function groupByPage(elements) {
  const pages = {};
  
  elements.forEach(element => {
    const pageNum = element.Page || 0;
    if (!pages[pageNum]) {
      pages[pageNum] = [];
    }
    pages[pageNum].push(element);
  });

  return pages;
}

/**
 * Create a TipTap text node (paragraph or heading) from Adobe element
 */
function createTextNode(element) {
  const text = element.Text?.trim();
  if (!text) return null;

  const font = element.Font || {};
  const fontSize = font.size || 12;
  const fontName = font.name || '';
  const fontWeight = font.weight || 400;

  // Detect if this is a heading
  const isHeading = detectHeading(fontSize, fontWeight, fontName);
  
  // Build text marks (bold, italic)
  const marks = buildTextMarks(fontName, fontWeight);

  // Create the text content
  const textContent = {
    type: 'text',
    text: text
  };

  if (marks.length > 0) {
    textContent.marks = marks;
  }

  // Return paragraph or heading node
  if (isHeading) {
    const level = getHeadingLevel(fontSize);
    return {
      type: 'heading',
      attrs: { level },
      content: [textContent]
    };
  } else {
    return {
      type: 'paragraph',
      content: [textContent]
    };
  }
}

/**
 * Detect if text should be a heading based on font properties
 */
function detectHeading(fontSize, fontWeight, fontName) {
  // Large font size OR bold and larger than normal
  if (fontSize > 16) return true;
  if (fontSize > 13 && fontWeight >= 600) return true;
  if (fontName.toLowerCase().includes('heading')) return true;
  return false;
}

/**
 * Get heading level (1-6) based on font size
 */
function getHeadingLevel(fontSize) {
  if (fontSize >= 24) return 1;
  if (fontSize >= 20) return 2;
  if (fontSize >= 18) return 3;
  if (fontSize >= 16) return 4;
  if (fontSize >= 14) return 5;
  return 6;
}

/**
 * Build text marks array (bold, italic) from font properties
 */
function buildTextMarks(fontName, fontWeight) {
  const marks = [];

  // Detect bold from font name or weight
  const isBold = 
    fontWeight >= 600 ||
    fontName.includes('Bold') ||
    fontName.includes('-Bold') ||
    fontName.includes('_Bold') ||
    fontName.includes('BoldMT') ||
    fontName.includes('-BoldMT');

  if (isBold) {
    marks.push({ type: 'bold' });
  }

  // Detect italic from font name
  const isItalic = 
    fontName.includes('Italic') ||
    fontName.includes('-Italic') ||
    fontName.includes('_Italic') ||
    fontName.includes('-It') ||
    fontName.includes('Oblique');

  if (isItalic) {
    marks.push({ type: 'italic' });
  }

  return marks;
}

/**
 * Create a TipTap table node from Adobe table element
 */
function createTableNode(element) {
  // TODO: Implement table parsing
  // Adobe Extract API provides table structure in element.Table
  console.log('⚠️ Table parsing not yet implemented');
  
  return {
    type: 'paragraph',
    content: [{
      type: 'text',
      text: '[Table - parsing in progress]'
    }]
  };
}

/**
 * Create a TipTap image node from Adobe figure element
 */
function createImageNode(element) {
  // TODO: Implement image parsing
  // Adobe Extract API provides image path in element.filePaths
  console.log('⚠️ Image parsing not yet implemented');
  
  return {
    type: 'paragraph',
    content: [{
      type: 'text',
      text: '[Image - parsing in progress]'
    }]
  };
}

/**
 * Parse Mammoth.js HTML output to TipTap JSON format
 * @param {string} html - HTML from Mammoth.js
 * @returns {Object} TipTap JSON content
 */
export function parseWordHtmlToTipTap(html) {
  console.log('📄 Parsing Word HTML to TipTap...');
  
  // TipTap can directly consume HTML via editor.commands.setContent(html)
  // So we just return the HTML and let TipTap handle it
  return html;
}

/**
 * Main document parser - detects type and calls appropriate parser
 * @param {Object} data - Document data from backend
 * @param {string} type - 'pdf' or 'word'
 * @returns {Array|Object} Parsed content for TipTap
 */
export function parseDocument(data, type) {
  if (type === 'pdf') {
    return parseAdobeExtractToTipTap(data);
  } else if (type === 'word') {
    return parseWordHtmlToTipTap(data.html);
  } else {
    console.error('Unknown document type:', type);
    return [];
  }
}
