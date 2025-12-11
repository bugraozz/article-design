// LaTeX -> Unicode mapping
export const latexToUnicodeMap = {
  // Summation ve Products
  "\\sum": "∑",
  "\\prod": "∏",
  "\\coprod": "∐",
  
  // Integral
  "\\int": "∫",
  "\\iint": "∬",
  "\\iiint": "∭",
  "\\oint": "∮",
  
  // Greek letters
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\omicron": "ο",
  "\\pi": "π",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\phi": "φ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\omega": "ω",
  
  // Capital Greek
  "\\Alpha": "Α",
  "\\Beta": "Β",
  "\\Gamma": "Γ",
  "\\Delta": "Δ",
  "\\Epsilon": "Ε",
  "\\Zeta": "Ζ",
  "\\Eta": "Η",
  "\\Theta": "Θ",
  "\\Iota": "Ι",
  "\\Kappa": "Κ",
  "\\Lambda": "Λ",
  "\\Mu": "Μ",
  "\\Nu": "Ν",
  "\\Xi": "Ξ",
  "\\Omicron": "Ο",
  "\\Pi": "Π",
  "\\Rho": "Ρ",
  "\\Sigma": "Σ",
  "\\Tau": "Τ",
  "\\Upsilon": "Υ",
  "\\Phi": "Φ",
  "\\Chi": "Χ",
  "\\Psi": "Ψ",
  "\\Omega": "Ω",
  
  // Math operators
  "\\sqrt": "√",
  "\\surd": "√",
  "\\pm": "±",
  "\\mp": "∓",
  "\\times": "×",
  "\\div": "÷",
  "\\ast": "∗",
  "\\star": "★",
  "\\dagger": "†",
  "\\ddagger": "‡",
  
  // Comparison
  "\\leq": "≤",
  "\\le": "≤",
  "\\geq": "≥",
  "\\ge": "≥",
  "\\neq": "≠",
  "\\approx": "≈",
  "\\equiv": "≡",
  "\\propto": "∝",
  
  // Set operators
  "\\in": "∈",
  "\\ni": "∋",
  "\\subset": "⊂",
  "\\supset": "⊃",
  "\\subseteq": "⊆",
  "\\supseteq": "⊇",
  "\\cup": "∪",
  "\\cap": "∩",
  "\\emptyset": "∅",
  
  // Logic
  "\\forall": "∀",
  "\\exists": "∃",
  "\\neg": "¬",
  "\\wedge": "∧",
  "\\vee": "∨",
  
  // Arrows
  "\\to": "→",
  "\\rightarrow": "→",
  "\\leftarrow": "←",
  "\\leftrightarrow": "↔",
  "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐",
  "\\Leftrightarrow": "⇔",
  "\\mapsto": "↦",
  
  // Other
  "\\infty": "∞",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\hbar": "ℏ",
  "\\ell": "ℓ",
  "\\Re": "ℜ",
  "\\Im": "ℑ",
  "\\wp": "℘",
  "\\oslash": "⊘",
  "\\odot": "⊙",
  "\\otimes": "⊗",
  "\\oplus": "⊕",
};

/**
 * LaTeX komutunu Unicode'a çevir
 * Örnek: "\\sum" -> "∑"
 */
export function latexToUnicode(latex) {
  if (!latex) return latex;
  
  // Tam match: "\sum", "\alpha", vb.
  if (latexToUnicodeMap[latex]) {
    return latexToUnicodeMap[latex];
  }
  
  // Kısmi match: başında \ olmayan hali
  const withBackslash = "\\" + latex;
  if (latexToUnicodeMap[withBackslash]) {
    return latexToUnicodeMap[withBackslash];
  }
  
  return latex;
}

/**
 * HTML içindeki LaTeX'leri Unicode'a dönüştür
 */
export function convertLatexToUnicodeInHTML(html) {
  if (!html) return html;
  
  let result = html;
  
  // LaTeX pattern'leri bul ve Unicode'a çevir
  // Regex: \sum, \alpha, vb.
  result = result.replace(/\\[a-zA-Z]+/g, (match) => {
    const unicode = latexToUnicode(match);
    return unicode !== match ? unicode : match;
  });
  
  return result;
}
