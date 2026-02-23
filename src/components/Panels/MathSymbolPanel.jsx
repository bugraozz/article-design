/**
 * Math Symbol Panel (Modal Version)
 * Matematik semboller paneli - KaTeX Önizlemeli & Modal Tasarımlı
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Sigma, Sparkles, Hash } from "lucide-react";
import katex from "katex";

const MATH_SYMBOLS = [
  { name: "Artı", latex: "+", category: "Temel" },
  { name: "Eksi", latex: "-", category: "Temel" },
  { name: "Çarpı", latex: "\\times", category: "Temel" },
  { name: "Bölü", latex: "\\div", category: "Temel" },
  { name: "Eşittir", latex: "=", category: "Temel" },
  { name: "Eşit Değil", latex: "\\neq", category: "Temel" },
  { name: "Küçüktür", latex: "<", category: "Karşılaştırma" },
  { name: "Büyüktür", latex: ">", category: "Karşılaştırma" },
  { name: "Küçük Eşit", latex: "\\leq", category: "Karşılaştırma" },
  { name: "Büyük Eşit", latex: "\\geq", category: "Karşılaştırma" },
  { name: "Yaklaşık", latex: "\\approx", category: "Karşılaştırma" },
  { name: "Artı Eksi", latex: "\\pm", category: "Temel" },
  { name: "Pi", latex: "\\pi", category: "Sabitler" },
  { name: "Euler", latex: "e", category: "Sabitler" },
  { name: "Sonsuz", latex: "\\infty", category: "Sabitler" },
  { name: "Alfa", latex: "\\alpha", category: "Yunan Harfleri" },
  { name: "Beta", latex: "\\beta", category: "Yunan Harfleri" },
  { name: "Gama", latex: "\\gamma", category: "Yunan Harfleri" },
  { name: "Delta", latex: "\\delta", category: "Yunan Harfleri" },
  { name: "Epsilon", latex: "\\epsilon", category: "Yunan Harfleri" },
  { name: "Teta", latex: "\\theta", category: "Yunan Harfleri" },
  { name: "Lambda", latex: "\\lambda", category: "Yunan Harfleri" },
  { name: "Mü", latex: "\\mu", category: "Yunan Harfleri" },
  { name: "Sigma", latex: "\\sigma", category: "Yunan Harfleri" },
  { name: "Omega", latex: "\\omega", category: "Yunan Harfleri" },
  { name: "Karekök", latex: "\\sqrt{x}", category: "Fonksiyonlar" },
  { name: "Kesir", latex: "\\frac{a}{b}", category: "Fonksiyonlar" },
  { name: "Üs", latex: "x^{n}", category: "Fonksiyonlar" },
  { name: "Alt İndis", latex: "x_{n}", category: "Fonksiyonlar" },
  { name: "İntegral", latex: "\\int", category: "Operatörler" },
  { name: "Toplam", latex: "\\sum", category: "Operatörler" },
  { name: "Çarpım", latex: "\\prod", category: "Operatörler" },
  { name: "Limit", latex: "\\lim", category: "Operatörler" },
  { name: "Kısmi Türev", latex: "\\partial", category: "Operatörler" },
];

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

export default function MathSymbolPanel({ onInsert = () => { }, onClose = () => { } }) {
  const [selectedCategory, setSelectedCategory] = useState("Temel");

  const categories = [...new Set(MATH_SYMBOLS.map((s) => s.category))];
  const filteredSymbols = MATH_SYMBOLS.filter((s) => s.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200 mx-4">

        {/* Header - Premium Gradient */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-inner">
              <Sigma size={24} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Matematik Sembolleri</h3>
              <p className="text-violet-100/70 text-xs font-bold tracking-widest uppercase">Sembol Kütüphanesi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Categories Tab */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${selectedCategory === cat
                    ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-lg shadow-violet-500/20 scale-105"
                    : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:border-violet-500/30 hover:text-slate-200 hover:bg-slate-700"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Symbols Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/50">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filteredSymbols.map((symbol) => (
              <button
                key={symbol.latex}
                onClick={() => {
                  onInsert(symbol.latex);
                  onClose();
                }}
                className="group relative flex flex-col items-center justify-center p-4 bg-slate-800/40 border-2 border-slate-700/30 rounded-2xl transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-2xl hover:shadow-violet-900/20 hover:-translate-y-1.5 active:translate-y-0"
                title={symbol.name}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                <div className="h-10 flex items-center justify-center text-3xl text-slate-200 group-hover:text-white transition-colors relative z-10 font-bold scale-[1.2]">
                  <SymbolPreview latex={symbol.latex} />
                </div>

                <div className="mt-4 text-center relative z-10 w-full">
                  <div className="text-[9px] font-black text-slate-500 group-hover:text-violet-300 uppercase tracking-tight truncate px-1">
                    {symbol.name}
                  </div>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={10} className="text-violet-400" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.1),transparent)]"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="p-3 bg-violet-500/20 backdrop-blur-md rounded-2xl text-violet-400 border border-violet-500/20 shadow-inner">
                <Hash size={20} className="animate-pulse" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest">Profesyonel Mod</p>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px]">
                Sembolü belgeye aktarmak için üzerine tıklayın. Belgenizin neresinde eklenmesini istiyorsanız imlecinizi orada bırakın.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-10 py-3.5 border border-slate-700 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-[0.2em]"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
