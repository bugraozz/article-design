/**
 * Equation Manager - Google Docs style equation handling
 * Separates equations from HTML content to prevent wrapper issues
 */

const EQUATION_MARKER_PREFIX = "{{EQ_";
const EQUATION_MARKER_SUFFIX = "_EQ}}";

export function createEquationMarker(id) {
  return `${EQUATION_MARKER_PREFIX}${id}${EQUATION_MARKER_SUFFIX}`;
}

export function isEquationMarker(text) {
  return text.includes(EQUATION_MARKER_PREFIX) && text.includes(EQUATION_MARKER_SUFFIX);
}

export function extractEquationIdFromMarker(marker) {
  const match = marker.match(/{{EQ_(.+?)_EQ}}/);
  return match ? match[1] : null;
}

/**
 * Convert HTML with equation spans to plain text with markers
 * Returns: { text, equations: [{id, latex}] }
 */
export function extractEquationsFromHTML(html) {
  if (!html || html.trim() === "") {
    return { text: "", equations: [] };
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const equations = [];
  const equationMap = new Map();

  const equationSpans = tempDiv.querySelectorAll("[data-latex]");

  equationSpans.forEach((span) => {
    const latex = span.getAttribute("data-latex");

    if (!equationMap.has(latex)) {
      const id = `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      equationMap.set(latex, id);
      equations.push({ id, latex });
    }

    const id = equationMap.get(latex);
    const marker = createEquationMarker(id);
    span.replaceWith(marker);
  });

  return {
    text: tempDiv.innerText || "",
    equations,
  };
}

/**
 * Convert plain text with markers back to HTML with equation spans
 */
export function injectEquationsIntoHTML(text, equations) {
  let html = text;

  if (!equations || equations.length === 0) {
    return html;
  }

  equations.forEach((eq) => {
    const marker = createEquationMarker(eq.id);
    const escapedLatex = eq.latex.replace(/"/g, "&quot;");
    const equationSpan = `<span class="equation-code" data-latex="${escapedLatex}" style="background-color: #e8eef7; padding: 2px 4px; border-left: 3px solid #3b82f6; color: #1e40af; font-family: monospace;">${eq.latex}</span>`;

    html = html.replace(marker, equationSpan);
  });

  return html;
}

/**
 * Merge equations from editing - detect new LaTeX patterns
 */
export function mergeEquationsIntoText(editingText, existingEquations) {
  let text = editingText;
  const newEquations = [...(existingEquations || [])];
  const eqMap = new Map();

  (existingEquations || []).forEach((eq) => {
    eqMap.set(eq.latex, eq.id);
  });

  const latexPatterns = [
    /\\sum_?\{[^}]*\}\^?\{[^}]*\}/g,
    /\\prod_?\{[^}]*\}\^?\{[^}]*\}/g,
    /\\int_?\{[^}]*\}\^?\{[^}]*\}/g,
    /\\sqrt\[[^\]]*\]\{[^}]*\}/g,
    /\\sqrt\{[^}]*\}/g,
    /\\frac\{[^}]*\}\{[^}]*\}/g,
    /\\pi\b/g,
    /\\infty\b/g,
    /\\alpha\b|\\beta\b|\\gamma\b|\\delta\b|\\theta\b|\\lambda\b|\\mu\b|\\nu\b|\\xi\b|\\omega\b/g,
    /\\sum\^/g,
    /\\prod\^/g,
    /\\int/g,
  ];

  // Match ve replace işlemi - duplicate'ı önle
  latexPatterns.forEach((pattern) => {
    let processedMatches = new Set();
    let matches;
    
    // All matches'i bul
    while ((matches = pattern.exec(text)) !== null) {
      const latex = matches[0];
      const position = matches.index;
      const matchKey = `${latex}@${position}`;
      
      if (processedMatches.has(matchKey)) continue;
      processedMatches.add(matchKey);

      if (!eqMap.has(latex)) {
        const id = `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        eqMap.set(latex, id);
        newEquations.push({ id, latex });
      }

      const id = eqMap.get(latex);
      const marker = createEquationMarker(id);
      // İlk occurrence'ını replace et
      text = text.replace(latex, marker);
      
      // Reset pattern global state
      pattern.lastIndex = 0;
    }
  });

  return { text, equations: newEquations };
}
