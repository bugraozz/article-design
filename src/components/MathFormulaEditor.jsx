import { useEffect, useRef } from "react";

/**
 * Matematik Formül Editörü
 * Word/Docs'tan MathML, OMML, Unicode formüllerini yapıştırabilir
 * MathML, OMML, plain text desteği var
 */
export default function MathFormulaEditor({ 
  value = "", 
  onChange = () => {}, 
  onSave = () => {},
  placeholder = "Formülü yapıştırın veya yazın...",
  className = "",
  style = {},
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  /**
   * OMML'i MathML'e çevirme (basit dönüşüm)
   * Word <m:oMath> → <math>
   */
  const convertOmmlToMathML = (ommlXml) => {
    let mathml = ommlXml;
    
    // <m:oMath> → <math>
    mathml = mathml.replace(/<m:oMath>/g, "<math>");
    mathml = mathml.replace(/<\/m:oMath>/g, "</math>");
    
    // <m:e> → <mrow> (element container)
    mathml = mathml.replace(/<m:e>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:e>/g, "</mrow>");
    
    // <m:r> → <mrow> (run)
    mathml = mathml.replace(/<m:r>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:r>/g, "</mrow>");
    
    // <m:t> → <mi> (text)
    mathml = mathml.replace(/<m:t>([^<]+)<\/m:t>/g, "<mi>$1</mi>");
    
    // <m:sup> → <msup>
    mathml = mathml.replace(/<m:sup>/g, "<msup>");
    mathml = mathml.replace(/<\/m:sup>/g, "</msup>");
    
    // <m:sub> → <msub>
    mathml = mathml.replace(/<m:sub>/g, "<msub>");
    mathml = mathml.replace(/<\/m:sub>/g, "</msub>");
    
    // <m:f> → <mfrac> (fraction)
    mathml = mathml.replace(/<m:f>/g, "<mfrac>");
    mathml = mathml.replace(/<\/m:f>/g, "</mfrac>");
    
    // <m:num> → <mrow> (numerator)
    mathml = mathml.replace(/<m:num>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:num>/g, "</mrow>");
    
    // <m:den> → <mrow> (denominator)
    mathml = mathml.replace(/<m:den>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:den>/g, "</mrow>");
    
    // <m:rad> → <mroot> (radical/root)
    mathml = mathml.replace(/<m:rad>/g, "<mroot>");
    mathml = mathml.replace(/<\/m:rad>/g, "</mroot>");
    
    // <m:radicand> → <mrow>
    mathml = mathml.replace(/<m:radicand>/g, "<mrow>");
    mathml = mathml.replace(/<\/m:radicand>/g, "</mrow>");
    
    // Namespace'leri kaldır
    mathml = mathml.replace(/xmlns:[^=]+"[^"]*"/g, "");
    mathml = mathml.replace(/xmlns="[^"]*"/g, "");
    
    return mathml;
  };

  /**
   * HTML sanitize et - MathML'i koru, XSS'i engelle
   */
  const sanitizeHtml = (html) => {
    const allowedTags = [
      "math", "mrow", "mi", "mo", "mn", "ms", "mtext",
      "msup", "msub", "msubsup", "mfrac", "mroot", "msqrt",
      "mstyle", "mpadded", "merror", "mphantom",
      "mfenced", "mtable", "mtr", "mtd",
      "b", "i", "u", "strong", "em", "span", "p", "br"
    ];

    const allowedAttributes = {
      math: ["display"],
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

    // Recursive sanitize
    const sanitizeNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return true;

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        if (!allowedTags.includes(tagName)) {
          // İzin verilmeyen tag - içeriği koru ama tag'i kaldır
          while (node.firstChild) {
            node.parentNode.insertBefore(node.firstChild, node);
          }
          node.parentNode.removeChild(node);
          return false;
        }

        // İzin verilmeyen attribute'leri kaldır
        const attrs = [...node.attributes];
        attrs.forEach((attr) => {
          if (!allowedAttributes[tagName]?.includes(attr.name)) {
            node.removeAttribute(attr.name);
          }
        });

        // Çocukları sanitize et
        const children = [...node.childNodes];
        children.forEach(sanitizeNode);
      }
    };

    sanitizeNode(div);
    return div.innerHTML;
  };

  /**
   * Paste event handler - MathML, OMML, Unicode desteği
   */
  const handlePaste = async (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;

    if (!clipboardData) {
      document.execCommand("paste");
      return;
    }

    let content = null;
    let source = "unknown";

    // 1. HTML'i kontrol et (MathML, OMML olabilir)
    if (clipboardData.types.includes("text/html")) {
      const html = clipboardData.getData("text/html");
      
      // MathML'i kontrol et
      if (html.includes("<math") || html.includes("xmlns")) {
        content = html;
        source = "html_mathml";
      }
      // OMML'i kontrol et (Word format)
      else if (html.includes("<m:oMath") || html.includes("m:oMath")) {
        // OMML'in içinde MathML fallback var mı?
        const mathmlMatch = html.match(/<math[^>]*>[\s\S]*?<\/math>/);
        if (mathmlMatch) {
          content = mathmlMatch[0];
          source = "omml_with_mathml_fallback";
        } else {
          // OMML'i MathML'e çevir
          const mathml = convertOmmlToMathML(html);
          content = mathml;
          source = "omml_converted";
        }
      }
      // Başka HTML var mı?
      else {
        content = html;
        source = "html_other";
      }
    }

    // 2. HTML yoksa, text/plain kontrol et
    if (!content && clipboardData.types.includes("text/plain")) {
      const text = clipboardData.getData("text/plain");
      // Unicode karakterleri içeriyor mu?
      if (/[∑∫√π∞±≤≥≠]/u.test(text) || /[⁰-⁹₀-₉]/u.test(text)) {
        content = `<p>${escapeHtml(text)}</p>`;
        source = "unicode_text";
      } else {
        content = `<p>${escapeHtml(text)}</p>`;
        source = "plain_text";
      }
    }

    if (content) {
      // HTML sanitize et
      const sanitized = sanitizeHtml(content);
      
      // Cursor'a insert et
      if (document.activeElement === editorRef.current) {
        const range = window.getSelection().getRangeAt(0);
        const fragment = document.createElement("div");
        fragment.innerHTML = sanitized;
        
        while (fragment.firstChild) {
          range.insertNode(fragment.firstChild);
        }
        
        // Cursor'u sona taşı
        const endRange = document.createRange();
        endRange.selectNodeContents(editorRef.current);
        endRange.collapse(false);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(endRange);
      }

      onChange?.(editorRef.current.innerHTML);
      console.log(`[MathFormulaEditor] Paste source: ${source}`);
    }
  };

  /**
   * HTML escape et (plain text için)
   */
  const escapeHtml = (text) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  /**
   * Input event - içerik değiştiğinde
   */
  const handleInput = () => {
    onChange?.(editorRef.current.innerHTML);
  };

  /**
   * Keyboard event - Enter, Tab vb.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      onSave?.(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      className={`math-formula-editor ${className}`}
      style={{
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "12px",
        minHeight: "60px",
        maxHeight: "300px",
        overflow: "auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
        fontSize: "16px",
        lineHeight: "1.8",
        outline: "none",
        ...style,
      }}
      onPaste={handlePaste}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      aria-label="Matematik Formülü Editörü"
    >
      {!value && (
        <span style={{ color: "#999", pointerEvents: "none" }}>
          {placeholder}
        </span>
      )}
    </div>
  );
}

/**
 * CSS stili için
 */
const mathEditorStyles = `
.math-formula-editor {
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.math-formula-editor:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.math-formula-editor math {
  display: inline;
  margin: 0 2px;
}

.math-formula-editor mi,
.math-formula-editor mo,
.math-formula-editor mn {
  font-style: italic;
}

.math-formula-editor mo {
  font-style: normal;
  margin: 0 2px;
}
`;

export { mathEditorStyles };
