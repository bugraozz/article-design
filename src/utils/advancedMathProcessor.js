/**
 * Advanced Math Processor
 * KaTeX + MathJax entegre sistem
 * OMML, LaTeX, MathML desteği
 */

import { LaTeXConverter, OMMlConverter, MathSanitizer } from "./mathSystem";

let MathJaxReady = false;
let KaTeXReady = true; // KaTeX npm'den gelir, zaten yüklü

// MathJax 3 CDN script yükle
export async function initAdvancedMathJax() {
  return new Promise((resolve) => {
    if (MathJaxReady || window.MathJax) {
      MathJaxReady = true;
      resolve(window.MathJax);
      return;
    }

    const script = document.createElement("script");
    script.id = "mathjax-script";
    script.src =
      "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    script.onload = () => {
      // MathJax 3 konfigurasyonu
      window.MathJax = {
        tex: {
          inlineMath: [["$", "$"]],
          displayMath: [["$$", "$$"]],
          processEscapes: true,
          packages: {
            "[+]": ["noerrors"],
          },
        },
        chtml: {
          fontURL:
            "https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2",
          scale: 1.0,
        },
        startup: {
          pageReady: () => {
            MathJaxReady = true;
            resolve(window.MathJax);
          },
        },
      };

      // Scriptı load et
      const newScript = document.createElement("script");
      newScript.id = "mathjax-config";
      newScript.type = "text/javascript";
      newScript.textContent = `
        MathJax = {
          tex: {
            inlineMath: [['$', '$']],
            displayMath: [['$$', '$$']],
            processEscapes: true
          },
          chtml: {
            scale: 1.0
          }
        };
      `;
      document.head.appendChild(newScript);

      script.onload = () => {
        MathJaxReady = true;
        if (window.MathJax?.typesetPromise) {
          window.MathJax.typesetPromise().catch((err) => {
            console.warn("MathJax initial typeset error:", err);
          });
        }
        resolve(window.MathJax);
      };
    };
    script.onerror = () => {
      console.warn("MathJax loading failed, falling back to KaTeX only");
      MathJaxReady = false;
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

// ==================== UNIFIED MATH PROCESSOR ====================
export class AdvancedMathProcessor {
  /**
   * Genel math içeriğini işle (OMML, LaTeX, MathML)
   */
  static async processMath(htmlString, options = {}) {
    const {
      inputFormat = "auto", // auto, latex, mathml, omml
      outputFormat = "mathml", // mathml, latex, html
      sanitize = true,
      render = false,
    } = options;

    try {
      let content = htmlString;

      // Format tespiti
      let format = inputFormat;
      if (format === "auto") {
        if (htmlString.includes("<m:oMath")) {
          format = "omml";
        } else if (htmlString.includes("<math")) {
          format = "mathml";
        } else if (htmlString.includes("\\")) {
          format = "latex";
        } else {
          format = "latex";
        }
      }

      // Sanitize et
      if (sanitize) {
        if (format === "mathml") {
          content = MathSanitizer.sanitizeMathML(content);
        } else if (format === "latex") {
          content = MathSanitizer.sanitizeLatex(content);
        }
      }

      // İstenilen formata çevir
      let result = content;

      if (format === "omml") {
        const mathml = OMMlConverter.toMathML(content);
        if (outputFormat === "mathml") {
          result = mathml;
        } else if (outputFormat === "latex") {
          result = OMMlConverter.toLatex(content);
        }
      } else if (format === "mathml") {
        if (outputFormat === "latex") {
          result = OMMlConverter.mathmlToLatex(content);
        } else {
          result = content;
        }
      } else if (format === "latex") {
        if (outputFormat === "mathml") {
          result = LaTeXConverter.toMathML(content);
        } else {
          result = content;
        }
      }

      // Render et (MathJax)
      if (render && MathJaxReady) {
        await this.renderWithMathJax(result);
      }

      return result;
    } catch (error) {
      console.error("Math processing error:", error);
      return htmlString;
    }
  }

  /**
   * LaTeX'i render et
   */
  static async renderLatex(latex, element) {
    try {
      // KaTeX ile render et
      const katex = await import("katex");
      element.innerHTML = "";
      katex.render(latex, element, {
        displayMode: true,
        throwOnError: false,
      });
      return true;
    } catch (error) {
      console.warn("KaTeX render failed:", error);
      // Fallback to MathJax
      if (MathJaxReady && window.MathJax) {
        element.innerHTML = `$$${latex}$$`;
        await window.MathJax.typesetPromise([element]).catch(() => {
          element.innerHTML = `<code>${latex}</code>`;
        });
        return true;
      }
      element.innerHTML = `<code>${latex}</code>`;
      return false;
    }
  }

  /**
   * MathML'i render et
   */
  static async renderMathML(mathml, element) {
    try {
      element.innerHTML = MathSanitizer.sanitizeMathML(mathml);

      if (MathJaxReady && window.MathJax) {
        await window.MathJax.typesetPromise([element]);
      }
      return true;
    } catch (error) {
      console.warn("MathML render failed:", error);
      return false;
    }
  }

  /**
   * HTML içindeki tüm math'ları render et
   */
  static async renderAllMath(container) {
    if (!container) return;

    try {
      // LaTeX $$ patterns
      const latexRegex = /\$\$(.+?)\$\$/gs;
      const mathElements = container.querySelectorAll("[data-math]");

      if (MathJaxReady && window.MathJax?.typesetPromise) {
        await window.MathJax.typesetPromise([container]);
      }

      // Her math elementi işle
      mathElements.forEach((el) => {
        const content = el.getAttribute("data-math");
        const type = el.getAttribute("data-type") || "latex";

        if (type === "latex") {
          this.renderLatex(content, el);
        } else if (type === "mathml") {
          this.renderMathML(content, el);
        }
      });
    } catch (error) {
      console.error("Error rendering math:", error);
    }
  }

  /**
   * MathJax ile render et
   */
  static async renderWithMathJax(element) {
    if (!MathJaxReady || !window.MathJax?.typesetPromise) return;

    try {
      await window.MathJax.typesetPromise([element]);
    } catch (error) {
      console.warn("MathJax typeset error:", error);
    }
  }

  /**
   * OMML'i KaTeX-uyumlu LaTeX'e çevir
   */
  static convertOmmlToLatex(ommlXml) {
    return OMMlConverter.toLatex(ommlXml);
  }

  /**
   * LaTeX'i MathML'e çevir
   */
  static convertLatexToMathML(latex) {
    return LaTeXConverter.toMathML(latex);
  }

  /**
   * HTML paste handler
   */
  static async handlePasteHTML(htmlData) {
    const result = {
      format: "unknown",
      content: htmlData,
      latex: null,
      mathml: null,
    };

    try {
      // OMML (Word)
      if (htmlData.includes("<m:oMath")) {
        result.format = "omml";
        result.latex = this.convertOmmlToLatex(htmlData);
        result.mathml = OMMlConverter.toMathML(htmlData);
      }
      // MathML
      else if (htmlData.includes("<math")) {
        result.format = "mathml";
        result.mathml = htmlData;
        result.latex = OMMlConverter.mathmlToLatex(htmlData);
      }
      // LaTeX
      else if (htmlData.includes("\\")) {
        result.format = "latex";
        result.latex = htmlData;
        result.mathml = this.convertLatexToMathML(htmlData);
      }
    } catch (error) {
      console.error("Paste handling error:", error);
    }

    return result;
  }
}

/**
 * React Hook - Math rendering
 */
export function useMathRender() {
  const renderMath = async (content, type = "latex", container = null) => {
    if (!container) return;

    try {
      if (type === "latex") {
        await AdvancedMathProcessor.renderLatex(content, container);
      } else if (type === "mathml") {
        await AdvancedMathProcessor.renderMathML(content, container);
      }
    } catch (error) {
      console.error("Render error:", error);
    }
  };

  return { renderMath };
}

/**
 * Initialization
 */
export async function initializeMathSystem() {
  try {
    await initAdvancedMathJax();
    console.log("Math system initialized successfully");
  } catch (error) {
    console.warn("Math system initialization warning:", error);
  }
}

export default AdvancedMathProcessor;
