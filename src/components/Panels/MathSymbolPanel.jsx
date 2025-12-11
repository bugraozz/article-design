/**
 * Math Symbol Panel
 * Matematik semboller paneli - KaTeX Önizlemeli
 */

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import katex from "katex";

const MATH_SYMBOLS = [
  { name: "Plus", latex: "+", category: "Basic" },
  { name: "Minus", latex: "-", category: "Basic" },
  { name: "Multiply", latex: "\\times", category: "Basic" },
  { name: "Divide", latex: "\\div", category: "Basic" },
  { name: "Equal", latex: "=", category: "Basic" },
  { name: "Not Equal", latex: "\\neq", category: "Basic" },
  { name: "Less Than", latex: "<", category: "Comparison" },
  { name: "Greater Than", latex: ">", category: "Comparison" },
  { name: "Less or Equal", latex: "\\leq", category: "Comparison" },
  { name: "Greater or Equal", latex: "\\geq", category: "Comparison" },
  { name: "Approximately", latex: "\\approx", category: "Comparison" },
  { name: "Plus Minus", latex: "\\pm", category: "Basic" },
  { name: "Pi", latex: "\\pi", category: "Constants" },
  { name: "Euler", latex: "e", category: "Constants" },
  { name: "Infinity", latex: "\\infty", category: "Constants" },
  { name: "Alpha", latex: "\\alpha", category: "Greek Letters" },
  { name: "Beta", latex: "\\beta", category: "Greek Letters" },
  { name: "Gamma", latex: "\\gamma", category: "Greek Letters" },
  { name: "Delta", latex: "\\delta", category: "Greek Letters" },
  { name: "Epsilon", latex: "\\epsilon", category: "Greek Letters" },
  { name: "Theta", latex: "\\theta", category: "Greek Letters" },
  { name: "Lambda", latex: "\\lambda", category: "Greek Letters" },
  { name: "Mu", latex: "\\mu", category: "Greek Letters" },
  { name: "Sigma", latex: "\\sigma", category: "Greek Letters" },
  { name: "Omega", latex: "\\omega", category: "Greek Letters" },
  { name: "Square Root", latex: "\\sqrt{x}", category: "Functions" },
  { name: "Fraction", latex: "\\frac{a}{b}", category: "Functions" },
  { name: "Power", latex: "x^{n}", category: "Functions" },
  { name: "Subscript", latex: "x_{n}", category: "Functions" },
  { name: "Integral", latex: "\\int", category: "Operators" },
  { name: "Sum", latex: "\\sum", category: "Operators" },
  { name: "Product", latex: "\\prod", category: "Operators" },
  { name: "Limit", latex: "\\lim", category: "Operators" },
  { name: "Partial", latex: "\\partial", category: "Operators" },
];

// Symbol Preview Component
function SymbolPreview({ latex }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(latex, ref.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (error) {
        ref.current.textContent = latex;
      }
    }
  }, [latex]);

  return <span ref={ref} />;
}

export default function MathSymbolPanel({ onInsert = () => {}, onClose = () => {} }) {
  const [selectedCategory, setSelectedCategory] = useState("Basic");

  const categories = [...new Set(MATH_SYMBOLS.map((s) => s.category))];
  const filteredSymbols = MATH_SYMBOLS.filter((s) => s.category === selectedCategory);

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "380px",
        background: "white",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
        zIndex: 999,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      >
        <h3 style={{ 
          margin: 0, 
          fontSize: "16px", 
          fontWeight: "600",
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>📐</span>
          <span>Matematik Sembolleri</span>
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
            borderRadius: "4px",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#e5e7eb"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
        >
          <X size={20} color="#6b7280" />
        </button>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          padding: "10px 12px",
          borderBottom: "1px solid #e5e7eb",
          overflow: "auto",
          background: "white",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "500",
              background: selectedCategory === cat 
                ? "#3b82f6" 
                : "#f3f4f6",
              color: selectedCategory === cat ? "white" : "#4b5563",
              border: selectedCategory === cat ? "none" : "1px solid #e5e7eb",
              borderRadius: "6px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Symbols Grid */}
      <div
        style={{
          flex: 1,
          padding: "12px",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          overflow: "auto",
          alignContent: "start",
          background: "#fafafa",
        }}
      >
        {filteredSymbols.map((symbol) => (
          <button
            key={symbol.latex}
            onClick={() => {
              onInsert(symbol.latex);
              onClose();
            }}
            title={symbol.name}
            style={{
              padding: "16px 12px",
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s",
              minHeight: "100px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#eff6ff";
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* KaTeX Rendered Symbol */}
            <div style={{ 
              fontSize: "32px", 
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "40px",
              color: "#1f2937",
            }}>
              <SymbolPreview latex={symbol.latex} />
            </div>
            
            {/* Symbol Name */}
            <div style={{ 
              fontWeight: "500", 
              fontSize: "11px", 
              color: "#6b7280",
              textAlign: "center",
            }}>
              {symbol.name}
            </div>
            
            {/* LaTeX Code */}
            <code style={{ 
              fontSize: "9px", 
              color: "#9ca3af",
              backgroundColor: "#f3f4f6",
              padding: "2px 6px",
              borderRadius: "3px",
              fontFamily: "monospace",
            }}>
              {symbol.latex}
            </code>
          </button>
        ))}
      </div>
    </div>
  );
}
