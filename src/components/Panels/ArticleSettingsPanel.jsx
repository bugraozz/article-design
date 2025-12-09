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
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-64 z-40 max-h-96 overflow-y-auto">
      <button
        className="w-full text-left font-bold mb-3 flex justify-between items-center hover:bg-gray-100 p-2 rounded"
        onClick={() => setExpanded(!expanded)}
      >
        <span>📋 Makale Ayarları</span>
        <span>{expanded ? "▼" : "▶"}</span>
      </button>

      {expanded && (
        <div className="space-y-4 text-sm">
          {/* Başlık Ayarları */}
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2">📝 Başlık</h3>
            <div>
              <label className="block text-xs">Renk</label>
              <input
                type="color"
                value={settings.titleColor}
                onChange={(e) => handleChange("titleColor", e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs mt-2">Boyut (px)</label>
              <input
                type="number"
                value={settings.titleFontSize}
                onChange={(e) =>
                  handleChange("titleFontSize", parseInt(e.target.value))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Metin Ayarları */}
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2">📄 Metin Ayarları</h3>
            <div>
              <label className="block text-xs">Metin Rengi</label>
              <input
                type="color"
                value={settings.bodyColor}
                onChange={(e) => handleChange("bodyColor", e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs mt-2">Metin Boyutu (px)</label>
              <input
                type="number"
                value={settings.bodyFontSize}
                onChange={(e) =>
                  handleChange("bodyFontSize", parseInt(e.target.value))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs mt-2">Satır Yüksekliği</label>
              <input
                type="number"
                step="0.1"
                value={settings.bodyLineHeight}
                onChange={(e) =>
                  handleChange("bodyLineHeight", parseFloat(e.target.value))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Paragraf Ayarları */}
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2">¶ Paragraf</h3>
            <div>
              <label className="block text-xs">Girintisi (px)</label>
              <input
                type="number"
                value={settings.paragraphIndent}
                onChange={(e) =>
                  handleChange("paragraphIndent", parseInt(e.target.value))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs mt-2">Arası (px)</label>
              <input
                type="number"
                value={settings.paragraphSpacing}
                onChange={(e) =>
                  handleChange("paragraphSpacing", parseInt(e.target.value))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Sayfa Boşlukları */}
          <div className="border-t pt-3">
            <h3 className="font-semibold mb-2">📏 Sayfa Boşlukları</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs">Üst</label>
                <input
                  type="number"
                  value={settings.pageMarginTop}
                  onChange={(e) =>
                    handleChange("pageMarginTop", parseInt(e.target.value))
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs">Alt</label>
                <input
                  type="number"
                  value={settings.pageMarginBottom}
                  onChange={(e) =>
                    handleChange("pageMarginBottom", parseInt(e.target.value))
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs">Sol</label>
                <input
                  type="number"
                  value={settings.pageMarginLeft}
                  onChange={(e) =>
                    handleChange("pageMarginLeft", parseInt(e.target.value))
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs">Sağ</label>
                <input
                  type="number"
                  value={settings.pageMarginRight}
                  onChange={(e) =>
                    handleChange("pageMarginRight", parseInt(e.target.value))
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
