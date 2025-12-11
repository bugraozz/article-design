/**
 * Unified Math System
 * MathML, OMML, LaTeX ve KaTeX hepsine uygun merkezi sistem
 * Karakter karakter düzenlenebilir, profesyonel görünüm
 */

// ==================== MATHML BUILDER ====================
export class MathMLBuilder {
  constructor() {
    this.elements = [];
  }

  static createFraction(numerator, denominator) {
    return `<mfrac><mrow>${numerator}</mrow><mrow>${denominator}</mrow></mfrac>`;
  }

  static createSuperscript(base, exponent) {
    return `<msup><mrow>${base}</mrow><mrow>${exponent}</mrow></msup>`;
  }

  static createSubscript(base, subscript) {
    return `<msub><mrow>${base}</mrow><mrow>${subscript}</mrow></msub>`;
  }

  static createRoot(radicand, degree = 2) {
    if (degree === 2) {
      return `<msqrt><mrow>${radicand}</mrow></msqrt>`;
    }
    return `<mroot><mrow>${radicand}</mrow><mn>${degree}</mn></mroot>`;
  }

  static createSum(start, end, expression) {
    return `<mrow><munderover><mo>∑</mo><mrow>${start}</mrow><mrow>${end}</mrow></munderover><mrow>${expression}</mrow></mrow>`;
  }

  static createIntegral(start, end, expression) {
    return `<mrow><munderover><mo>∫</mo><mrow>${start}</mrow><mrow>${end}</mrow></munderover><mrow>${expression}</mrow><mi>dx</mi></mrow>`;
  }

  static createIdentifier(text) {
    return `<mi>${text}</mi>`;
  }

  static createOperator(op) {
    return `<mo>${op}</mo>`;
  }

  static createNumber(num) {
    return `<mn>${num}</mn>`;
  }

  static createText(text) {
    return `<mtext>${text}</mtext>`;
  }

  static wrap(content) {
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${content}</math>`;
  }

  static wrapInline(content) {
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">${content}</math>`;
  }
}

// ==================== LATEX CONVERTER ====================
export class LaTeXConverter {
  static toMathML(latex) {
    if (!latex) return "";
    
    // KaTeX kullanırız rendering için ama MathML yapısını koruruz
    const mathml = this.latexToMathMLStructure(latex);
    return MathMLBuilder.wrap(mathml);
  }

  static latexToMathMLStructure(latex) {
    let content = latex.trim();

    // Kesir: \frac{a}{b}
    content = content.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (match, num, den) => {
      return MathMLBuilder.createFraction(
        this.processElement(num),
        this.processElement(den)
      );
    });

    // Üs: x^{2} veya x^2
    content = content.replace(/([a-zA-Z0-9])\^(\{[^}]*\}|[a-zA-Z0-9])/g, (match, base, exp) => {
      const expValue = exp.startsWith("{") ? exp.slice(1, -1) : exp;
      return MathMLBuilder.createSuperscript(
        this.processElement(base),
        this.processElement(expValue)
      );
    });

    // Alt İndeks: x_{n}
    content = content.replace(/([a-zA-Z0-9])_(\{[^}]*\}|[a-zA-Z0-9])/g, (match, base, sub) => {
      const subValue = sub.startsWith("{") ? sub.slice(1, -1) : sub;
      return MathMLBuilder.createSubscript(
        this.processElement(base),
        this.processElement(subValue)
      );
    });

    // Karekök: \sqrt{x}
    content = content.replace(/\\sqrt(\[[^\]]*\])?\{([^}]*)\}/g, (match, degree, radicand) => {
      const deg = degree ? degree.slice(1, -1) : "2";
      return MathMLBuilder.createRoot(
        this.processElement(radicand),
        deg
      );
    });

    // Toplam: \sum_{a}^{b}
    content = content.replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}([a-zA-Z0-9])?/g, (match, start, end, expr) => {
      return MathMLBuilder.createSum(
        this.processElement(start),
        this.processElement(end),
        this.processElement(expr || "a_i")
      );
    });

    // İntegral: \int_{a}^{b}
    content = content.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}([a-zA-Z0-9dx]*)?/g, (match, start, end, expr) => {
      return MathMLBuilder.createIntegral(
        this.processElement(start),
        this.processElement(end),
        this.processElement(expr || "f(x)")
      );
    });

    // Unicode karakterleri işle
    content = this.convertUnicodeToMathML(content);

    // Kalan karakterleri wrap et
    content = this.wrapCharacters(content);

    return content;
  }

  static processElement(el) {
    if (!el) return "";
    return this.wrapCharacters(el);
  }

  static convertUnicodeToMathML(text) {
    const replacements = {
      "π": `<mi>π</mi>`,
      "∑": `<mo>∑</mo>`,
      "∫": `<mo>∫</mo>`,
      "∏": `<mo>∏</mo>`,
      "√": `<mo>√</mo>`,
      "±": `<mo>±</mo>`,
      "∞": `<mo>∞</mo>`,
      "≤": `<mo>≤</mo>`,
      "≥": `<mo>≥</mo>`,
      "≠": `<mo>≠</mo>`,
      "±": `<mo>±</mo>`,
      "×": `<mo>×</mo>`,
      "÷": `<mo>÷</mo>`,
    };

    let result = text;
    for (const [char, mathml] of Object.entries(replacements)) {
      result = result.replace(new RegExp(char, "g"), mathml);
    }
    return result;
  }

  static wrapCharacters(text) {
    if (!text) return "";

    // Zaten MathML tag'ı içeriyorsa, hiç dokunma
    if (text.includes("<m")) return text;

    let result = "";
    let i = 0;
    while (i < text.length) {
      const char = text[i];

      // Operatörler
      if ("+-*/=()[]{}".includes(char)) {
        result += MathMLBuilder.createOperator(char);
      }
      // Sayılar
      else if (/\d/.test(char)) {
        let numStr = "";
        while (i < text.length && /\d/.test(text[i])) {
          numStr += text[i];
          i++;
        }
        result += MathMLBuilder.createNumber(numStr);
        continue;
      }
      // Boşluk
      else if (char === " ") {
        // Skip boşluklar
      }
      // Harfler/Değişkenler
      else {
        result += MathMLBuilder.createIdentifier(char);
      }
      i++;
    }
    return result;
  }
}

// ==================== OMML CONVERTER ====================
export class OMMlConverter {
  static toMathML(ommlXml) {
    if (!ommlXml) return "";

    let mathml = ommlXml;

    // OMML elementlerini MathML'e çevir
    mathml = mathml.replace(/<m:oMath>/g, "");
    mathml = mathml.replace(/<\/m:oMath>/g, "");
    mathml = mathml.replace(/<m:e>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:e>/g, "</mrow>");
    mathml = mathml.replace(/<m:r>/g, "");
    mathml = mathml.replace(/<\/m:r>/g, "");
    mathml = mathml.replace(/<m:t>/g, "<mi>");
    mathml = mathml.replace(/<\/m:t>/g, "</mi>");
    mathml = mathml.replace(/<m:sup>/g, "<msup>");
    mathml = mathml.replace(/<\/m:sup>/g, "</msup>");
    mathml = mathml.replace(/<m:sub>/g, "<msub>");
    mathml = mathml.replace(/<\/m:sub>/g, "</msub>");
    mathml = mathml.replace(/<m:f>/g, "<mfrac>");
    mathml = mathml.replace(/<\/m:f>/g, "</mfrac>");
    mathml = mathml.replace(/<m:num>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:num>/g, "</mrow>");
    mathml = mathml.replace(/<m:den>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:den>/g, "</mrow>");
    mathml = mathml.replace(/<m:rad>/g, "<mroot>");
    mathml = mathml.replace(/<\/m:rad>/g, "</mroot>");
    mathml = mathml.replace(/<m:radicand>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:radicand>/g, "</mrow>");
    mathml = mathml.replace(/<m:bar>/g, "<mover>");
    mathml = mathml.replace(/<\/m:bar>/g, "</mover>");
    mathml = mathml.replace(/<m:nary>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:nary>/g, "</mrow>");

    // Namespace'leri kaldır
    mathml = mathml.replace(/xmlns:[^=]+"[^"]*"/g, "");
    mathml = mathml.replace(/xmlns="[^"]*"/g, "");

    return MathMLBuilder.wrap(mathml);
  }

  static toLatex(ommlXml) {
    // Önce MathML'e çevir, sonra LaTeX'e
    const mathml = this.toMathML(ommlXml);
    return this.mathmlToLatex(mathml);
  }

  static mathmlToLatex(mathml) {
    if (!mathml) return "";

    let latex = mathml;

    // Temel MathML → LaTeX dönüşümleri
    latex = latex.replace(/<mfrac>(.*?)<\/mfrac>/g, (match, content) => {
      const parts = content.match(/<mrow>(.*?)<\/mrow>/g);
      if (parts && parts.length >= 2) {
        return `\\frac{${parts[0].replace(/<\/?mrow>/g, "")}}
                       {${parts[1].replace(/<\/?mrow>/g, "")}}`;
      }
      return match;
    });

    latex = latex.replace(/<msup>(.*?)<\/msup>/g, (match, content) => {
      const parts = content.match(/<mrow>(.*?)<\/mrow>/g);
      if (parts && parts.length >= 2) {
        return `${parts[0].replace(/<\/?mrow>/g, "")}^{${parts[1].replace(/<\/?mrow>/g, "")}}`;
      }
      return match;
    });

    latex = latex.replace(/<msub>(.*?)<\/msub>/g, (match, content) => {
      const parts = content.match(/<mrow>(.*?)<\/mrow>/g);
      if (parts && parts.length >= 2) {
        return `${parts[0].replace(/<\/?mrow>/g, "")}_{${parts[1].replace(/<\/?mrow>/g, "")}}`;
      }
      return match;
    });

    latex = latex.replace(/<msqrt>(.*?)<\/msqrt>/g, (match, content) => {
      return `\\sqrt{${content.replace(/<\/?mrow>/g, "")}}`;
    });

    latex = latex.replace(/<mroot>(.*?)<\/mroot>/g, (match, content) => {
      const parts = content.match(/<mrow>(.*?)<\/mrow>/g);
      if (parts && parts.length >= 2) {
        return `\\sqrt[${parts[1].replace(/<\/?mrow>/g, "")}]{${parts[0].replace(/<\/?mrow>/g, "")}}`;
      }
      return match;
    });

    // Tag'ları kaldır
    latex = latex.replace(/<[^>]*>/g, "");

    return latex.trim();
  }
}

// ==================== MATH ELEMENT ====================
export class MathElement {
  constructor(type, attributes = {}) {
    this.type = type; // fraction, power, subscript, root, vb.
    this.attributes = attributes;
    this.id = `math_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
    return this;
  }

  toMathML() {
    const attr = this.attributes;

    switch (this.type) {
      case "fraction":
        return MathMLBuilder.createFraction(
          this.children[0]?.toMathML() || "",
          this.children[1]?.toMathML() || ""
        );

      case "power":
        return MathMLBuilder.createSuperscript(
          this.children[0]?.toMathML() || "",
          this.children[1]?.toMathML() || ""
        );

      case "subscript":
        return MathMLBuilder.createSubscript(
          this.children[0]?.toMathML() || "",
          this.children[1]?.toMathML() || ""
        );

      case "root":
        return MathMLBuilder.createRoot(
          this.children[0]?.toMathML() || "",
          attr.degree || 2
        );

      case "number":
        return MathMLBuilder.createNumber(attr.value || "");

      case "identifier":
        return MathMLBuilder.createIdentifier(attr.value || "");

      case "operator":
        return MathMLBuilder.createOperator(attr.value || "");

      case "text":
        return MathMLBuilder.createText(attr.value || "");

      default:
        return "";
    }
  }

  toLatex() {
    const attr = this.attributes;

    switch (this.type) {
      case "fraction":
        return `\\frac{${this.children[0]?.toLatex() || ""}}
                       {${this.children[1]?.toLatex() || ""}}`;

      case "power":
        return `${this.children[0]?.toLatex() || ""}^{${
          this.children[1]?.toLatex() || ""
        }}`;

      case "subscript":
        return `${this.children[0]?.toLatex() || ""}_{${
          this.children[1]?.toLatex() || ""
        }}`;

      case "root":
        const degree = attr.degree && attr.degree !== "2" ? `[${attr.degree}]` : "";
        return `\\sqrt${degree}{${this.children[0]?.toLatex() || ""}}`;

      case "number":
      case "identifier":
      case "operator":
      case "text":
        return attr.value || "";

      default:
        return "";
    }
  }
}

// ==================== PARSER ====================
export class MathParser {
  static parseLatex(latex) {
    if (!latex) return new MathElement("text", { value: "" });

    // Basit parse - kompleks LaTeX'ler için MathJax'ı kullanırız
    const trimmed = latex.trim();

    // \frac{a}{b}
    if (trimmed.includes("\\frac")) {
      const match = trimmed.match(/\\frac\{([^}]*)\}\{([^}]*)\}/);
      if (match) {
        const frac = new MathElement("fraction");
        frac.addChild(this.parseLatex(match[1]));
        frac.addChild(this.parseLatex(match[2]));
        return frac;
      }
    }

    // x^{2}
    if (trimmed.includes("^")) {
      const match = trimmed.match(/(.+?)\^\{(.+?)\}/);
      if (match) {
        const power = new MathElement("power");
        power.addChild(this.parseLatex(match[1]));
        power.addChild(this.parseLatex(match[2]));
        return power;
      }
    }

    // x_{n}
    if (trimmed.includes("_")) {
      const match = trimmed.match(/(.+?)_\{(.+?)\}/);
      if (match) {
        const sub = new MathElement("subscript");
        sub.addChild(this.parseLatex(match[1]));
        sub.addChild(this.parseLatex(match[2]));
        return sub;
      }
    }

    // \sqrt{x}
    if (trimmed.includes("\\sqrt")) {
      const match = trimmed.match(/\\sqrt(?:\[(\d+)\])?\{([^}]*)\}/);
      if (match) {
        const root = new MathElement("root", { degree: match[1] || "2" });
        root.addChild(this.parseLatex(match[2]));
        return root;
      }
    }

    // Düz metin/sayı
    if (/^\d+$/.test(trimmed)) {
      return new MathElement("number", { value: trimmed });
    }

    if (/^[a-zA-Z]$/.test(trimmed)) {
      return new MathElement("identifier", { value: trimmed });
    }

    return new MathElement("text", { value: trimmed });
  }

  static parseMathML(mathml) {
    // MathML'den parse et - DOM API kullanırız
    const parser = new DOMParser();
    const doc = parser.parseFromString(mathml, "text/xml");
    const math = doc.querySelector("math");

    if (!math) {
      return new MathElement("text", { value: mathml });
    }

    return this.parseMathMLElement(math);
  }

  static parseMathMLElement(node) {
    const tagName = node.tagName.toLowerCase();

    switch (tagName) {
      case "mfrac":
        const frac = new MathElement("fraction");
        const children = node.children;
        if (children[0]) frac.addChild(this.parseMathMLElement(children[0]));
        if (children[1]) frac.addChild(this.parseMathMLElement(children[1]));
        return frac;

      case "msup":
        const sup = new MathElement("power");
        const supChildren = node.children;
        if (supChildren[0]) sup.addChild(this.parseMathMLElement(supChildren[0]));
        if (supChildren[1]) sup.addChild(this.parseMathMLElement(supChildren[1]));
        return sup;

      case "msub":
        const sub = new MathElement("subscript");
        const subChildren = node.children;
        if (subChildren[0]) sub.addChild(this.parseMathMLElement(subChildren[0]));
        if (subChildren[1]) sub.addChild(this.parseMathMLElement(subChildren[1]));
        return sub;

      case "msqrt":
      case "mroot":
        const root = new MathElement("root");
        const rootChildren = node.children;
        if (rootChildren[0]) root.addChild(this.parseMathMLElement(rootChildren[0]));
        return root;

      case "mi":
      case "mn":
      case "mo":
      case "mtext":
        return new MathElement(
          tagName === "mn" ? "number" : tagName === "mi" ? "identifier" : "operator",
          { value: node.textContent }
        );

      case "mrow":
        // mrow sadece konteyner
        if (node.children.length === 1) {
          return this.parseMathMLElement(node.children[0]);
        }
        return new MathElement("text", { value: node.textContent });

      default:
        return new MathElement("text", { value: node.textContent });
    }
  }
}

// ==================== SANITIZER ====================
export class MathSanitizer {
  static sanitizeMathML(html) {
    const allowedTags = [
      "math",
      "mrow",
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "msup",
      "msub",
      "msubsup",
      "mfrac",
      "mroot",
      "msqrt",
      "mstyle",
      "mpadded",
      "merror",
      "mphantom",
      "mfenced",
      "mtable",
      "mtr",
      "mtd",
      "munder",
      "mover",
      "munderover",
    ];

    const allowedAttributes = {
      math: ["display", "xmlns"],
      mstyle: ["displaystyle", "scriptlevel"],
      mtext: ["mathvariant"],
      mi: ["mathvariant"],
      mo: ["stretchy", "symmetric"],
      mfrac: ["bevelled", "linethickness"],
      mroot: [],
      mtable: ["columnalign", "rowspacing"],
    };

    const div = document.createElement("div");
    div.innerHTML = html;

    const sanitizeNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return true;

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        if (!allowedTags.includes(tagName)) {
          while (node.firstChild) {
            node.parentNode.insertBefore(node.firstChild, node);
          }
          node.parentNode.removeChild(node);
          return false;
        }

        const attrs = [...node.attributes];
        attrs.forEach((attr) => {
          if (!allowedAttributes[tagName]?.includes(attr.name)) {
            node.removeAttribute(attr.name);
          }
        });

        const children = [...node.childNodes];
        children.forEach(sanitizeNode);
      }
    };

    sanitizeNode(div);
    return div.innerHTML;
  }

  static escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  static sanitizeLatex(latex) {
    // Tehlikeli LaTeX komutlarını kaldır
    const dangerousPatterns = [
      /\\immediate\\write18/gi, // Shell commands
      /\\input|\\include/gi, // File access
      /\\\\/gi, // Excessive backslashes
    ];

    let cleaned = latex;
    dangerousPatterns.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "");
    });

    return cleaned;
  }
}

export default {
  MathMLBuilder,
  LaTeXConverter,
  OMMlConverter,
  MathElement,
  MathParser,
  MathSanitizer,
};
