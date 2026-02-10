import { useState } from "react";
import { Settings, ChevronDown, ChevronRight, Type, AlignLeft, Layout } from "lucide-react";

const WORD_SAFE_FONTS = [
  "Calibri",
  "Arial",
  "Times New Roman",
  "Cambria",
  "Georgia",
  "Verdana"
];

export default function ArticleSettingsPanel({ settings, onSettingsChange }) {
  // Panel artık her zaman açık/görünür olacak çünkü sidebar içinde
  const [expandedSections, setExpandedSections] = useState({
    title: true,
    body: true,
    paragraph: false,
    margins: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const SectionHeader = ({ title, section, icon: Icon }) => (
    <button
      className="w-full flex items-center justify-between p-3 bg-white/40 hover:bg-white/80 border border-white/20 rounded-xl transition-all duration-300 group mb-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded-lg transition-all duration-300 ${expandedSections[section] ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 text-slate-500 group-hover:bg-rose-50 group-hover:text-rose-600'}`}>
          <Icon size={14} />
        </div>
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider group-hover:text-slate-900 transition-colors">{title}</span>
      </div>
      {expandedSections[section] ? <ChevronDown size={14} className="text-rose-500 animate-in fade-in duration-300" /> : <ChevronRight size={14} className="text-slate-400" />}
    </button>
  );

  return (
    <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar pb-20">

      <div className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-200/60">
        <div className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/10 border border-slate-700/50">
          <Settings size={18} />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-sm tracking-tight">Genel Ayarlar</h2>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Belge Varsayılanları</p>
        </div>
      </div>

      <div className="space-y-1">

        {/* Başlık Ayarları */}
        <div>
          <SectionHeader title="Başlık Stili" section="title" icon={Type} />

          {expandedSections.title && (
            <div className="px-2 pb-4 space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Yazı Tipi</label>
                <select
                  value={settings.titleFontFamily}
                  onChange={(e) => handleChange("titleFontFamily", e.target.value)}
                  className="w-full border border-slate-200/60 bg-white/50 backdrop-blur-sm text-slate-700 rounded-lg px-3 py-2 text-xs focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all duration-300"
                >
                  {WORD_SAFE_FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Renk</label>
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-lg p-1 bg-white">
                    <input
                      type="color"
                      value={settings.titleColor}
                      onChange={(e) => handleChange("titleColor", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-neutral-500 uppercase">{settings.titleColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Boyut (px)</label>
                  <input
                    type="number"
                    value={settings.titleFontSize}
                    onChange={(e) => handleChange("titleFontSize", parseInt(e.target.value))}
                    className="w-full border border-slate-200/60 bg-white/50 backdrop-blur-sm text-slate-700 rounded-lg px-3 py-2 text-xs focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metin Ayarları */}
        <div>
          <SectionHeader title="Gövde Metni" section="body" icon={AlignLeft} />

          {expandedSections.body && (
            <div className="px-2 pb-4 space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Yazı Tipi</label>
                <select
                  value={settings.bodyFontFamily}
                  onChange={(e) => handleChange("bodyFontFamily", e.target.value)}
                  className="w-full border border-neutral-200 bg-white text-neutral-700 rounded-lg px-3 py-2 text-xs focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                >
                  {WORD_SAFE_FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Renk</label>
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-lg p-1 bg-white">
                    <input
                      type="color"
                      value={settings.bodyColor}
                      onChange={(e) => handleChange("bodyColor", e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-none p-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-neutral-500 uppercase">{settings.bodyColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Boyut</label>
                  <input
                    type="number"
                    value={settings.bodyFontSize}
                    onChange={(e) => handleChange("bodyFontSize", parseInt(e.target.value))}
                    className="w-full border border-neutral-200 bg-white text-neutral-700 rounded-lg px-3 py-2 text-xs focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Satır Yüksekliği</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={settings.bodyLineHeight}
                    onChange={(e) => handleChange("bodyLineHeight", parseFloat(e.target.value))}
                    className="flex-1 accent-rose-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-medium text-neutral-700 w-8 text-right">{settings.bodyLineHeight}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Paragraf Ayarları */}
        <div>
          <SectionHeader title="Paragraf" section="paragraph" icon={AlignLeft} />

          {expandedSections.paragraph && (
            <div className="px-2 pb-4 space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Girinti (px)</label>
                  <input
                    type="number"
                    value={settings.paragraphIndent}
                    onChange={(e) => handleChange("paragraphIndent", parseInt(e.target.value))}
                    className="w-full border border-neutral-200 bg-white text-neutral-700 rounded-lg px-3 py-2 text-xs focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1.5 font-bold uppercase">Boşluk (px)</label>
                  <input
                    type="number"
                    value={settings.paragraphSpacing}
                    onChange={(e) => handleChange("paragraphSpacing", parseInt(e.target.value))}
                    className="w-full border border-neutral-200 bg-white text-neutral-700 rounded-lg px-3 py-2 text-xs focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sayfa Boşlukları */}
        <div>
          <SectionHeader title="Kenar Boşlukları" section="margins" icon={Layout} />

          {expandedSections.margins && (
            <div className="px-2 pb-4 animate-in slide-in-from-top-1 fade-in duration-200">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                {/* Visual representation could be added here */}

                <div className="col-span-2 flex justify-center">
                  <div className="w-1/2">
                    <label className="block text-[9px] text-center text-neutral-400 mb-1 font-bold uppercase">Üst</label>
                    <input
                      type="number"
                      value={settings.pageMarginTop}
                      onChange={(e) => handleChange("pageMarginTop", parseInt(e.target.value))}
                      className="w-full text-center border border-neutral-200 bg-white text-neutral-700 rounded-lg px-2 py-1.5 text-xs focus:border-rose-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-center text-neutral-400 mb-1 font-bold uppercase">Sol</label>
                  <input
                    type="number"
                    value={settings.pageMarginLeft}
                    onChange={(e) => handleChange("pageMarginLeft", parseInt(e.target.value))}
                    className="w-full text-center border border-neutral-200 bg-white text-neutral-700 rounded-lg px-2 py-1.5 text-xs focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] text-center text-neutral-400 mb-1 font-bold uppercase">Sağ</label>
                  <input
                    type="number"
                    value={settings.pageMarginRight}
                    onChange={(e) => handleChange("pageMarginRight", parseInt(e.target.value))}
                    className="w-full text-center border border-neutral-200 bg-white text-neutral-700 rounded-lg px-2 py-1.5 text-xs focus:border-rose-400 outline-none"
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <div className="w-1/2">
                    <label className="block text-[9px] text-center text-neutral-400 mb-1 font-bold uppercase">Alt</label>
                    <input
                      type="number"
                      value={settings.pageMarginBottom}
                      onChange={(e) => handleChange("pageMarginBottom", parseInt(e.target.value))}
                      className="w-full text-center border border-neutral-200 bg-white text-neutral-700 rounded-lg px-2 py-1.5 text-xs focus:border-rose-400 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
