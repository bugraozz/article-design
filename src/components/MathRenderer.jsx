import { useEffect, useRef } from 'react';
import katex from 'katex';

/**
 * Math Renderer Component
 * LaTeX, MathML, OMML, Unicode gibi tüm matematik formatlarını render eder
 */
export default function MathRenderer({ latex, display = false, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !latex) return;

    try {
      // KaTeX ile render et
      katex.render(latex, containerRef.current, {
        throwOnError: false,
        displayMode: display,
        output: 'html', // veya 'mathml' - tüm formatları destekler
        trust: true,
        strict: false,
        macros: {
          "\\RR": "\\mathbb{R}",
          "\\NN": "\\mathbb{N}",
          "\\ZZ": "\\mathbb{Z}",
          "\\QQ": "\\mathbb{Q}",
          "\\CC": "\\mathbb{C}",
        },
      });
    } catch (error) {
      console.warn('Math rendering error:', error);
      // Hata durumunda LaTeX'i göster
      if (containerRef.current) {
        containerRef.current.textContent = display ? `$$${latex}$$` : `$${latex}$`;
      }
    }
  }, [latex, display]);

  return (
    <span
      ref={containerRef}
      className={`math-renderer ${display ? 'math-display' : 'math-inline'} ${className}`}
      data-latex={latex}
    />
  );
}

/**
 * HTML içindeki matematik içeriğini parse edip render eder
 */
export function renderMathInHTML(htmlString) {
  if (!htmlString) return htmlString;

  // Inline math: $...$
  let rendered = htmlString.replace(/\$([^$]+)\$/g, (match, latex) => {
    return `<span class="math-inline" data-latex="${latex}">${match}</span>`;
  });

  // Display math: $$...$$
  rendered = rendered.replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
    return `<div class="math-block" data-latex="${latex}">${match}</div>`;
  });

  // LaTeX commands: \(...\) ve \[...\]
  rendered = rendered.replace(/\\\(([^)]+)\\\)/g, (match, latex) => {
    return `<span class="math-inline" data-latex="${latex}">${match}</span>`;
  });

  rendered = rendered.replace(/\\\[([^\]]+)\\\]/g, (match, latex) => {
    return `<div class="math-block" data-latex="${latex}">${match}</div>`;
  });

  return rendered;
}

/**
 * Yapıştırılan içeriği temizleyip matematik formatlarını korur
 */
export function parsePastedMath(text) {
  // MathML detect
  if (text.includes('<math') || text.includes('</math>')) {
    // MathML'i LaTeX'e çevir (basit dönüşüm)
    return convertMathMLToLaTeX(text);
  }

  // OMML (Office Math Markup Language) detect
  if (text.includes('<m:oMath') || text.includes('m:oMath')) {
    return convertOMMLToLaTeX(text);
  }

  // Unicode math symbols - zaten destekleniyor
  return text;
}

/**
 * MathML'den LaTeX'e basit dönüştürücü
 */
function convertMathMLToLaTeX(mathml) {
  let latex = mathml;

  // Basit dönüşümler
  latex = latex.replace(/<mfrac><mrow>([^<]*)<\/mrow><mrow>([^<]*)<\/mrow><\/mfrac>/g, '\\frac{$1}{$2}');
  latex = latex.replace(/<msup><mrow>([^<]*)<\/mrow><mrow>([^<]*)<\/mrow><\/msup>/g, '$1^{$2}');
  latex = latex.replace(/<msub><mrow>([^<]*)<\/mrow><mrow>([^<]*)<\/mrow><\/msub>/g, '$1_{$2}');
  latex = latex.replace(/<msqrt><mrow>([^<]*)<\/mrow><\/msqrt>/g, '\\sqrt{$1}');
  latex = latex.replace(/<mi>([^<]*)<\/mi>/g, '$1');
  latex = latex.replace(/<mn>([^<]*)<\/mn>/g, '$1');
  latex = latex.replace(/<mo>([^<]*)<\/mo>/g, '$1');

  // Math tag'lerini temizle
  latex = latex.replace(/<\/?math[^>]*>/g, '');
  latex = latex.replace(/<\/?mrow>/g, '');

  return latex.trim();
}

/**
 * OMML'den LaTeX'e basit dönüştürücü
 */
function convertOMMLToLaTeX(omml) {
  let latex = omml;

  // OMML tag'lerini temizle ve LaTeX'e çevir
  latex = latex.replace(/<m:f><m:num>([^<]*)<\/m:num><m:den>([^<]*)<\/m:den><\/m:f>/g, '\\frac{$1}{$2}');
  latex = latex.replace(/<m:sSup><m:e>([^<]*)<\/m:e><m:sup>([^<]*)<\/m:sup><\/m:sSup>/g, '$1^{$2}');
  latex = latex.replace(/<m:sSub><m:e>([^<]*)<\/m:e><m:sub>([^<]*)<\/m:sub><\/m:sSub>/g, '$1_{$2}');
  latex = latex.replace(/<m:rad><m:deg>([^<]*)<\/m:deg><m:e>([^<]*)<\/m:e><\/m:rad>/g, '\\sqrt[$1]{$2}');
  latex = latex.replace(/<m:rad><m:e>([^<]*)<\/m:e><\/m:rad>/g, '\\sqrt{$1}');

  // OMML tag'lerini temizle
  latex = latex.replace(/<\/?m:[^>]*>/g, '');
  latex = latex.replace(/<\/?[^>]+>/g, '');

  return latex.trim();
}
