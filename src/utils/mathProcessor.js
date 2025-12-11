/**
 * MathJax kullanarak OMML, LaTeX ve MathML'i işleme
 */

let MathJaxReady = false;
let mathjax = null;

// MathJax yükle
export async function initMathJax() {
  if (MathJaxReady) return;
  
  // Global olarak MathJax'ı erişim sağla
  if (!window.MathJax) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    script.onload = () => {
      MathJaxReady = true;
      mathjax = window.MathJax;
    };
    document.head.appendChild(script);
  } else {
    MathJaxReady = true;
    mathjax = window.MathJax;
  }
}

/**
 * OMML HTML'i LaTeX'e çevir
 * Word/Google Docs formüllerini işler
 */
export function ommlToLatex(ommlHtml) {
  try {
    // OMML XML'i al
    const parser = new DOMParser();
    const doc = parser.parseFromString(ommlHtml, 'text/html');
    
    // oMath elementini bul
    const oMath = doc.querySelector('[style*="mso-formula"]') || 
                  ommlHtml.includes('oMath') ? extractOmml(ommlHtml) : null;
    
    if (!oMath) return null;
    
    // Basit OMML → LaTeX dönüşümü
    let latex = ommlHtml
      .replace(/<m:oMath>/g, '')
      .replace(/<\/m:oMath>/g, '')
      .replace(/<m:e>/g, '')
      .replace(/<\/m:e>/g, '')
      .replace(/<m:r>/g, '')
      .replace(/<\/m:r>/g, '')
      .replace(/<m:t>/g, '')
      .replace(/<\/m:t>/g, '')
      .replace(/<m:num>/g, '{')
      .replace(/<\/m:num>/g, '}')
      .replace(/<m:den>/g, '{')
      .replace(/<\/m:den>/g, '}')
      .replace(/<m:f>/g, '\\frac')
      .replace(/<\/m:f>/g, '')
      .replace(/<m:sup>/g, '^{')
      .replace(/<\/m:sup>/g, '}')
      .replace(/<m:sub>/g, '_{')
      .replace(/<\/m:sub>/g, '}')
      .replace(/<m:bar>/g, '\\overline{')
      .replace(/<\/m:bar>/g, '}')
      .replace(/xmlns:m="[^"]*"/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    
    return latex || null;
  } catch (e) {
    console.error('OMML parsing error:', e);
    return null;
  }
}

function extractOmml(html) {
  const match = html.match(/<m:oMath>[\s\S]*?<\/m:oMath>/);
  return match ? match[0] : null;
}

/**
 * HTML içinde math elementlerini (LaTeX, MathML, OMML) process et
 */
export async function processMath(htmlString) {
  if (!window.MathJax) {
    await initMathJax();
  }

  // Temporary container oluştur
  const container = document.createElement('div');
  container.innerHTML = htmlString;
  
  // LaTeX'i MathML'e çevir (MathJax kullanarak)
  try {
    await window.MathJax.typesetPromise?.([container]) || 
           window.MathJax.contentDocument?.()?.typeset?.([container]);
  } catch (e) {
    console.warn('MathJax typeset error:', e);
  }
  
  return container.innerHTML;
}

/**
 * LaTeX string'i MathML HTML'e çevir
 */
export function latexToMathML(latex) {
  try {
    // MathJax wrapper kullan
    const html = `\\(${latex}\\)`;
    
    // Async işlem için promise döndür
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.innerHTML = html;
      
      if (window.MathJax) {
        window.MathJax.typesetPromise?.([container])
          .then(() => {
            resolve(container.innerHTML);
          })
          .catch(() => resolve(`<span class="math">${latex}</span>`));
      } else {
        resolve(`<span class="math">${latex}</span>`);
      }
    });
  } catch (e) {
    console.error('LaTeX to MathML error:', e);
    return Promise.resolve(`<span class="math">${latex}</span>`);
  }
}
