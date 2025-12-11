/**
 * LaTeX'i Unicode'a çevir
 * Örnekler:
 * x^2 → x²
 * x_1 → x₁
 * \sqrt{x} → √x
 * \frac{a}{b} → a/b
 */

const superscriptMap = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  "a": "ᵃ",
  "b": "ᵇ",
  "c": "ᶜ",
  "d": "ᵈ",
  "e": "ᵉ",
  "f": "ᶠ",
  "g": "ᵍ",
  "h": "ʰ",
  "i": "ⁱ",
  "j": "ʲ",
  "k": "ᵏ",
  "l": "ˡ",
  "m": "ᵐ",
  "n": "ⁿ",
  "o": "ᵒ",
  "p": "ᵖ",
  "r": "ʳ",
  "s": "ˢ",
  "t": "ᵗ",
  "u": "ᵘ",
  "v": "ᵛ",
  "w": "ʷ",
  "x": "ˣ",
  "y": "ʸ",
  "z": "ᶻ",
};

const subscriptMap = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  "a": "ₐ",
  "e": "ₑ",
  "h": "ₕ",
  "i": "ᵢ",
  "j": "ⱼ",
  "k": "ₖ",
  "l": "ₗ",
  "m": "ₘ",
  "n": "ₙ",
  "o": "ₒ",
  "p": "ₚ",
  "r": "ᵣ",
  "s": "ₛ",
  "t": "ₜ",
  "u": "ᵤ",
  "v": "ᵥ",
  "x": "ₓ",
};

const greekLetters = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\Gamma": "Γ",
  "\\delta": "δ",
  "\\Delta": "Δ",
  "\\epsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\Theta": "Θ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\Lambda": "Λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\Xi": "Ξ",
  "\\pi": "π",
  "\\Pi": "Π",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\Sigma": "Σ",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\Upsilon": "Υ",
  "\\phi": "φ",
  "\\Phi": "Φ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\Psi": "Ψ",
  "\\omega": "ω",
  "\\Omega": "Ω",
};

const mathOperators = {
  "\\sqrt": "√",
  "\\sum": "∑",
  "\\prod": "∏",
  "\\int": "∫",
  "\\iint": "∬",
  "\\iiint": "∭",
  "\\oint": "∮",
  "\\infty": "∞",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\times": "×",
  "\\div": "÷",
  "\\pm": "±",
  "\\mp": "∓",
  "\\cdot": "·",
  "\\leq": "≤",
  "\\geq": "≥",
  "\\neq": "≠",
  "\\approx": "≈",
  "\\equiv": "≡",
  "\\propto": "∝",
  "\\in": "∈",
  "\\notin": "∉",
  "\\subset": "⊂",
  "\\subseteq": "⊆",
  "\\supset": "⊃",
  "\\supseteq": "⊇",
  "\\cup": "∪",
  "\\cap": "∩",
  "\\emptyset": "∅",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\neg": "¬",
  "\\wedge": "∧",
  "\\vee": "∨",
  "\\to": "→",
  "\\leftarrow": "←",
  "\\updownarrow": "↕",
  "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐",
  "\\Leftrightarrow": "⇔",
};

const numberSets = {
  "\\mathbb{R}": "ℝ",
  "\\mathbb{N}": "ℕ",
  "\\mathbb{Z}": "ℤ",
  "\\mathbb{Q}": "ℚ",
  "\\mathbb{C}": "ℂ",
};

const trigFunctions = {
  "\\sin": "sin",
  "\\cos": "cos",
  "\\tan": "tan",
  "\\cot": "cot",
  "\\sec": "sec",
  "\\csc": "csc",
  "\\arcsin": "arcsin",
  "\\arccos": "arccos",
  "\\arctan": "arctan",
  "\\log": "log",
  "\\ln": "ln",
  "\\exp": "exp",
};

export function convertLatexToUnicode(latex) {
  if (!latex) return "";

  let result = latex;

  // ========================
  // ÖZEL DURUM: Σ, Π, ∫, lim vb.
  // ========================
  // Σ_{i=1}^{n} → Σ ᵢ₌₁ ⁿ (daha okunabilir)
  // ∫_a^b → ∫ ₐ ᵇ
  
  if (
    (result.includes("Σ") || result.includes("Π") || result.includes("∫") ||
      result.includes("∑") || result.includes("∏") || result.includes("lim")) &&
    (result.includes("_{") || result.includes("^{"))
  ) {
    // Önce parantezleri çıkar
    result = result.replace(/{/g, "");
    result = result.replace(/}/g, "");
    
    // Sonra _ ve ^ işaretlerinin ardındaki karakterleri subscript/superscript yap
    // _{i=1} → subscript(i)=subscript(1)
    // ^{n} → superscript(n)
    
    const superscriptMap = {
      "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
      "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
      "+": "⁺", "-": "⁻", "=": "⁼", "n": "ⁿ", "i": "ⁱ", "x": "ˣ",
    };
    
    const subscriptMap = {
      "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
      "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
      "+": "₊", "-": "₋", "=": "₌", "i": "ᵢ", "a": "ₐ", "x": "ₓ",
    };
    
    // _(...) → subscript dönüştür
    result = result.replace(/_([a-zA-Z0-9=+-]+)/g, (match, content) => {
      return content
        .split("")
        .map((c) => subscriptMap[c] || c)
        .join("");
    });
    
    // ^(...) → superscript dönüştür
    result = result.replace(/\^([a-zA-Z0-9=+-]+)/g, (match, content) => {
      return content
        .split("")
        .map((c) => superscriptMap[c] || c)
        .join("");
    });
    
    return result;
  }

  // ========================
  // NORMAL DURUM: Diğer LaTeX komutları
  // ========================
  
  // 1. Kesirler
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2");

  // 2. Kökler
  result = result.replace(/\\sqrt\{([^}]+)\}/g, "√$1");
  result = result.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, (match, n, x) => {
    const nSuper = n
      .split("")
      .map((c) => superscriptMap[c] || c)
      .join("");
    return nSuper + "√" + x;
  });

  // 3. Üst indeksler (normal durum için)
  result = result.replace(/\^{([^}]+)}/g, (match, content) => {
    return content
      .split("")
      .map((char) => superscriptMap[char] || char)
      .join("");
  });

  result = result.replace(/\^([a-zA-Z0-9+\-=])/g, (match, char) => {
    return superscriptMap[char] || char;
  });

  // 4. Alt indeksler (normal durum için)
  result = result.replace(/_{([^}]+)}/g, (match, content) => {
    return content
      .split("")
      .map((char) => subscriptMap[char] || char)
      .join("");
  });

  result = result.replace(/_([a-zA-Z0-9+\-=])/g, (match, char) => {
    return subscriptMap[char] || char;
  });

  // 5. Yunanca harfler
  for (const [tex, uni] of Object.entries(greekLetters)) {
    result = result.replace(new RegExp(tex, "g"), uni);
  }

  // 6. Matematik operatörleri
  for (const [tex, uni] of Object.entries(mathOperators)) {
    result = result.replace(new RegExp(tex, "g"), uni);
  }

  // 7. Sayı setleri
  for (const [tex, uni] of Object.entries(numberSets)) {
    result = result.replace(new RegExp(tex, "g"), uni);
  }

  // 8. Trigonometrik fonksiyonlar
  for (const [tex, uni] of Object.entries(trigFunctions)) {
    result = result.replace(new RegExp(tex, "g"), uni);
  }

  // 9. Temizlik
  result = result.replace(/\\text\{([^}]+)\}/g, "$1");
  result = result.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  result = result.replace(/\{/g, "");
  result = result.replace(/\}/g, "");
  result = result.replace(/\s+/g, " ");

  return result.trim();
}

export default convertLatexToUnicode;
