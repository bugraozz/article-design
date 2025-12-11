/**
 * Simple Math Renderer
 * - Doğrudan LaTeX Render Etme
 * - Profesyonel Düzenlenebilir Gösterim
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { renderLatexWithKaTeX, initMathJax } from "../utils/simpleMathRenderer";
import "katex/dist/katex.min.css";

/**
 * 1. Doğrudan LaTeX Render Bileşeni
 * LaTeX yazılınca otomatik render eder
 */
export const LatexRenderer = React.forwardRef(({
  latex = "",
  displayMode = true,
  className = "",
  style = {},
}, ref) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const render = async () => {
      if (!latex || !containerRef.current) return;
      
      try {
        containerRef.current.innerHTML = "";
        await renderLatexWithKaTeX(latex, containerRef.current);
        setError(null);
      } catch (err) {
        setError("Render hatası");
        containerRef.current.innerHTML = `<code>${latex}</code>`;
      }
    };

    render();
  }, [latex]);

  if (error) {
    return (
      <div style={{
        color: "#dc2626",
        fontSize: "0.875rem",
        padding: "4px 8px",
        backgroundColor: "#fee2e2",
        borderRadius: "4px",
        ...style
      }}>
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`math-display ${className}`}
      style={{
        display: displayMode ? "block" : "inline",
        padding: displayMode ? "12px 0" : "2px",
        ...style
      }}
    />
  );
});

LatexRenderer.displayName = "LatexRenderer";

/**
 * 2. Profesyonel Düzenlenebilir Renderer
 * Tıklayınca edit modu açılır
 */
export const EditableMathRenderer = React.forwardRef(({
  content = "",
  type = "latex", // latex, mathml, omml
  displayMode = true,
  onUpdate = null,
  className = "",
  style = {},
}, ref) => {
  const [latex, setLatex] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(latex);
  const containerRef = useRef(null);
  const editInputRef = useRef(null);

  // Type'ı LaTeX'e çevir (sadece LaTeX kullan)
  useEffect(() => {
    setLatex(content);
  }, [content]);

  // Edit modundan çık ve kaydet
  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== latex) {
      setLatex(editValue);
      onUpdate?.(editValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => isEditing ? null : setIsEditing(true)}
      style={{
        display: "inline-block",
        cursor: isEditing ? "default" : "pointer",
        padding: "4px 8px",
        borderRadius: "4px",
        transition: "all 0.2s ease",
        backgroundColor: isEditing ? "#eff6ff" : "transparent",
        border: isEditing ? "2px solid #3b82f6" : "1px dashed rgba(59, 130, 246, 0.3)",
        ...style
      }}
      className={className}
    >
      {isEditing ? (
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <textarea
            ref={editInputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              padding: "6px",
              border: "1px solid #3b82f6",
              borderRadius: "4px",
              minWidth: "200px",
              minHeight: "50px",
              fontWeight: "500",
            }}
            placeholder="LaTeX girin..."
          />
          <div style={{ display: "flex", gap: "4px", flexDirection: "column" }}>
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
                fontWeight: "bold",
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
                fontWeight: "bold",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <LatexRenderer
          latex={latex}
          displayMode={displayMode}
          style={{
            display: displayMode ? "block" : "inline-block",
            padding: "8px",
            backgroundColor: "#f9fafb",
            borderRadius: "4px",
          }}
        />
      )}
    </div>
  );
});

EditableMathRenderer.displayName = "EditableMathRenderer";

export default EditableMathRenderer;
