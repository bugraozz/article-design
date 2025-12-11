/**
 * LaTeX to MathML - İçeriğe doğrudan LaTeX ekle
 * Render işlemi TextOverlay display modda KaTeX ile yapılacak
 */

export function latexToMathML(latex) {
  if (!latex) return "";

  let expr = latex.trim();

  // Unicode sembollerini LaTeX'e çevir
  expr = expr.replace(/Σ/g, "\\sum");
  expr = expr.replace(/∫/g, "\\int");
  expr = expr.replace(/∏/g, "\\prod");
  expr = expr.replace(/π/g, "\\pi");
  expr = expr.replace(/α/g, "\\alpha");
  expr = expr.replace(/β/g, "\\beta");
  expr = expr.replace(/γ/g, "\\gamma");
  expr = expr.replace(/δ/g, "\\delta");
  expr = expr.replace(/θ/g, "\\theta");
  expr = expr.replace(/λ/g, "\\lambda");
  expr = expr.replace(/ω/g, "\\omega");
  expr = expr.replace(/±/g, "\\pm");
  expr = expr.replace(/∞/g, "\\infty");
  expr = expr.replace(/≤/g, "\\leq");
  expr = expr.replace(/≥/g, "\\geq");
  expr = expr.replace(/√/g, "\\sqrt");

  // marker span dön - basit text içinde
  return `<span class="math-equation" data-latex="${expr.replace(/"/g, "&quot;")}" contentEditable="false">📐</span>`;
}

export default latexToMathML;


