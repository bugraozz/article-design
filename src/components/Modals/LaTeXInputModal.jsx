/**
 * LaTeX Input Modal
 * Basit LaTeX giriş modalı
 */

import React, { useState } from "react";
import { X } from "lucide-react";

export default function LaTeXInputModal({
  isOpen = false,
  onClose = () => {},
  onInsert = () => {},
}) {
  const [latex, setLatex] = useState("\\frac{a}{b}");

  if (!isOpen) return null;

  const handleInsert = () => {
    onInsert(latex);
    setLatex("\\frac{a}{b}"); // Reset
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
            LaTeX Ekle
          </h2>
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

        <textarea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            fontFamily: "monospace",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            marginBottom: "16px",
            boxSizing: "border-box",
          }}
          placeholder="LaTeX yazınız..."
        />

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#e5e7eb",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            İptal
          </button>
          <button
            onClick={handleInsert}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
