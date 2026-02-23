import { useState, useEffect } from "react";
import { InlineMath, BlockMath } from "react-katex";
import { X, Copy, Check, Sigma, Sparkles, Send } from "lucide-react";

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
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">

        {/* Header - Premium Gradient */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-inner">
              <Sigma size={24} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Denklem Editörü</h3>
              <p className="text-violet-100/70 text-xs font-bold tracking-widest uppercase">Matematiksel İfadeler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* Mode & Quick Toggle */}
          <div className="flex items-center justify-between bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50 shadow-inner">
            <div className="flex gap-1.5 flex-1">
              <button
                onClick={() => setMode("inline")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${mode === "inline"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 scale-105"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  }`}
              >
                Satır İçi
              </button>
              <button
                onClick={() => setMode("block")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${mode === "block"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20 scale-105"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  }`}
              >
                Blok
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} /> LaTeX Girişi
              </label>
              <button
                onClick={handleCopy}
                className="text-[10px] font-bold text-slate-400 hover:text-violet-400 transition-colors uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-violet-500/10"
              >
                {copied ? "Kopyalandı!" : "Kopyala"}
              </button>
            </div>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="w-full p-4 bg-slate-950/50 border border-slate-700/80 text-violet-100 rounded-2xl font-mono text-sm resize-none focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all duration-300 min-h-[100px] shadow-inner"
              placeholder="Örnek: E = mc^2"
            />
          </div>

          {/* Preview Viewport - Luminous Glass */}
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Görsel Önizleme</label>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative flex justify-center items-center py-10 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl min-h-[120px] overflow-hidden">
                <div className="text-white text-3xl transition-transform duration-500 transform group-hover:scale-110">
                  {mode === "inline" ? (
                    <InlineMath math={latex} />
                  ) : (
                    <BlockMath math={latex} />
                  )}
                </div>
                {/* Decorative mesh */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>

          {/* Favorites / Common Grid */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hızlı Şablonlar</label>
            <div className="grid grid-cols-2 gap-3">
              {commonEquations.map((eq, idx) => (
                <button
                  key={idx}
                  onClick={() => setLatex(eq.latex)}
                  className="p-3 text-left border border-slate-700/50 bg-slate-800/30 rounded-2xl hover:bg-violet-500/10 hover:border-violet-500/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="font-bold text-slate-300 text-[11px] group-hover:text-white transition-colors uppercase tracking-tight">{eq.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 opacity-60 group-hover:opacity-100 transition-opacity truncate">{eq.latex}</div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Send size={10} className="text-violet-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3.5 border border-slate-700 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-[0.2em]"
          >
            Vazgeç
          </button>
          <button
            onClick={handleInsert}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 hover:-translate-y-0.5 active:translate-y-0"
          >
            Denklemi Yerleştir
          </button>
        </div>
      </div>
    </div>
  );
}
