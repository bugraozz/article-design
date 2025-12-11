import { useState } from "react";

export default function ArticleSettingsPanel({ settings, onSettingsChange }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-xl rounded-lg p-4 w-64 z-40 max-h-96 overflow-y-auto border border-gray-200">
      <button
        className="w-full text-left font-semibold mb-3 flex justify-between items-center hover:bg-gray-50 p-2 rounded transition-all duration-150 text-gray-800"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <span>⚙️</span>
          <span>Makale Ayarları</span>
        </span>
        <span className="text-gray-400">{expanded ? "▼" : "▶"}</span>
      </button>

      {expanded && (
        <div className="space-y-4 text-sm">
          {/* Başlık Ayarları */}
          <div className="border-t border-gray-200 pt-3">
            <h3 className="font-semibold mb-2 text-gray-700 text-xs uppercase tracking-wide">
              Başlık
            </h3>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Renk</label>
              <input
                type="color"
                value={settings.titleColor}
                onChange={(e) => handleChange("titleColor", e.target.value)}
                className="w-full h-8 rounded cursor-pointer border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs mt-2 text-gray-600 mb-1 font-medium">Boyut (px)</label>
              <input
                type="number"
                value={settings.titleFontSize}
                onChange={(e) =>
                  handleChange("titleFontSize", parseInt(e.target.value))
                }
                className="w-full border border-gray-300 bg-white text-gray-800 rounded px-3 py-1.5 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Metin Ayarları */}
          <div className="border-t border-gray-200 pt-3">
            <h3 className="font-semibold mb-2 text-gray-700 text-xs uppercase tracking-wide">
              Metin Ayarları
            </h3>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Metin Rengi</label>
              <input
                type="color"
                value={settings.bodyColor}
                onChange={(e) => handleChange("bodyColor", e.target.value)}
                className="w-full h-8 rounded cursor-pointer border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs mt-2 text-gray-600 mb-1 font-medium">Metin Boyutu (px)</label>
              <input
                type="number"
                value={settings.bodyFontSize}
                onChange={(e) =>
                  handleChange("bodyFontSize", parseInt(e.target.value))
                }
                className="w-full border border-gray-300 bg-white text-gray-800 rounded px-3 py-1.5 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs mt-2 text-gray-600 mb-1 font-medium">Satır Yüksekliği</label>
              <input
                type="number"
                step="0.1"
                value={settings.bodyLineHeight}
                onChange={(e) =>
                  handleChange("bodyLineHeight", parseFloat(e.target.value))
                }
                className="w-full border border-gray-300 bg-white text-gray-800 rounded px-3 py-1.5 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Paragraf Ayarları */}
          <div className="border-t border-gray-200 pt-3">
            <h3 className="font-semibold mb-2 text-gray-700 text-xs uppercase tracking-wide">
              Paragraf
            </h3>
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Girintisi (px)</label>
              <input
                type="number"
                value={settings.paragraphIndent}
                onChange={(e) =>
                  handleChange("paragraphIndent", parseInt(e.target.value))
                }
                className="w-full border border-gray-300 bg-white text-gray-800 rounded px-3 py-1.5 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs mt-2 text-gray-600 mb-1 font-medium">Arası (px)</label>
              <input
                type="number"
                value={settings.paragraphSpacing}
                onChange={(e) =>
                  handleChange("paragraphSpacing", parseInt(e.target.value))
                }
                className="w-full border border-gray-300 bg-white text-gray-800 rounded px-3 py-1.5 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Sayfa Boşlukları */}
          <div className="border-t border-gray-200 pt-3">
            <h3 className="font-semibold mb-2 text-gray-700 text-xs uppercase tracking-wide">
              Sayfa Boşlukları
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Üst</label>
                <input
                  type="number"
                  value={settings.pageMarginTop}
                  onChange={(e) =>
                    handleChange("pageMarginTop", parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 bg-white text-gray-800 rounded px-2 py-1.5 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Alt</label>
                <input
                  type="number"
                  value={settings.pageMarginBottom}
                  onChange={(e) =>
                    handleChange("pageMarginBottom", parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 bg-white text-gray-800 rounded px-2 py-1.5 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Sol</label>
                <input
                  type="number"
                  value={settings.pageMarginLeft}
                  onChange={(e) =>
                    handleChange("pageMarginLeft", parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 bg-white text-gray-800 rounded px-2 py-1.5 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Sağ</label>
                <input
                  type="number"
                  value={settings.pageMarginRight}
                  onChange={(e) =>
                    handleChange("pageMarginRight", parseInt(e.target.value))
                  }
                  className="w-full border border-gray-300 bg-white text-gray-800 rounded px-2 py-1.5 text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
