/**
 * Equation Templates Panel
 * Denklem şablonları paneli
 */

import React, { useState } from "react";
import { X } from "lucide-react";

const EQUATION_TEMPLATES = [
  { name: "Lineer Denklem", latex: "ax + b = 0", category: "Algebra" },
  { name: "Kuadratik", latex: "ax^2 + bx + c = 0", category: "Algebra" },
  { name: "Kuadratik Formül", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", category: "Algebra" },
  { name: "Pythagoras", latex: "a^2 + b^2 = c^2", category: "Geometry" },
  { name: "Çember Alanı", latex: "A = \\pi r^2", category: "Geometry" },
  { name: "Üçgen Alanı", latex: "A = \\frac{1}{2}bh", category: "Geometry" },
  { name: "Üçgen Çevresi", latex: "P = a + b + c", category: "Geometry" },
  { name: "Euler Formülü", latex: "e^{i\\pi} + 1 = 0", category: "Analysis" },
  { name: "Türev Tanımı", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", category: "Calculus" },
  { name: "İntegral", latex: "\\int_a^b f(x)dx", category: "Calculus" },
  { name: "Taylor Serisi", latex: "f(x) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(a)}{n!}(x-a)^n", category: "Analysis" },
  { name: "Binomial Açılım", latex: "(a+b)^n = \\sum_{k=0}^n \\binom{n}{k}a^{n-k}b^k", category: "Algebra" },
  { name: "Kosinüs Teoremi", latex: "c^2 = a^2 + b^2 - 2ab\\cos C", category: "Trigonometry" },
  { name: "Sinüs Teoremi", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}", category: "Trigonometry" },
  { name: "Ürün-İçerik", latex: "\\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B", category: "Trigonometry" },
  { name: "Momentum", latex: "p = mv", category: "Physics" },
  { name: "Kinetik Enerji", latex: "E_k = \\frac{1}{2}mv^2", category: "Physics" },
  { name: "Einstein Denklemi", latex: "E = mc^2", category: "Physics" },
];

export default function EquationTemplatesPanel({ onInsert = () => {}, onClose = () => {} }) {
  const [selectedCategory, setSelectedCategory] = useState("Algebra");

  const categories = [...new Set(EQUATION_TEMPLATES.map((e) => e.category))];
  const filteredEquations = EQUATION_TEMPLATES.filter((e) => e.category === selectedCategory);

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "350px",
        backgroundColor: "white",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
        zIndex: 999,
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
          padding: "12px",
          borderBottom: "1px solid #eee",
          backgroundColor: "#f9fafb",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
          📋 Denklem Şablonları
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "8px",
          borderBottom: "1px solid #eee",
          overflow: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              backgroundColor: selectedCategory === cat ? "#10b981" : "#e5e7eb",
              color: selectedCategory === cat ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equations List */}
      <div
        style={{
          flex: 1,
          padding: "8px",
          overflow: "auto",
        }}
      >
        {filteredEquations.map((eq) => (
          <button
            key={eq.latex}
            onClick={() => {
              onInsert(eq.latex);
              onClose();
            }}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "6px",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#eff6ff";
              e.currentTarget.style.borderColor = "#10b981";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "3px" }}>
              {eq.name}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#666",
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {eq.latex}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
