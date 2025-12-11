/**
 * Professional Math Renderer
 * KaTeX ve MathJax entegre edilerek profesyonel matematiksel görünüm
 * Karakter-karakter düzenlenebilir yapı
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { MathMLBuilder, LaTeXConverter, OMMlConverter, MathParser, MathSanitizer } from "../utils/mathSystem";

export const ProfessionalMathRenderer = React.forwardRef(({
  content = "",
  type = "latex", // latex, mathml, omml
  mode = "display", // display, inline
  editable = false,
  onEdit = null,
  className = "",
  style = {},
}, ref) => {
  const [latex, setLatex] = useState("");
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const containerRef = useRef(null);
  const editInputRef = useRef(null);

  // İçeriği LaTeX'e çevir
  useEffect(() => {
    try {
      let latexContent = content;

      if (type === "mathml") {
        latexContent = OMMlConverter.mathmlToLatex(content);
      } else if (type === "omml") {
        latexContent = OMMlConverter.toLatex(content);
      }

      setLatex(latexContent);
      setError(null);
    } catch (err) {
      console.error("Math conversion error:", err);
      setError("Matematik gösterimi başarısız");
      setLatex(content);
    }
  }, [content, type]);

  // KaTeX ile render et
  const renderMath = useCallback(() => {
    if (!containerRef.current || !latex) return;

    try {
      containerRef.current.innerHTML = "";
      katex.render(latex, containerRef.current, {
        displayMode: mode === "display",
        throwOnError: false,
        macros: {
          "\\f": "#1f(#2)",
        },
      });
      setError(null);
    } catch (err) {
      console.warn("KaTeX render error:", err);
      setError("Gösterim başarısız");
      containerRef.current.innerHTML = `<code>${latex}</code>`;
    }
  }, [latex, mode]);

  useEffect(() => {
    renderMath();
  }, [renderMath]);

  // Edit modunu başlat
  const handleEdit = () => {
    if (!editable) return;
    setIsEditing(true);
    setEditValue(latex);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  // Edit modundan çık ve kaydet
  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== latex) {
      onEdit?.(editValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  if (error && !isEditing) {
    return (
      <div 
        className={`math-error ${className}`}
        style={{ color: "#dc2626", fontSize: "0.875rem", ...style }}
        title={error}
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      className={`professional-math-renderer ${editable ? "cursor-pointer hover:bg-blue-50" : ""} ${className}`}
      style={{
        display: "inline-block",
        padding: editable ? "4px 8px" : "0",
        borderRadius: "4px",
        transition: "all 0.2s ease",
        ...style,
      }}
      onClick={handleEdit}
    >
      {isEditing ? (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <textarea
            ref={editInputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              padding: "6px",
              border: "2px solid #3b82f6",
              borderRadius: "4px",
              minWidth: "200px",
              minHeight: "50px",
            }}
            placeholder="LaTeX girin..."
          />
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={handleSave}
              title="Kaydet (Ctrl+Enter)"
              style={{
                padding: "4px 8px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ✓
            </button>
            <button
              onClick={() => setIsEditing(false)}
              title="İptal (Esc)"
              style={{
                padding: "4px 8px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="math-content"
          style={{
            display: mode === "display" ? "block" : "inline",
            padding: mode === "display" ? "12px 0" : "2px",
          }}
        />
      )}
    </div>
  );
});

ProfessionalMathRenderer.displayName = "ProfessionalMathRenderer";

// ==================== CHARACTER-BY-CHARACTER EDITOR ====================
export const CharacterMathEditor = React.forwardRef(({
  mathElement = null,
  onUpdate = null,
  className = "",
}, ref) => {
  const [element, setElement] = useState(mathElement);
  const [selectedPart, setSelectedPart] = useState(null);

  useEffect(() => {
    setElement(mathElement);
  }, [mathElement]);

  const updatePart = (field, value) => {
    const updated = { ...element, attributes: { ...element.attributes } };
    updated.attributes[field] = value;
    setElement(updated);
    onUpdate?.(updated);
  };

  const renderEditor = () => {
    if (!element) return <div>Eleman seç</div>;

    switch (element.type) {
      case "fraction":
        return (
          <div className="math-editor-fraction">
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Pay (Numerator):
              </label>
              <input
                type="text"
                value={element.attributes.numerator || ""}
                onChange={(e) => updatePart("numerator", e.target.value)}
                placeholder="a"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Payda (Denominator):
              </label>
              <input
                type="text"
                value={element.attributes.denominator || ""}
                onChange={(e) => updatePart("denominator", e.target.value)}
                placeholder="b"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
          </div>
        );

      case "power":
        return (
          <div className="math-editor-power">
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Taban (Base):
              </label>
              <input
                type="text"
                value={element.attributes.base || ""}
                onChange={(e) => updatePart("base", e.target.value)}
                placeholder="x"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Üs (Exponent):
              </label>
              <input
                type="text"
                value={element.attributes.exponent || ""}
                onChange={(e) => updatePart("exponent", e.target.value)}
                placeholder="2"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
          </div>
        );

      case "subscript":
        return (
          <div className="math-editor-subscript">
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Taban (Base):
              </label>
              <input
                type="text"
                value={element.attributes.base || ""}
                onChange={(e) => updatePart("base", e.target.value)}
                placeholder="x"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Alt İndeks (Subscript):
              </label>
              <input
                type="text"
                value={element.attributes.subscript || ""}
                onChange={(e) => updatePart("subscript", e.target.value)}
                placeholder="n"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
          </div>
        );

      case "root":
        return (
          <div className="math-editor-root">
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Derecesi (Degree):
              </label>
              <input
                type="number"
                value={element.attributes.degree || "2"}
                onChange={(e) => updatePart("degree", e.target.value)}
                min="2"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                Radicand:
              </label>
              <input
                type="text"
                value={element.attributes.base || ""}
                onChange={(e) => updatePart("base", e.target.value)}
                placeholder="x"
                style={{
                  width: "100%",
                  padding: "6px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <input
              type="text"
              value={element.attributes.value || ""}
              onChange={(e) => updatePart("value", e.target.value)}
              placeholder="Değer"
              style={{
                width: "100%",
                padding: "6px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className={`character-math-editor ${className}`} style={{ padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
      {renderEditor()}
    </div>
  );
});

CharacterMathEditor.displayName = "CharacterMathEditor";

export default ProfessionalMathRenderer;
