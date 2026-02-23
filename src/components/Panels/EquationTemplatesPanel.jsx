/**
 * Equation Templates Panel (Modal Version)
 * Denklem şablonları paneli - Modal Tasarımlı
 */

import React, { useState } from "react";
import { X, BookOpen, Sparkles, Send, Sigma } from "lucide-react";

const EQUATION_TEMPLATES = [
  { name: "Lineer Denklem", latex: "ax + b = 0", category: "Cebir" },
  { name: "Kuadratik", latex: "ax^2 + bx + c = 0", category: "Cebir" },
  { name: "Kuadratik Formül", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", category: "Cebir" },
  { name: "Pisagor Teoremi", latex: "a^2 + b^2 = c^2", category: "Geometri" },
  { name: "Çember Alanı", latex: "A = \\pi r^2", category: "Geometri" },
  { name: "Üçgen Alanı", latex: "A = \\frac{1}{2}bh", category: "Geometri" },
  { name: "Üçgen Çevresi", latex: "P = a + b + c", category: "Geometri" },
  { name: "Euler Formülü", latex: "e^{i\\pi} + 1 = 0", category: "Analiz" },
  { name: "Türev Tanımı", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", category: "Kalkülüs" },
  { name: "İntegral", latex: "\\int_a^b f(x)dx", category: "Kalkülüs" },
  { name: "Taylor Serisi", latex: "f(x) = \\sum_{n=0}^\\infty \\frac{f^{(n)}(a)}{n!}(x-a)^n", category: "Analiz" },
  { name: "Binom Açılımı", latex: "(a+b)^n = \\sum_{k=0}^n \\binom{n}{k}a^{n-k}b^k", category: "Cebir" },
  { name: "Kosinüs Teoremi", latex: "c^2 = a^2 + b^2 - 2ab\\cos C", category: "Trigonometri" },
  { name: "Sinüs Teoremi", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}", category: "Trigonometri" },
  { name: "Momentum", latex: "p = mv", category: "Fizik" },
  { name: "Kinetik Enerji", latex: "E_k = \\frac{1}{2}mv^2", category: "Fizik" },
  { name: "Einstein Denklemi", latex: "E = mc^2", category: "Fizik" },
];

export default function EquationTemplatesPanel({ onInsert = () => { }, onClose = () => { } }) {
  const [selectedCategory, setSelectedCategory] = useState("Cebir");

  const categories = [...new Set(EQUATION_TEMPLATES.map((e) => e.category))];
  const filteredEquations = EQUATION_TEMPLATES.filter((e) => e.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200 mx-4">

        {/* Header - Premium Gradient */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-inner">
              <BookOpen size={24} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Denklem Şablonları</h3>
              <p className="text-violet-100/70 text-xs font-bold tracking-widest uppercase">Kütüphane Erişimi</p>
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

        {/* Equations List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEquations.map((eq) => (
              <button
                key={eq.latex}
                onClick={() => {
                  onInsert(eq.latex);
                  onClose();
                }}
                className="group relative p-5 bg-slate-800/40 border-2 border-slate-700/30 rounded-2xl transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-2xl hover:shadow-violet-900/20 hover:-translate-y-1 active:translate-y-0 text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 group-hover:text-white uppercase tracking-tight transition-colors">
                      {eq.name}
                    </span>
                    <Send size={12} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-700 group-hover:border-violet-500/30 transition-colors">
                    <code className="text-[10px] text-violet-300/60 group-hover:text-violet-300 font-mono break-all leading-relaxed transition-colors">
                      {eq.latex}
                    </code>
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={10} className="text-violet-400/50" />
                </div>
              </button>
            ))}
          </div>

          {/* Tips Info Card */}
          <div className="mt-8 p-6 rounded-3xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20">
              <Sigma size={20} className="text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-200 uppercase tracking-widest mb-0.5">Hızlı Ekleme</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight">Belgenize anında eklemek için istediğiniz şablona tıklayın.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-10 py-3.5 border border-slate-700 rounded-2xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-300 font-black text-xs uppercase tracking-[0.2em]"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
