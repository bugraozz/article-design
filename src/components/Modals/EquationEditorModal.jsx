import { useState, useEffect } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { X, Copy, Check } from "lucide-react";

export default function EquationEditorModal({ onClose, onInsert }) {
  const [latex, setLatex] = useState("E = mc^2");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("inline"); // inline veya block

  const commonEquations = [
    { label: "E = mc²", latex: "E = mc^2" },
    { label: "Pisagor Teoremi", latex: "a^2 + b^2 = c^2" },
    { label: "İkinci Derece", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
    { label: "İntegral", latex: "\\int_a^b f(x)dx" },
    { label: "Türev", latex: "\\frac{d}{dx}f(x)" },
    { label: "Toplam", latex: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}" },
    { label: "Ürün", latex: "\\prod_{i=1}^{n} x_i" },
    { label: "Limit", latex: "\\lim_{x \\to \\infty} f(x)" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    onInsert(latex, mode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-purple-500">∑</span>
            Denklem Editörü
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-all duration-150"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mode Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("inline")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 text-sm ${
                mode === "inline"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              Satır İçi
            </button>
            <button
              onClick={() => setMode("block")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 text-sm ${
                mode === "block"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              Blok
            </button>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LaTeX Denklemi
            </label>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="w-full p-3 border border-gray-300 bg-white text-gray-800 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              rows="3"
              placeholder="Örnek: E = mc^2"
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Önizleme:</p>
            <div className="flex justify-center py-4 bg-white rounded border border-gray-300">
              {mode === "inline" ? (
                <InlineMath math={latex} />
              ) : (
                <BlockMath math={latex} />
              )}
            </div>
          </div>

          {/* Common Equations */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Sık Kullanılan:</p>
            <div className="grid grid-cols-2 gap-2">
              {commonEquations.map((eq, idx) => (
                <button
                  key={idx}
                  onClick={() => setLatex(eq.latex)}
                  className="p-2 text-left text-sm border border-gray-200 bg-white rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all duration-150"
                >
                  <div className="font-medium text-gray-700">{eq.label}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{eq.latex}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-all duration-150 text-sm font-medium text-gray-700"
          >
            {copied ? (
              <>
                <Check size={16} />
                Kopyalandı!
              </>
            ) : (
              <>
                <Copy size={16} />
                LaTeX'i Kopyala
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-150 font-medium text-gray-700"
          >
            İptal
          </button>
          <button
            onClick={handleInsert}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-150 font-medium shadow-md"
          >
            Denklem Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
