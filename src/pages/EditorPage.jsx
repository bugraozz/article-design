// src/pages/EditorPage.jsx
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEditor } from "@tiptap/react";
import katex from "katex";

import MainToolbar from "../components/Toolbar/MainToolbar";
import PagesPanel from "../components/Editor/PagesPanel";
import PageCanvas from "../components/Editor/PageCanvas";
import TextPropertiesPanel from "../components/Panels/TextPropertiesPanel";
import TablePropertiesPanel from "../components/Panels/TablePropertiesPanel";
import ArticleSettingsPanel from "../components/Panels/ArticleSettingsPanel";
import EquationEditorModal from "../components/Modals/EquationEditorModal";
import MathSymbolPanel from "../components/Panels/MathSymbolPanel";
import EquationTemplatesPanel from "../components/Panels/EquationTemplatesPanel";
import { defaultCoverPage, defaultArticleSettings } from "../types/article";

export default function EditorPage() {
  const [articleSettings, setArticleSettings] = useState(defaultArticleSettings);
  
  const [pages, setPages] = useState([
    defaultCoverPage(1),
  ]);

  const [activePageId, setActivePageId] = useState(1);
  const [activeOverlay, setActiveOverlay] = useState(null);

  // Hangi overlay inline edit modunda?
  const [inlineEditingId, setInlineEditingId] = useState(null);

  // Editor instance (tablo/metin özellikleri için)
  const [currentEditor, setCurrentEditor] = useState(null);

  // Matematik panelleri ve modal state'leri
  const [showEquationEditor, setShowEquationEditor] = useState(false);
  const [showMathSymbolPanel, setShowMathSymbolPanel] = useState(false);
  const [showEquationTemplatesPanel, setShowEquationTemplatesPanel] = useState(false);

  // ===== KLİPBOARD (Stili/Biçimi Kopyala) =====
  const [clipboard, setClipboard] = useState({
    style: null, // Metin stil ayarları
    format: null, // Kutu/layout ayarları
  });

  // ===== MAKALE AYARLARI DEĞİŞTİĞİNDE TÜM OVERLAYLARI GÜNCELLE =====
  const handleArticleSettingsChange = (newSettings) => {
    setArticleSettings(newSettings);

    // Tüm sayfalardaki text overlaylarını GÜNCELLE
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        overlays: page.overlays.map((overlay) => {
          // Sadece text overlaylarını güncelle (image değil)
          if (overlay.type !== "image") {
            return {
              ...overlay,
              // Makale ayarlarını DAIMA uygula
              color: newSettings.bodyColor,
              fontSize: newSettings.bodyFontSize,
              lineHeight: newSettings.bodyLineHeight,
              textIndent: newSettings.paragraphIndent,
              // Başlık ayarları
              titleFontSize: newSettings.titleFontSize,
              titleColor: newSettings.titleColor,
            };
          }
          return overlay;
        }),
        pageSettings: {
          marginTop: newSettings.pageMarginTop,
          marginBottom: newSettings.pageMarginBottom,
          marginLeft: newSettings.pageMarginLeft,
          marginRight: newSettings.pageMarginRight,
        },
      }))
    );
  };

  // Sağ tık context menü
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  // ---------------------------
  //  Overlays & Images update helper
  // ---------------------------
  const handleOverlayChange = (id, partial) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              overlays: p.overlays.map((item) =>
                item.id === id ? { ...item, ...partial } : item
              ),
            }
          : p
      )
    );
  };

  const handleImageChange = (id, partial) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              images: p.images.map((img) =>
                img.id === id ? { ...img, ...partial } : img
              ),
            }
          : p
      )
    );
  };

  // ---------------------------
  //  METİN EKLE
  // ---------------------------
  const addText = () => {
    if (!activePage) return;

    const id = crypto.randomUUID();

    // React state'e metin ekle
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              overlays: [
                ...p.overlays,
                {
                  id,
                  type: "text",
                  html: "<p>Yeni metin</p>",
                  x: 100,
                  y: 100,
                  width: 250,
                  height: 50,
                  rotate: 0,
                  // Makale ayarlarını uygula
                  fontSize: articleSettings.bodyFontSize,
                  color: articleSettings.bodyColor,
                  lineHeight: articleSettings.bodyLineHeight,
                  textIndent: articleSettings.paragraphIndent,
                  titleFontSize: articleSettings.titleFontSize,
                  titleColor: articleSettings.titleColor,
                },
              ],
            }
          : p
      )
    );

    setActiveOverlay(id);
    setInlineEditingId(null);
  };

  // ---------------------------
  //  TABLO EKLE
  // ---------------------------
  const addTable = () => {
    if (!activePage) return;

    const id = crypto.randomUUID();

    // Gerçek Tiptap tablo - 3x3 default
    const tableHtml = `<table><thead><tr><th>Başlık 1</th><th>Başlık 2</th><th>Başlık 3</th></tr></thead><tbody><tr><td>Hücre 1</td><td>Hücre 2</td><td>Hücre 3</td></tr><tr><td>Hücre 4</td><td>Hücre 5</td><td>Hücre 6</td></tr><tr><td>Hücre 7</td><td>Hücre 8</td><td>Hücre 9</td></tr></tbody></table>`;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              overlays: [
                ...p.overlays,
                {
                  id,
                  type: "text",
                  html: tableHtml,
                  x: 50,
                  y: 100,
                  width: 650,
                  height: 250,
                  rotate: 0,
                  // Makale ayarlarını uygula
                  fontSize: articleSettings.bodyFontSize,
                  color: articleSettings.bodyColor,
                  lineHeight: articleSettings.bodyLineHeight,
                  textIndent: articleSettings.paragraphIndent,
                  titleFontSize: articleSettings.titleFontSize,
                  titleColor: articleSettings.titleColor,
                },
              ],
            }
          : p
      )
    );

    setActiveOverlay(id);
    setInlineEditingId(id);
  };
  const addPage = () => {
    setPages((prev) => {
      const newId = prev.length ? prev[prev.length - 1].id + 1 : 1;
      return [
        ...prev,
        {
          id: newId,
          title: `Sayfa ${newId}`,
          type: "content",
          overlays: [
            {
              id: crypto.randomUUID(),
              type: "text",
              html: "<p>İçerik burada başlayacak...</p>",
              x: articleSettings.pageMarginLeft,
              y: articleSettings.pageMarginTop,
              width: 793.9 - (articleSettings.pageMarginLeft + articleSettings.pageMarginRight),
              height: 200,
              // Metin ayarları
              fontSize: articleSettings.bodyFontSize,
              color: articleSettings.bodyColor,
              lineHeight: articleSettings.bodyLineHeight,
              textIndent: articleSettings.paragraphIndent,
              // Başlık ayarları
              titleFontSize: articleSettings.titleFontSize,
              titleColor: articleSettings.titleColor,
            },
          ],
          images: [],
          pageSettings: {
            marginTop: articleSettings.pageMarginTop,
            marginBottom: articleSettings.pageMarginBottom,
            marginLeft: articleSettings.pageMarginLeft,
            marginRight: articleSettings.pageMarginRight,
          },
        },
      ];
    });

    setActivePageId((prev) => prev + 1);
    setActiveOverlay(null);
    setInlineEditingId(null);
  };

  // ---------------------------
  //  MATEMATİK FONKSİYONLARI
  // ---------------------------
  
  // Denklem editörünü aç
  const handleOpenEquationEditor = () => {
    setShowEquationEditor(true);
  };

  // Denklem ekle
  const handleInsertEquation = (latex, mode) => {
    // KaTeX ile render et
    let katexHTML = '';
    try {
      katexHTML = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: mode === "block",
        output: 'html',
        trust: true,
        strict: false,
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      katexHTML = mode === "inline" ? `$${latex}$` : `$$${latex}$$`;
    }

    const equationHTML = mode === "inline" 
      ? `<span class="math-inline katex-rendered" data-latex="${latex}">${katexHTML}</span>`
      : `<div class="math-block katex-rendered" data-latex="${latex}">${katexHTML}</div>`;

    // Sadece aktif olarak düzenleme yapılıyorsa cursor pozisyonuna ekle
    if (currentEditor && inlineEditingId) {
      // Cursor pozisyonunu al ve oraya ekle
      const { from } = currentEditor.state.selection;
      currentEditor.chain().focus().insertContentAt(from, equationHTML).run();
      setShowEquationEditor(false);
    } 
    else {
      // Aktif editör yok - Yeni minimal text box oluştur
      const activePage = pages.find((p) => p.id === activePageId);
      if (!activePage) return;

      const newOverlay = {
        id: crypto.randomUUID(),
        type: "text",
        html: equationHTML,
        x: 100,
        y: 100,
        width: 400,
        height: 80,
        fontSize: activePage.overlays[0]?.fontSize || articleSettings.bodyFontSize,
        color: activePage.overlays[0]?.color || articleSettings.bodyColor,
        lineHeight: activePage.overlays[0]?.lineHeight || articleSettings.bodyLineHeight,
        textIndent: activePage.overlays[0]?.textIndent || articleSettings.paragraphIndent,
        titleFontSize: activePage.overlays[0]?.titleFontSize || articleSettings.titleFontSize,
        titleColor: activePage.overlays[0]?.titleColor || articleSettings.titleColor,
      };

      setPages((prev) =>
        prev.map((page) =>
          page.id === activePageId
            ? { ...page, overlays: [...page.overlays, newOverlay] }
            : page
        )
      );

      setActiveOverlay(newOverlay.id);
      setShowEquationEditor(false);
    }
  };

  // Sembol panelini aç
  const handleOpenMathSymbolPanel = () => {
    setShowMathSymbolPanel(true);
  };

  // Sembol ekle
  const handleInsertSymbol = (latex) => {
    // KaTeX ile render et
    let katexHTML = '';
    try {
      katexHTML = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        trust: true,
        strict: false,
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      katexHTML = `$${latex}$`;
    }

    const symbolHTML = `<span class="math-inline katex-rendered" data-latex="${latex}">${katexHTML}</span>`;

    // Sadece aktif olarak düzenleme yapılıyorsa cursor pozisyonuna ekle
    if (currentEditor && inlineEditingId) {
      // Cursor pozisyonunu al ve oraya ekle
      const { from } = currentEditor.state.selection;
      currentEditor.chain().focus().insertContentAt(from, symbolHTML).run();
      setShowMathSymbolPanel(false);
    } 
    else {
      // Aktif editör yok - Yeni minimal text box oluştur
      const activePage = pages.find((p) => p.id === activePageId);
      if (!activePage) return;

      const newOverlay = {
        id: crypto.randomUUID(),
        type: "text",
        html: symbolHTML,
        x: 100,
        y: 100,
        width: 300,
        height: 60,
        fontSize: activePage.overlays[0]?.fontSize || articleSettings.bodyFontSize,
        color: activePage.overlays[0]?.color || articleSettings.bodyColor,
        lineHeight: activePage.overlays[0]?.lineHeight || articleSettings.bodyLineHeight,
        textIndent: activePage.overlays[0]?.textIndent || articleSettings.paragraphIndent,
        titleFontSize: activePage.overlays[0]?.titleFontSize || articleSettings.titleFontSize,
        titleColor: activePage.overlays[0]?.titleColor || articleSettings.titleColor,
      };

      setPages((prev) =>
        prev.map((page) =>
          page.id === activePageId
            ? { ...page, overlays: [...page.overlays, newOverlay] }
            : page
        )
      );

      setActiveOverlay(newOverlay.id);
      setShowMathSymbolPanel(false);
    }
  };

  // ---------------------------
  //  PNG EXPORT
  // ---------------------------
  const exportPNG = async () => {
    const a4Element = document.getElementById("a4-page");
    if (!a4Element) return;

    try {
      // SVG overlay'leri gizle
      const svgs = a4Element.querySelectorAll("svg");
      svgs.forEach((svg) => (svg.style.display = "none"));

      const canvas = await html2canvas(a4Element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
      });

      // SVG'leri geri göster
      svgs.forEach((svg) => (svg.style.display = ""));

      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `sayfa-${activePageId}.png`;
      link.click();
    } catch (error) {
      console.error("PNG export hatası:", error);
    }
  };

  // ---------------------------
  //  PDF EXPORT
  // ---------------------------
  const exportPDF = async () => {
    const element = document.getElementById("a4-page");
    if (!element) return;

    try {
      // SVG overlay'leri gizle
      const svgs = element.querySelectorAll("svg");
      svgs.forEach((svg) => (svg.style.display = "none"));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
      });

      // SVG'leri geri göster
      svgs.forEach((svg) => (svg.style.display = ""));

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "pt", "a4");
      pdf.addImage(imgData, "JPEG", 0, 0, 595.28, 841.89);
      pdf.save(`sayfa-${activePageId}.pdf`);
    } catch (error) {
      console.error("PDF export hatası:", error);
    }
  };

  // ---------------------------
  //  RESİM EKLE
  // ---------------------------
  const addImage = () => {
    if (!activePage) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (f) {
        const data = f.target.result;
        const id = crypto.randomUUID();

        // Resim boyutlarını ölç
        const img = new Image();
        img.onload = function () {
          const aspectRatio = this.width / this.height;
          const displayWidth = 300;
          const displayHeight = displayWidth / aspectRatio;

          setPages((prev) =>
            prev.map((p) =>
              p.id === activePageId
                ? {
                    ...p,
                    images: [
                      ...p.images,
                      {
                        id,
                        src: data,
                        x: 150,
                        y: 150,
                        width: displayWidth,
                        height: displayHeight,
                        angle: 0,
                      },
                    ],
                  }
                : p
            )
          );
        };
        img.src = data;
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  // ---------------------------
  //  SEÇİLİ ALANA RESİM EKLE (Eski Alanı Değiştir)
  // ---------------------------
  const addImageToSelectedArea = () => {
    const targetId = contextMenu.targetId;
    if (!targetId || !activePage) return;

    const overlay = activePage.overlays.find((o) => o.id === targetId);
    if (!overlay) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (f) {
        const data = f.target.result;
        const imageId = crypto.randomUUID();

        // Seçili alanı sil, yerine görsel ekle
        setPages((prev) =>
          prev.map((p) =>
            p.id === activePageId
              ? {
                  ...p,
                  // Seçili text overlay'ı sil
                  overlays: p.overlays.filter((o) => o.id !== targetId),
                  // Yerine görsel ekle
                  images: [
                    ...p.images,
                    {
                      id: imageId,
                      src: data,
                      x: overlay.x,
                      y: overlay.y,
                      width: overlay.width,
                      height: overlay.height,
                      angle: 0,
                    },
                  ],
                }
              : p
          )
        );

        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
        setActiveOverlay(null);
        setInlineEditingId(null);
        alert("✅ Görsel eklendi!");
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  // ---------------------------
  //  SAĞ TIK MENÜ ACTION'LAR
  // ---------------------------
  const handleRightClick = (id, pos) => {
    setContextMenu({
      visible: true,
      x: pos.x,
      y: pos.y,
      targetId: id,
    });
  };

  const bringToFront = () => {
    // HTML overlay sistemi için - zIndex kullanırız
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const sendToBack = () => {
    // HTML overlay sistemi için - zIndex kullanırız
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const deleteOverlay = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              overlays: p.overlays.filter((o) => o.id !== id),
              images: p.images.filter((img) => img.id !== id),
            }
          : p
      )
    );

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    if (activeOverlay === id) setActiveOverlay(null);
    if (inlineEditingId === id) setInlineEditingId(null);
  };

  // ===== STİL KOPYALA =====
  const copyStyle = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    const overlay = activePage?.overlays.find((o) => o.id === id);
    if (!overlay) return;

    setClipboard({
      ...clipboard,
      style: {
        color: overlay.color,
        fontSize: overlay.fontSize,
        lineHeight: overlay.lineHeight,
        textIndent: overlay.textIndent,
        titleColor: overlay.titleColor,
        titleFontSize: overlay.titleFontSize,
      },
    });

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    alert("✅ Stil kopyalandı!");
  };

  // ===== STİL YAPIŞT =====
  const pasteStyle = () => {
    const id = contextMenu.targetId;
    if (!id || !clipboard.style) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              overlays: p.overlays.map((o) =>
                o.id === id
                  ? {
                      ...o,
                      ...clipboard.style,
                    }
                  : o
              ),
            }
          : p
      )
    );

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    alert("✅ Stil yapıştırıldı!");
  };

  // ===== BİÇİM KOPYALA (Kutu Özellikleri - Pozisyon Hariç) =====
  const copyFormat = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    const overlay = activePage?.overlays.find((o) => o.id === id);
    if (!overlay) return;

    setClipboard({
      ...clipboard,
      format: {
        width: overlay.width,
        height: overlay.height,
        rotate: overlay.rotate,
      },
    });

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    alert("✅ Biçim kopyalandı!");
  };

  // ===== BİÇİM YAPIŞT (Pozisyon korur, sadece boyut/rotasyon uygula) =====
  const pasteFormat = () => {
    const id = contextMenu.targetId;
    if (!id || !clipboard.format) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              overlays: p.overlays.map((o) =>
                o.id === id
                  ? {
                      ...o,
                      width: clipboard.format.width,
                      height: clipboard.format.height,
                      rotate: clipboard.format.rotate,
                      // x ve y KORUYORUZ - değişmez!
                    }
                  : o
              ),
            }
          : p
      )
    );

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    alert("✅ Biçim yapıştırıldı!");
  };

  // ---------------------------
  //  RENDER
  // ---------------------------
  return (
    <div
      className="flex flex-col w-full h-screen"
      onClick={() => {
        // sayfanın boş yerine tıklayınca inline edit ve context menü kapansın
        setInlineEditingId(null);
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }}
    >
      {/* ÜST TOOLBAR */}
      <MainToolbar
        onAddText={addText}
        onAddImage={addImage}
        onAddTable={addTable}
        onExport={exportPNG}
        onExportPDF={exportPDF}
        onAddPage={addPage}
        onOpenEquationEditor={handleOpenEquationEditor}
        onOpenMathSymbolPanel={handleOpenMathSymbolPanel}
      />

      <div className="flex flex-row grow">
        {/* SOL SAYFA PANELİ */}
        <PagesPanel
          pages={pages}
          activePageId={activePageId}
          onSelectPage={(id) => {
            setActivePageId(id);
            setActiveOverlay(null);
            setInlineEditingId(null);
            setContextMenu((prev) => ({ ...prev, visible: false }));
          }}
        />

        {/* A4 CANVAS ALANI */}
        {activePage && (
          <PageCanvas
            overlays={activePage.overlays}
            images={activePage.images}
            pageSettings={activePage.pageSettings}
            activeOverlay={activeOverlay}
            setActiveOverlay={setActiveOverlay}
            activePageId={activePageId}
            onOverlayChange={handleOverlayChange}
            onImageChange={handleImageChange}
            onRightClick={handleRightClick}
            inlineEditingId={inlineEditingId}
            setInlineEditingId={setInlineEditingId}
            onEditorCreate={setCurrentEditor}
            onOpenEquationEditor={handleOpenEquationEditor}
            onOpenMathSymbolPanel={handleOpenMathSymbolPanel}
          />
        )}

        {/* SAĞ METIN ÖZELLİKLERİ PANELİ - sadece text seçiliyken */}
        {activeOverlay && activePage.overlays.find((o) => o.id === activeOverlay) && (
          <>
            {/* Tablo paneli */}
            {inlineEditingId === activeOverlay && currentEditor?.isActive?.("table") ? (
              <TablePropertiesPanel
                overlayId={activeOverlay}
                overlayHtml={activePage.overlays.find((o) => o.id === activeOverlay)?.html || ""}
                editor={currentEditor}
                onChange={(newHtml) => handleOverlayChange(activeOverlay, { html: newHtml })}
                onClose={() => {
                  setActiveOverlay(null);
                }}
              />
            ) : (
              /* Metin paneli */
              <TextPropertiesPanel
                overlayId={activeOverlay}
                overlayHtml={activePage.overlays.find((o) => o.id === activeOverlay)?.html || ""}
                onChange={(newHtml) => handleOverlayChange(activeOverlay, { html: newHtml })}
                onApplyColor={(text, color) => {
                  const currentHtml = activePage.overlays.find((o) => o.id === activeOverlay)?.html || "";
                  const newHtml = currentHtml.replace(
                    text,
                    `<span style="color: ${color}">${text}</span>`
                  );
                  handleOverlayChange(activeOverlay, { html: newHtml });
                }}
                onClose={() => {
                  setActiveOverlay(null);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* SAĞ TIK MENÜ */}
      {contextMenu.visible && (
        <div
          className="fixed bg-white border shadow-lg rounded text-sm z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full text-left px-3 py-1 hover:bg-gray-100"
            onClick={() => {
              if (!contextMenu.targetId) return;
              setActiveOverlay(contextMenu.targetId);
              setInlineEditingId(contextMenu.targetId); // sağ tık → düzenle
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
          >
            Düzenle
          </button>

          <button
            className="block w-full text-left px-3 py-1 hover:bg-gray-100"
            onClick={bringToFront}
          >
            Öne Getir
          </button>

          <button
            className="block w-full text-left px-3 py-1 hover:bg-gray-100"
            onClick={sendToBack}
          >
            Arkaya Gönder
          </button>

          <hr className="my-1" />

          <button
            className="block w-full text-left px-3 py-1 hover:bg-blue-50 text-blue-600"
            onClick={copyStyle}
          >
            📋 Stili Kopyala
          </button>

          <button
            className="block w-full text-left px-3 py-1 hover:bg-blue-50 text-blue-600"
            onClick={pasteStyle}
            disabled={!clipboard.style}
            title={!clipboard.style ? "Stili kopya etmek için ilk önce 'Stili Kopyala' yapınız" : ""}
          >
            📝 Stili Yapıştır
          </button>

          <button
            className="block w-full text-left px-3 py-1 hover:bg-green-50 text-green-600"
            onClick={copyFormat}
          >
            📏 Biçimi Kopyala
          </button>

          <button
            className="block w-full text-left px-3 py-1 hover:bg-green-50 text-green-600"
            onClick={pasteFormat}
            disabled={!clipboard.format}
            title={!clipboard.format ? "Biçimi kopya etmek için ilk önce 'Biçimi Kopyala' yapınız" : ""}
          >
            🔧 Biçimi Yapıştır
          </button>

          <hr className="my-1" />

          <button
            className="block w-full text-left px-3 py-1 hover:bg-purple-50 text-purple-600"
            onClick={addImageToSelectedArea}
          >
            🖼️ Görsel Ekle
          </button>

          <hr className="my-1" />

          <button
            className="block w-full text-left px-3 py-1 hover:bg-red-50 text-red-600"
            onClick={deleteOverlay}
          >
            Sil
          </button> 
        </div>
      )}

      {/* MAKALE AYARLARI PANELI */}
      <ArticleSettingsPanel
        settings={articleSettings}
        onSettingsChange={handleArticleSettingsChange}
      />

      {/* MATEMATİK EDITÖR MODALİ */}
      {showEquationEditor && (
        <EquationEditorModal
          onClose={() => setShowEquationEditor(false)}
          onInsert={handleInsertEquation}
        />
      )}

      {/* MATEMATİK SEMBOL PANELİ */}
      {showMathSymbolPanel && (
        <MathSymbolPanel
          onInsert={handleInsertSymbol}
          onClose={() => setShowMathSymbolPanel(false)}
        />
      )}

      {/* DENKLEM ŞABLONLARI PANELİ */}
      {showEquationTemplatesPanel && (
        <EquationTemplatesPanel
          onInsert={(latex) => handleInsertEquation(latex, "block")}
          onClose={() => setShowEquationTemplatesPanel(false)}
        />
      )}
    </div>
  );
}
