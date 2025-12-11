/**
 * Interactive Formula Builder
 * Yapılandırılmış formül oluşturma sistemi
 * Her eleman tıklanabilir ve düzenlenebilir
 */

import { useState, useCallback } from "react";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { latexToMathML } from "../../utils/latexToMathML";
import "./FormulaBuilder.css";

const FORMULA_TYPES = {
  ROOT: "root",           // ³√x
  FRACTION: "fraction",   // a/b
  POWER: "power",         // x^n
  SUBSCRIPT: "subscript", // x_n
  LIMIT: "limit",         // lim x→∞
  SUM: "sum",             // Σ
  INTEGRAL: "integral",   // ∫
  PRODUCT: "product",     // ∏
  SIMPLE: "simple",       // sadece metin
};

export default function FormulaBuilder({ onInsert, onClose }) {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Yeni eleman ekle
  const addElement = (type) => {
    const newElement = {
      id: Date.now(),
      type,
      ...getDefaultValues(type),
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const getDefaultValues = (type) => {
    switch (type) {
      case FORMULA_TYPES.ROOT:
        return { degree: "3", base: "x" };
      case FORMULA_TYPES.FRACTION:
        return { numerator: "a", denominator: "b" };
      case FORMULA_TYPES.POWER:
        return { base: "x", exponent: "2" };
      case FORMULA_TYPES.SUBSCRIPT:
        return { base: "x", subscript: "n" };
      case FORMULA_TYPES.LIMIT:
        return { variable: "x", value: "∞", function: "f(x)" };
      case FORMULA_TYPES.SUM:
        return { start: "i=1", end: "n", expression: "a_i" };
      case FORMULA_TYPES.INTEGRAL:
        return { start: "a", end: "b", expression: "f(x)dx" };
      case FORMULA_TYPES.PRODUCT:
        return { start: "i=1", end: "n", expression: "a_i" };
      case FORMULA_TYPES.SIMPLE:
        return { value: "x" };
      default:
        return {};
    }
  };

  const updateElement = (id, field, value) => {
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, [field]: value } : el
      )
    );
  };

  const removeElement = (id) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
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

  // Formülü LaTeX'e çevir
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

  const handleInsert = () => {
    const latex = generateLatex();
    if (latex.trim()) {
      onInsert(latex);
      setElements([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Formül Oluşturucusu</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Element Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => addElement(FORMULA_TYPES.SIMPLE)}
              className="formula-btn"
            >
              <span>x</span>
              <small>Değişken</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.ROOT)}
              className="formula-btn"
            >
              <span>³√</span>
              <small>Kök</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.FRACTION)}
              className="formula-btn"
            >
              <span>a/b</span>
              <small>Kesir</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.POWER)}
              className="formula-btn"
            >
              <span>x²</span>
              <small>Üslü</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.SUBSCRIPT)}
              className="formula-btn"
            >
              <span>xₙ</span>
              <small>Alt İndeks</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.LIMIT)}
              className="formula-btn"
            >
              <span>lim</span>
              <small>Limit</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.SUM)}
              className="formula-btn"
            >
              <span>Σ</span>
              <small>Toplam</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.INTEGRAL)}
              className="formula-btn"
            >
              <span>∫</span>
              <small>İntegral</small>
            </button>
            <button
              onClick={() => addElement(FORMULA_TYPES.PRODUCT)}
              className="formula-btn"
            >
              <span>∏</span>
              <small>Çarpım</small>
            </button>
          </div>

          {/* Elements List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {elements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Yukarıdan eleman seç ve formülünü oluştur
              </p>
            ) : (
              elements.map((el, idx) => (
                <FormulaElement
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
              ))
            )}
          </div>

          {/* Preview */}
          {elements.length > 0 && (
            <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Ön İzleme (LaTeX):
              </p>
              <code className="block bg-white p-2 rounded text-sm text-gray-700 overflow-x-auto">
                {generateLatex()}
              </code>
              <p className="text-xs font-semibold text-gray-600 mt-3 mb-2">
                Görünüş:
              </p>
              <div
                className="text-center py-4 bg-white rounded border border-purple-100"
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
            onClick={handleInsert}
            disabled={elements.length === 0}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Formülü Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

// Element Editor Component
function FormulaElement({
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
      case FORMULA_TYPES.LIMIT:
        return (
          <div className="space-y-2">
            <InputField
              label="Değişken"
              value={element.variable}
              onChange={(v) => onUpdate("variable", v)}
              placeholder="x"
            />
            <InputField
              label="Gidiş"
              value={element.value}
              onChange={(v) => onUpdate("value", v)}
              placeholder="∞"
            />
            <InputField
              label="Fonksiyon"
              value={element.function}
              onChange={(v) => onUpdate("function", v)}
              placeholder="f(x)"
            />
          </div>
        );
      case FORMULA_TYPES.SUM:
      case FORMULA_TYPES.PRODUCT:
        return (
          <div className="space-y-2">
            <InputField
              label="Başlangıç"
              value={element.start}
              onChange={(v) => onUpdate("start", v)}
              placeholder="i=1"
            />
            <InputField
              label="Bitiş"
              value={element.end}
              onChange={(v) => onUpdate("end", v)}
              placeholder="n"
            />
            <InputField
              label="İfade"
              value={element.expression}
              onChange={(v) => onUpdate("expression", v)}
              placeholder="a_i"
            />
          </div>
        );
      case FORMULA_TYPES.INTEGRAL:
        return (
          <div className="space-y-2">
            <InputField
              label="Alt Limit"
              value={element.start}
              onChange={(v) => onUpdate("start", v)}
              placeholder="a"
            />
            <InputField
              label="Üst Limit"
              value={element.end}
              onChange={(v) => onUpdate("end", v)}
              placeholder="b"
            />
            <InputField
              label="İfade"
              value={element.expression}
              onChange={(v) => onUpdate("expression", v)}
              placeholder="f(x)dx"
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
      className={`formula-element ${isSelected ? "selected" : ""}`}
    >
      <div className="formula-element-header">
        <span className="formula-element-index">{index + 1}</span>
        <span className="formula-element-type">{getTypeLabel()}</span>
        <div className="formula-element-controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove("up");
            }}
            disabled={index === 0}
            className="formula-control-btn"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove("down");
            }}
            disabled={index === total - 1}
            className="formula-control-btn"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="formula-control-btn delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isSelected && (
        <div className="formula-element-content">{renderInputs()}</div>
      )}
    </div>
  );
}

// Input Helper Component
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
        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}
