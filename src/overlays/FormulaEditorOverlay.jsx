/**
 * Formula Editor Overlay
 * MathML/LaTeX formülü yapılandırılmış şekilde düzenlemek için
 */

import { useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { latexToMathML } from "../utils/latexToMathML";
import "../styles/FormulaEditorOverlay.css";

const FORMULA_TYPES = {
  ROOT: "root",
  FRACTION: "fraction",
  POWER: "power",
  SUBSCRIPT: "subscript",
  LIMIT: "limit",
  SUM: "sum",
  INTEGRAL: "integral",
  PRODUCT: "product",
  SIMPLE: "simple",
};

export default function FormulaEditorOverlay({
  isOpen,
  html,
  onClose,
  onSave,
}) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // HTML'den LaTeX çıkar ve parse et
  useEffect(() => {
    if (isOpen && html) {
      // MathML/LaTeX'i parse et
      parseFormula(html);
    }
  }, [isOpen, html]);

  const parseFormula = (htmlString) => {
    // Basit parse - LaTeX pattern'lerini bul
    try {
      // MathML'den LaTeX çıkar (\\frac{a}{b} vb)
      const latexMatches = htmlString.match(/\\\w+(\[[^\]]*\])?(\{[^}]*\})+/g) || [];
      
      if (latexMatches.length > 0) {
        const parsed = latexMatches.map((match, idx) => {
          return parseLatexElement(match, idx);
        });
        setElements(parsed);
        if (parsed.length > 0) setSelectedId(parsed[0].id);
      } else {
        // Düz metin
        setElements([
          {
            id: Date.now(),
            type: FORMULA_TYPES.SIMPLE,
            value: htmlString.replace(/<[^>]*>/g, "").trim(),
          },
        ]);
      }
    } catch (e) {
      console.error("Parse error:", e);
      setElements([
        {
          id: Date.now(),
          type: FORMULA_TYPES.SIMPLE,
          value: htmlString,
        },
      ]);
    }
  };

  const parseLatexElement = (latex, idx) => {
    const id = Date.now() + idx;

    // \frac{a}{b}
    if (latex.includes("\\frac")) {
      const matches = latex.match(/\{([^}]*)\}/g);
      return {
        id,
        type: FORMULA_TYPES.FRACTION,
        numerator: matches?.[0]?.slice(1, -1) || "a",
        denominator: matches?.[1]?.slice(1, -1) || "b",
      };
    }

    // \sqrt[3]{x}
    if (latex.includes("\\sqrt")) {
      const degreeMatch = latex.match(/\[(\d+)\]/);
      const valueMatch = latex.match(/\{([^}]*)\}/);
      return {
        id,
        type: FORMULA_TYPES.ROOT,
        degree: degreeMatch?.[1] || "2",
        base: valueMatch?.[1] || "x",
      };
    }

    // x^{2}
    if (latex.includes("^")) {
      const parts = latex.split("^");
      return {
        id,
        type: FORMULA_TYPES.POWER,
        base: parts[0] || "x",
        exponent: parts[1]?.slice(1, -1) || "2",
      };
    }

    // x_{n}
    if (latex.includes("_")) {
      const parts = latex.split("_");
      return {
        id,
        type: FORMULA_TYPES.SUBSCRIPT,
        base: parts[0] || "x",
        subscript: parts[1]?.slice(1, -1) || "n",
      };
    }

    // \sum_{i=1}^{n}
    if (latex.includes("\\sum")) {
      const startMatch = latex.match(/_{([^}]*)}/);
      const endMatch = latex.match(/\^{([^}]*)}/);
      return {
        id,
        type: FORMULA_TYPES.SUM,
        start: startMatch?.[1] || "i=1",
        end: endMatch?.[1] || "n",
        expression: "a_i",
      };
    }

    // \int_{a}^{b}
    if (latex.includes("\\int")) {
      const startMatch = latex.match(/_{([^}]*)}/);
      const endMatch = latex.match(/\^{([^}]*)}/);
      return {
        id,
        type: FORMULA_TYPES.INTEGRAL,
        start: startMatch?.[1] || "a",
        end: endMatch?.[1] || "b",
        expression: "f(x)dx",
      };
    }

    // Düz değişken
    return {
      id,
      type: FORMULA_TYPES.SIMPLE,
      value: latex,
    };
  };

  const updateElement = (id, field, value) => {
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, [field]: value } : el
      )
    );
  };

  const removeElement = (id) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    if (selectedId === id && newElements.length > 0) {
      setSelectedId(newElements[0].id);
    }
  };

  const moveElement = (id, direction) => {
    const idx = elements.findIndex((el) => el.id === id);
    if (
      (direction === "up" && idx > 0) ||
      (direction === "down" && idx < elements.length - 1)
    ) {
      const newElements = [...elements];
      const moveIdx = direction === "up" ? idx - 1 : idx + 1;
      [newElements[idx], newElements[moveIdx]] = [
        newElements[moveIdx],
        newElements[idx],
      ];
      setElements(newElements);
    }
  };

  const generateLatex = () => {
    return elements
      .map((el) => {
        switch (el.type) {
          case FORMULA_TYPES.ROOT:
            return `\\sqrt[${el.degree}]{${el.base}}`;
          case FORMULA_TYPES.FRACTION:
            return `\\frac{${el.numerator}}{${el.denominator}}`;
          case FORMULA_TYPES.POWER:
            return `${el.base}^{${el.exponent}}`;
          case FORMULA_TYPES.SUBSCRIPT:
            return `${el.base}_{${el.subscript}}`;
          case FORMULA_TYPES.LIMIT:
            return `\\lim_{${el.variable}\\to ${el.value}} ${el.function}`;
          case FORMULA_TYPES.SUM:
            return `\\sum_{${el.start}}^{${el.end}} ${el.expression}`;
          case FORMULA_TYPES.INTEGRAL:
            return `\\int_{${el.start}}^{${el.end}} ${el.expression}`;
          case FORMULA_TYPES.PRODUCT:
            return `\\prod_{${el.start}}^{${el.end}} ${el.expression}`;
          case FORMULA_TYPES.SIMPLE:
            return el.value;
          default:
            return "";
        }
      })
      .join(" ");
  };

  const handleSave = () => {
    const latex = generateLatex();
    if (latex.trim()) {
      const mathml = latexToMathML(latex);
      onSave(mathml);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Formülü Düzenle</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Elements List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {elements.map((el, idx) => (
              <FormulaElementEditor
                key={el.id}
                element={el}
                isSelected={selectedId === el.id}
                onSelect={() => setSelectedId(el.id)}
                onUpdate={(field, value) =>
                  updateElement(el.id, field, value)
                }
                onDelete={() => removeElement(el.id)}
                onMove={(direction) => moveElement(el.id, direction)}
                index={idx}
                total={elements.length}
              />
            ))}
          </div>

          {/* Preview */}
          {elements.length > 0 && (
            <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Ön İzleme:
              </p>
              <div
                className="text-center py-6 bg-white rounded border border-emerald-100"
                dangerouslySetInnerHTML={{
                  __html: latexToMathML(generateLatex()),
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-2 bg-gray-50 p-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function FormulaElementEditor({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
  index,
  total,
}) {
  const renderInputs = () => {
    switch (element.type) {
      case FORMULA_TYPES.ROOT:
        return (
          <div className="space-y-2">
            <InputField
              label="Derece"
              value={element.degree}
              onChange={(v) => onUpdate("degree", v)}
              placeholder="3"
            />
            <InputField
              label="Taban"
              value={element.base}
              onChange={(v) => onUpdate("base", v)}
              placeholder="x"
            />
          </div>
        );
      case FORMULA_TYPES.FRACTION:
        return (
          <div className="space-y-2">
            <InputField
              label="Pay"
              value={element.numerator}
              onChange={(v) => onUpdate("numerator", v)}
              placeholder="a"
            />
            <InputField
              label="Payda"
              value={element.denominator}
              onChange={(v) => onUpdate("denominator", v)}
              placeholder="b"
            />
          </div>
        );
      case FORMULA_TYPES.POWER:
        return (
          <div className="space-y-2">
            <InputField
              label="Taban"
              value={element.base}
              onChange={(v) => onUpdate("base", v)}
              placeholder="x"
            />
            <InputField
              label="Kuvvet"
              value={element.exponent}
              onChange={(v) => onUpdate("exponent", v)}
              placeholder="2"
            />
          </div>
        );
      case FORMULA_TYPES.SUBSCRIPT:
        return (
          <div className="space-y-2">
            <InputField
              label="Taban"
              value={element.base}
              onChange={(v) => onUpdate("base", v)}
              placeholder="x"
            />
            <InputField
              label="İndeks"
              value={element.subscript}
              onChange={(v) => onUpdate("subscript", v)}
              placeholder="n"
            />
          </div>
        );
      case FORMULA_TYPES.SIMPLE:
        return (
          <InputField
            label="Değer"
            value={element.value}
            onChange={(v) => onUpdate("value", v)}
            placeholder="x"
          />
        );
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    const labels = {
      [FORMULA_TYPES.ROOT]: "Kök",
      [FORMULA_TYPES.FRACTION]: "Kesir",
      [FORMULA_TYPES.POWER]: "Üslü",
      [FORMULA_TYPES.SUBSCRIPT]: "Alt İndeks",
      [FORMULA_TYPES.LIMIT]: "Limit",
      [FORMULA_TYPES.SUM]: "Toplam",
      [FORMULA_TYPES.INTEGRAL]: "İntegral",
      [FORMULA_TYPES.PRODUCT]: "Çarpım",
      [FORMULA_TYPES.SIMPLE]: "Değişken",
    };
    return labels[element.type] || element.type;
  };

  return (
    <div
      onClick={onSelect}
      className={`formula-editor-element ${isSelected ? "selected" : ""}`}
    >
      <div className="formula-editor-header">
        <span className="formula-editor-index">{index + 1}</span>
        <span className="formula-editor-type">{getTypeLabel()}</span>
        <div className="formula-editor-controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove("up");
            }}
            disabled={index === 0}
            className="formula-editor-btn"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove("down");
            }}
            disabled={index === total - 1}
            className="formula-editor-btn"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="formula-editor-btn delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="formula-editor-content">{renderInputs()}</div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}
