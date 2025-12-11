import katex from 'katex';

/**
 * HTML içinde bulunan matematik içeriğini işler ve KaTeX ile render eder
 * Desteklenen formatlar:
 * - LaTeX: $...$ (inline), $$...$$ (display)
 * - Data attributes: data-latex="..."
 * - MathML: <math>...</math>
 * - OMML: Office Math içeriği
 */
export function processMathInHTML(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') return htmlString;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // 1. data-latex attribute'lu elementleri işle
  const mathElements = tempDiv.querySelectorAll('[data-latex]');
  mathElements.forEach((el) => {
    const latex = el.getAttribute('data-latex');
    if (latex) {
      try {
        const isDisplay = el.classList.contains('math-block') || el.tagName === 'DIV';
        const rendered = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: isDisplay,
          output: 'html',
          trust: true,
          strict: false,
        });
        el.innerHTML = rendered;
        el.classList.add('katex-rendered');
      } catch (error) {
        console.warn('KaTeX render error:', error);
      }
    }
  });

  // 2. $...$ ve $$...$$ pattern'lerini işle
  let processedHTML = tempDiv.innerHTML;

  // Display math $$...$$ (önce işle ki inline ile karışmasın)
  processedHTML = processedHTML.replace(/\$\$([^$]+?)\$\$/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        trust: true,
        strict: false,
      });
      return `<div class="math-block katex-rendered" data-latex="${latex.trim()}">${rendered}</div>`;
    } catch (error) {
      return match;
    }
  });

  // Inline math $...$
  processedHTML = processedHTML.replace(/\$([^$]+?)\$/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        trust: true,
        strict: false,
      });
      return `<span class="math-inline katex-rendered" data-latex="${latex.trim()}">${rendered}</span>`;
    } catch (error) {
      return match;
    }
  });

  // 3. \(...\) ve \[...\] LaTeX delimiters
  processedHTML = processedHTML.replace(/\\\((.+?)\\\)/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        trust: true,
        strict: false,
      });
      return `<span class="math-inline katex-rendered" data-latex="${latex.trim()}">${rendered}</span>`;
    } catch (error) {
      return match;
    }
  });

  processedHTML = processedHTML.replace(/\\\[(.+?)\\\]/g, (match, latex) => {
    try {
      const rendered = katex.renderToString(latex.trim(), {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        trust: true,
        strict: false,
      });
      return `<div class="math-block katex-rendered" data-latex="${latex.trim()}">${rendered}</div>`;
    } catch (error) {
      return match;
    }
  });

  return processedHTML;
}

/**
 * Yapıştırılan içeriği temizler ve matematik formatlarını korur
 */
export function sanitizePastedContent(content) {
  if (!content) return content;

  // MathML algıla ve LaTeX'e çevir
  if (content.includes('<math') || content.includes('</math>')) {
    content = convertMathMLToLaTeX(content);
  }

  // OMML algıla ve LaTeX'e çevir
  if (content.includes('<m:oMath') || content.includes('m:')) {
    content = convertOMMLToLaTeX(content);
  }

  return content;
}

/**
 * MathML'den LaTeX'e dönüştürücü
 */
export function convertMathMLToLaTeX(mathml) {
  let latex = mathml;

  // Kesir
  latex = latex.replace(/<mfrac>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<\/mfrac>/g, 
    (match, num, den) => `\\frac{${cleanMathMLContent(num)}}{${cleanMathMLContent(den)}}`);

  // Üstel
  latex = latex.replace(/<msup>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<\/msup>/g,
    (match, base, exp) => `${cleanMathMLContent(base)}^{${cleanMathMLContent(exp)}}`);

  // Alt indeks
  latex = latex.replace(/<msub>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<\/msub>/g,
    (match, base, sub) => `${cleanMathMLContent(base)}_{${cleanMathMLContent(sub)}}`);

  // Karekök
  latex = latex.replace(/<msqrt>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<\/msqrt>/g,
    (match, content) => `\\sqrt{${cleanMathMLContent(content)}}`);

  // Kök (dereceli)
  latex = latex.replace(/<mroot>[\s\S]*?<mrow>([\s\S]*?)<\/mrow>[\s\S]*?<mn>([\s\S]*?)<\/mn>[\s\S]*?<\/mroot>/g,
    (match, content, degree) => `\\sqrt[${degree}]{${cleanMathMLContent(content)}}`);

  // Matematiksel operatörler
  latex = latex.replace(/<mo>([\s\S]*?)<\/mo>/g, '$1');
  latex = latex.replace(/<mi>([\s\S]*?)<\/mi>/g, '$1');
  latex = latex.replace(/<mn>([\s\S]*?)<\/mn>/g, '$1');
  latex = latex.replace(/<mtext>([\s\S]*?)<\/mtext>/g, '\\text{$1}');

  // Math tag'lerini temizle
  latex = latex.replace(/<\/?math[^>]*>/g, '');
  latex = latex.replace(/<\/?mrow>/g, '');
  latex = latex.replace(/<\/?mstyle[^>]*>/g, '');

  return latex.trim();
}

/**
 * OMML'den LaTeX'e dönüştürücü
 */
export function convertOMMLToLaTeX(omml) {
  let latex = omml;

  // Kesir
  latex = latex.replace(/<m:f>[\s\S]*?<m:num>([\s\S]*?)<\/m:num>[\s\S]*?<m:den>([\s\S]*?)<\/m:den>[\s\S]*?<\/m:f>/g,
    (match, num, den) => `\\frac{${cleanOMMLContent(num)}}{${cleanOMMLContent(den)}}`);

  // Üstel
  latex = latex.replace(/<m:sSup>[\s\S]*?<m:e>([\s\S]*?)<\/m:e>[\s\S]*?<m:sup>([\s\S]*?)<\/m:sup>[\s\S]*?<\/m:sSup>/g,
    (match, base, exp) => `${cleanOMMLContent(base)}^{${cleanOMMLContent(exp)}}`);

  // Alt indeks
  latex = latex.replace(/<m:sSub>[\s\S]*?<m:e>([\s\S]*?)<\/m:e>[\s\S]*?<m:sub>([\s\S]*?)<\/m:sub>[\s\S]*?<\/m:sSub>/g,
    (match, base, sub) => `${cleanOMMLContent(base)}_{${cleanOMMLContent(sub)}}`);

  // Karekök
  latex = latex.replace(/<m:rad>[\s\S]*?<m:e>([\s\S]*?)<\/m:e>[\s\S]*?<\/m:rad>/g,
    (match, content) => `\\sqrt{${cleanOMMLContent(content)}}`);

  // Dereceli kök
  latex = latex.replace(/<m:rad>[\s\S]*?<m:deg>([\s\S]*?)<\/m:deg>[\s\S]*?<m:e>([\s\S]*?)<\/m:e>[\s\S]*?<\/m:rad>/g,
    (match, degree, content) => `\\sqrt[${cleanOMMLContent(degree)}]{${cleanOMMLContent(content)}}`);

  // OMML tag'lerini temizle
  latex = latex.replace(/<\/?m:[^>]*>/g, '');
  latex = latex.replace(/<\/?[^>]+>/g, '');

  return latex.trim();
}

/**
 * MathML içeriğini temizler
 */
function cleanMathMLContent(content) {
  let clean = content;
  clean = clean.replace(/<mi>([\s\S]*?)<\/mi>/g, '$1');
  clean = clean.replace(/<mn>([\s\S]*?)<\/mn>/g, '$1');
  clean = clean.replace(/<mo>([\s\S]*?)<\/mo>/g, '$1');
  clean = clean.replace(/<mtext>([\s\S]*?)<\/mtext>/g, '$1');
  clean = clean.replace(/<\/?mrow>/g, '');
  return clean.trim();
}

/**
 * OMML içeriğini temizler
 */
function cleanOMMLContent(content) {
  let clean = content;
  clean = clean.replace(/<\/?m:[^>]*>/g, '');
  clean = clean.replace(/<\/?[^>]+>/g, '');
  return clean.trim();
}

/**
 * Unicode matematik sembollerini LaTeX'e çevirir
 */
export function convertUnicodeToLaTeX(text) {
  const unicodeMap = {
    '∑': '\\sum',
    '∫': '\\int',
    '∏': '\\prod',
    '√': '\\sqrt',
    '∞': '\\infty',
    '≤': '\\leq',
    '≥': '\\geq',
    '≠': '\\neq',
    '≈': '\\approx',
    '×': '\\times',
    '÷': '\\div',
    '±': '\\pm',
    '∓': '\\mp',
    'α': '\\alpha',
    'β': '\\beta',
    'γ': '\\gamma',
    'δ': '\\delta',
    'ε': '\\epsilon',
    'ζ': '\\zeta',
    'η': '\\eta',
    'θ': '\\theta',
    'π': '\\pi',
    'Δ': '\\Delta',
    'Σ': '\\Sigma',
    'Π': '\\Pi',
    'Ω': '\\Omega',
  };

  let result = text;
  for (const [unicode, latex] of Object.entries(unicodeMap)) {
    result = result.replace(new RegExp(unicode, 'g'), latex);
  }

  return result;
}
