/**
 * Math Editor Panel Component
 * Sağ tarafta açılabilir math render/edit paneli
 */

import React, { useState, useEffect } from "react";
import { LatexRenderer, EditableMathRenderer } from "./SimpleMathRenderer";
import { initMathJax } from "../utils/simpleMathRenderer";
import { X } from "lucide-react";

export default function MathEditorPanel({
  isOpen = false,
  onClose = () => {},
  onInsertMath = () => {},
}) {
  const [latexValue, setLatexValue] = useState("\\frac{a}{b}");
  const [editableValue, setEditableValue] = useState("x^2 + y^2 = z^2");

  useEffect(() => {
    initMathJax();
  }, []);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "400px",
        backgroundColor: "white",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          borderBottom: "1px solid #eee",
          backgroundColor: "#f9fafb",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
          🧮 Matematik Editörü
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>
        {/* 1. Basit LaTeX Render */}
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
            1️⃣ LaTeX Yazı & Render
          </h4>
          <textarea
            value={latexValue}
            onChange={(e) => setLatexValue(e.target.value)}
            style={{
              width: "100%",
              minHeight: "60px",
              padding: "8px",
              fontFamily: "monospace",
              fontSize: "12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "12px",
            }}
            placeholder="LaTeX yazınız..."
          />

          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            <LatexRenderer latex={latexValue} />
          </div>

          <button
            onClick={() => onInsertMath(latexValue)}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ Sayfaya Ekle
          </button>
        </div>

        {/* 2. Editable Renderer */}
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
            2️⃣ Düzenlenebilir Matematiksel Gösterim
          </h4>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
            Gösterime tıklayarak düzenleyin:
          </p>

          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              minHeight: "100px",
            }}
          >
            <EditableMathRenderer
              content={editableValue}
              displayMode={true}
              onUpdate={(newLatex) => {
                setEditableValue(newLatex);
              }}
            />
          </div>

          <p style={{ fontSize: "11px", color: "#999", margin: "8px 0" }}>
            💡 Ctrl+Enter: kaydet, Esc: iptal
          </p>

          <button
            onClick={() => onInsertMath(editableValue)}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ Sayfaya Ekle
          </button>
        </div>

        {/* Hızlı Örnekler */}
        <div>
          <h4 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}>
            📚 Hızlı Örnekler
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {[
              { name: "Kesir", latex: "\\frac{a}{b}" },
              { name: "Üs", latex: "x^2" },
              { name: "√", latex: "\\sqrt{x}" },
              { name: "∑", latex: "\\sum_{i=1}^{n}" },
              { name: "∫", latex: "\\int_0^\\pi \\sin(x)dx" },
              { name: "Alt indeks", latex: "x_n" },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setLatexValue(item.latex)}
                style={{
                  padding: "6px",
                  backgroundColor: "#f0f0f0",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e0e0e0";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f0f0f0";
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
