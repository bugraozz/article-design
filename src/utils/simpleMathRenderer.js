/**
 * Simple Math Renderer
 * Minimal LaTeX → KaTeX/MathJax rendering
 * OMML, LaTeX, MathML desteği
 */

// KaTeX ve MathJax hazırlama
let MathJaxReady = false;

export async function initMathJax() {
  return new Promise((resolve) => {
    if (MathJaxReady || window.MathJax) {
      MathJaxReady = true;
      resolve(window.MathJax);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    script.onload = () => {
      MathJaxReady = true;
      // MathJax auto-typeset
      if (window.MathJax?.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
      }
      resolve(window.MathJax);
    };
    script.onerror = () => {
      console.warn("MathJax yüklenemedi");
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

/**
 * LaTeX'i KaTeX ile render et
 */
export async function renderLatexWithKaTeX(latex, element) {
  try {
    const katex = await import("katex");
    element.innerHTML = "";
    katex.render(latex, element, {
      displayMode: true,
      throwOnError: false,
    });
    return true;
  } catch (error) {
    console.warn("KaTeX error:", error);
    // Fallback to MathJax
    if (MathJaxReady && window.MathJax?.typesetPromise) {
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
 * OMML (Word) → LaTeX dönüşümü
 */
export function ommlToLatex(ommlXml) {
  try {
    let latex = ommlXml;
    
    // OMML tag'larını LaTeX'e çevir
    latex = latex.replace(/<m:oMath>/g, "");
    latex = latex.replace(/<\/m:oMath>/g, "");
    latex = latex.replace(/<m:f>/g, "\\frac{");
    latex = latex.replace(/<m:num>([\s\S]*?)<\/m:num>/g, "$1");
    latex = latex.replace(/<m:den>([\s\S]*?)<\/m:den>/g, "}{$1");
    latex = latex.replace(/<m:e>/g, "");
    latex = latex.replace(/<\/m:e>/g, "");
    latex = latex.replace(/<m:r>/g, "");
    latex = latex.replace(/<\/m:r>/g, "");
    latex = latex.replace(/<m:t>/g, "");
    latex = latex.replace(/<\/m:t>/g, "");
    latex = latex.replace(/<m:sup>/g, "^{");
    latex = latex.replace(/<\/m:sup>/g, "}");
    latex = latex.replace(/<m:sub>/g, "_{");
    latex = latex.replace(/<\/m:sub>/g, "}");
    latex = latex.replace(/<[^>]+>/g, "");
    
    return latex.trim();
  } catch (e) {
    console.error("OMML parsing error:", e);
    return ommlXml;
  }
}

/**
 * HTML paste'ten LaTeX'i çıkar
 */
export function extractLatexFromPaste(htmlData) {
  // OMML (Word) kontrolü
  if (htmlData.includes("<m:oMath")) {
    return ommlToLatex(htmlData);
  }
  
  // MathML kontrolü
  if (htmlData.includes("<math")) {
    // Basit MathML → LaTeX (gelişmiş versiyonda)
    return htmlData;
  }
  
  // LaTeX kontrolü
  if (htmlData.includes("\\")) {
    return htmlData.replace(/<[^>]+>/g, "").trim();
  }
  
  return null;
}

/**
 * Matematiksel içeriği bul ve işle
 */
export async function processLatexInContainer(container) {
  if (!container) return;
  
  // [data-math="..."] elementlerini bul ve render et
  const mathElements = container.querySelectorAll("[data-math]");
  
  for (const el of mathElements) {
    const latex = el.getAttribute("data-math");
    if (latex) {
      await renderLatexWithKaTeX(latex, el);
    }
  }
  
  // MathJax typeset
  if (MathJaxReady && window.MathJax?.typesetPromise) {
    await window.MathJax.typesetPromise([container]).catch(() => {});
  }
}

export default {
  initMathJax,
  renderLatexWithKaTeX,
  ommlToLatex,
  extractLatexFromPaste,
  processLatexInContainer,
};
