// src/pages/EditorPage.jsx
import { useState, useRef,useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2pdf from "html2pdf.js";
import { useEditor } from "@tiptap/react";
import katex from "katex";

import MainToolbar from "../components/Toolbar/MainToolbar";
import PagesPanel from "../components/Editor/PagesPanel";
import PageCanvas from "../components/Editor/PageCanvas";
import DocumentEditor from "../components/Editor/DocumentEditor";
import DocumentToolbar from "../components/Editor/DocumentToolbar";
import TextPropertiesPanel from "../components/Panels/TextPropertiesPanel";
import TablePropertiesPanel from "../components/Panels/TablePropertiesPanel";
import ArticleSettingsPanel from "../components/Panels/ArticleSettingsPanel";
import EquationEditorModal from "../components/Modals/EquationEditorModal";
import TableInputModal from "../components/Modals/TableInputModal";
import MathSymbolPanel from "../components/Panels/MathSymbolPanel";
import EquationTemplatesPanel from "../components/Panels/EquationTemplatesPanel";
import TableOverlay from "../overlays/TableOverlay";
import { defaultCoverPage, defaultArticleSettings } from "../types/article";

export default function EditorPage() {
  const [articleSettings, setArticleSettings] = useState(defaultArticleSettings);
  
  const [pages, setPages] = useState([
    defaultCoverPage(1, "free"),
  ]);

  const [activePageId, setActivePageId] = useState(1);
  const [activeOverlay, setActiveOverlay] = useState(null);

  // Hangi overlay inline edit modunda?
  const [inlineEditingId, setInlineEditingId] = useState(null);

  // Temiz görünüm modu (grid/kontroller gizli)
  const [cleanView, setCleanView] = useState(false);

  // Serbest mod kontrol ayarları
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [zoom, setZoom] = useState(100);

  // Editor instance (tablo/metin özellikleri için)
  const [currentEditor, setCurrentEditor] = useState(null);
  const savedEditorRef = useRef(null);

  // Debug currentEditor değişikliklerini gör
  useEffect(() => {
    console.log('🔧 EditorPage: currentEditor değişti:', currentEditor ? 'Editor var ✓' : 'Editor yok ✗');
    console.log('🔧 EditorPage: activePage mode:', activePage?.mode);
    console.log('🔧 EditorPage: activeOverlay:', activeOverlay);
  }, [currentEditor]);

  // Matematik panelleri ve modal state'leri
  const [showEquationEditor, setShowEquationEditor] = useState(false);
  const [showMathSymbolPanel, setShowMathSymbolPanel] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showEquationTemplatesPanel, setShowEquationTemplatesPanel] = useState(false);
  
  // Aktif tablo ve hücre takibi
  const [activeTable, setActiveTable] = useState(null);
  const [activeTableCell, setActiveTableCell] = useState(null); // {tableId, row, col}

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
    targetType: null, // 'text', 'image', 'table'
    selectedCells: [], // Tablo için seçili hücreler
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

  const handleTableChange = (id, partial) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) =>
                table.id === id ? { ...table, ...partial } : table
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
    const activePage = pages.find((p) => p.id === activePageId);
    
    // Document mode'da editöre focus ver, free mode'da text box oluştur
    if (activePage?.mode === "document") {
      currentEditor?.commands.focus();
      return;
    }

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
    setShowTableModal(true);
  };

  const handleInsertTable = (rows, cols) => {
    const activePage = pages.find((p) => p.id === activePageId);
    
    // Document mode'da direkt editöre tablo ekle
    if (activePage?.mode === "document" && currentEditor) {
      currentEditor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();
      setShowTableModal(false);
      return;
    }

    if (!activePage) {
      setShowTableModal(false);
      return;
    }

    // Serbest modda TableOverlay kullan
    const id = crypto.randomUUID();
    const newTable = {
      id,
      x: 100,
      y: 100,
      width: Math.min(500, cols * 120),
      height: Math.min(300, rows * 40 + 40),
      rows,
      cols,
      data: [],
      headerRow: true,
    };

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: [...(p.tables || []), newTable],
            }
          : p
      )
    );

    setShowTableModal(false);
    
    // Yeni tabloyu seç
    setTimeout(() => {
      setActiveOverlay(id);
    }, 50);
  };

  const addPage = (mode = "free") => {
    const newPageMode = mode;

    setPages((prev) => {
      const newId = prev.length ? prev[prev.length - 1].id + 1 : 1;
      
      // Eğer belge modu ise minimal sayfa
      if (newPageMode === "document") {
        return [
          ...prev,
          {
            id: newId,
            title: `Sayfa ${newId}`,
            type: "content",
            mode: "document",
            overlays: [],
            images: [],
            tables: [],
            documentContent: "",
            pageSettings: {
              marginTop: articleSettings.pageMarginTop,
              marginBottom: articleSettings.pageMarginBottom,
              marginLeft: articleSettings.pageMarginLeft,
              marginRight: articleSettings.pageMarginRight,
            },
          },
        ];
      }
      
      // Serbest mod - text box ile
      return [
        ...prev,
        {
          id: newId,
          title: `Sayfa ${newId}`,
          type: "content",
          mode: "free",
          overlays: [
            {
              id: crypto.randomUUID(),
              type: "text",
              html: "<p>İçerik burada başlayacak...</p>",
              x: articleSettings.pageMarginLeft,
              y: articleSettings.pageMarginTop,
              width: 793.9 - (articleSettings.pageMarginLeft + articleSettings.pageMarginRight),
              height: 200,
              fontSize: articleSettings.bodyFontSize,
              color: articleSettings.bodyColor,
              lineHeight: articleSettings.bodyLineHeight,
              textIndent: articleSettings.paragraphIndent,
              titleFontSize: articleSettings.titleFontSize,
              titleColor: articleSettings.titleColor,
            },
          ],
          images: [],
          tables: [],
          documentContent: "",
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

    const activePage = pages.find((p) => p.id === activePageId);
    
    // Document mode - editöre ekle
    if (activePage?.mode === "document" && currentEditor) {
      try {
        currentEditor.commands.insertContent(equationHTML);
        setShowEquationEditor(false);
        return;
      } catch (error) {
        console.error('Document editor hatası:', error);
      }
    }
    
    // Serbest mod + Tablo hücresi aktif - hücreye ekle
    if (activeTableCell && activePage) {
      const table = activePage.tables?.find((t) => t.id === activeTableCell.tableId);
      if (table) {
        const newData = [...(table.data || [])];
        const currentContent = newData[activeTableCell.row]?.[activeTableCell.col] || '';
        newData[activeTableCell.row][activeTableCell.col] = currentContent + ' ' + equationHTML;
        handleTableChange(activeTableCell.tableId, { data: newData });
        setShowEquationEditor(false);
        return;
      }
    }
    
    // Serbest mod + TextPropertiesPanel açık - overlay HTML'ine ekle
    if (activeOverlay && activePage) {
      const overlay = activePage.overlays.find((o) => o.id === activeOverlay);
      if (overlay) {
        const currentHtml = overlay.html || "";
        const newHtml = currentHtml + equationHTML;
        handleOverlayChange(activeOverlay, { html: newHtml });
        setShowEquationEditor(false);
        return;
      }
    }
    
    // Hiçbiri değilse - Yeni text box oluştur
    if (!activePage) return;

    const newOverlay = {
      id: crypto.randomUUID(),
      type: "text",
      html: equationHTML,
      x: 100,
      y: 100,
      width: mode === "block" ? 400 : 250,
      height: mode === "block" ? 100 : 60,
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

    const activePage = pages.find((p) => p.id === activePageId);
    
    // Document mode - editöre ekle
    if (activePage?.mode === "document" && currentEditor) {
      try {
        currentEditor.commands.insertContent(symbolHTML);
        setShowMathSymbolPanel(false);
        return;
      } catch (error) {
        console.error('Document editor hatası:', error);
      }
    }
    
    // Serbest mod + Tablo hücresi aktif - hücreye ekle
    if (activeTableCell && activePage) {
      const table = activePage.tables?.find((t) => t.id === activeTableCell.tableId);
      if (table) {
        const newData = [...(table.data || [])];
        const currentContent = newData[activeTableCell.row]?.[activeTableCell.col] || '';
        newData[activeTableCell.row][activeTableCell.col] = currentContent + ' ' + symbolHTML;
        handleTableChange(activeTableCell.tableId, { data: newData });
        setShowMathSymbolPanel(false);
        return;
      }
    }
    
    // Serbest mod + TextPropertiesPanel açık - overlay HTML'ine ekle
    if (activeOverlay && activePage) {
      const overlay = activePage.overlays.find((o) => o.id === activeOverlay);
      if (overlay) {
        const currentHtml = overlay.html || "";
        const newHtml = currentHtml + symbolHTML;
        handleOverlayChange(activeOverlay, { html: newHtml });
        setShowMathSymbolPanel(false);
        return;
      }
    }
    
    // Hiçbiri değilse - Yeni text box oluştur
    if (!activePage) return;

    const newOverlay = {
      id: crypto.randomUUID(),
      type: "text",
      html: symbolHTML,
      x: 100,
      y: 100,
      width: 200,
      height: 50,
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
  };

  // ---------------------------
  //  PNG EXPORT - Aktif sayfayı temiz modda export et
  // ---------------------------
  const exportPNG = async () => {
    // Temiz mod aç
    const wasCleanView = cleanView;
    if (!wasCleanView) setCleanView(true);
    
    // DOM'un güncellenmesi için bekle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Tüm sayfa containerlarını bul
      const pageElements = document.querySelectorAll('[id^="page-"]');
      
      if (pageElements.length === 0) {
        alert("Export edilecek sayfa bulunamadı!");
        return;
      }

      // Aktif sayfayı bul
      const activePageElement = document.getElementById(`page-${activePageId}`);
      if (!activePageElement) {
        alert("Aktif sayfa bulunamadı!");
        return;
      }

      const canvas = await html2canvas(activePageElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
      });

      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `sayfa-${activePageId}.png`;
      link.click();
    } catch (error) {
      console.error("PNG export hatası:", error);
      alert("Export sırasında hata oluştu!");
    } finally {
      // Temiz modu eski haline döndür
      if (!wasCleanView) setCleanView(false);
    }
  };

  // ---------------------------
  //  PDF EXPORT - Gerçek PDF oluştur (vektörel, düzenlenebilir)
  // ---------------------------
  const exportPDF = async () => {
    console.log("🔴 PROFESYONEL PDF EXPORT BAŞLIYOR");
    
    // Temiz görünüm modunu aç
    const wasCleanView = cleanView;
    if (!wasCleanView) setCleanView(true);
    
    // DOM güncellemesi için bekle
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 595.28;  // A4 genişlik pt cinsinden
      const pdfHeight = 841.89; // A4 yükseklik pt cinsinden
      
      // Editördeki sayfa boyutları (px)
      const pageWidth = 794;
      const pageHeight = 1123;

      console.log(`📄 ${pages.length} sayfa işlenecek`);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const pageElement = document.getElementById(`page-${page.id}`);
        
        if (!pageElement) {
          console.warn(`Sayfa ${page.id} bulunamadı`);
          continue;
        }

        console.log(`   Sayfa ${i + 1}/${pages.length} render ediliyor...`);

        // Sayfayı klonla
        const clonedPage = pageElement.cloneNode(true);
        
        // Gereksiz elementleri temizle
        const selectorsToRemove = [
          '.resize-handle',
          '.delete-btn', 
          '.edit-btn',
          '.drag-handle',
          'button',
          '[class*="control"]',
          '[class*="handle"]',
          '.grid-overlay',
          '.ruler',
          '[data-control]'
        ];
        
        selectorsToRemove.forEach(selector => {
          clonedPage.querySelectorAll(selector).forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
          });
        });

        // Sayfa stillerini KORUMA - orijinal boyutları kullan
        clonedPage.style.width = `${pageWidth}px`;
        clonedPage.style.height = `${pageHeight}px`;
        clonedPage.style.backgroundColor = '#ffffff';
        clonedPage.style.position = 'relative';
        clonedPage.style.overflow = 'hidden';

        // Tabloları düzelt
        clonedPage.querySelectorAll('table').forEach(table => {
          table.style.borderCollapse = 'collapse';
          table.querySelectorAll('td, th').forEach(cell => {
            cell.style.border = '1px solid #666';
            cell.style.padding = '8px';
          });
        });

        // Geçici container'a ekle
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.appendChild(clonedPage);
        document.body.appendChild(tempContainer);

        try {
          // Canvas'a çevir - yüksek kalite ayarları
          const canvas = await html2canvas(clonedPage, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            width: pageWidth,
            height: pageHeight,
            windowWidth: pageWidth,
            windowHeight: pageHeight,
            scrollX: 0,
            scrollY: 0,
            imageTimeout: 0,
            removeContainer: false
          });

          // Canvas'ı görüntüye çevir - JPEG yüksek kalite
          const imgData = canvas.toDataURL('image/jpeg', 0.95);

          // İlk sayfa değilse yeni sayfa ekle
          if (i > 0) {
            pdf.addPage('a4', 'portrait');
          }

          // Görüntüyü PDF'e ekle - A4 boyutuna sığdır
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

          console.log(`   ✓ Sayfa ${i + 1} tamamlandı`);

        } finally {
          // Geçici container'ı temizle
          document.body.removeChild(tempContainer);
        }
      }

      // PDF'i kaydet
      pdf.save(`makale-${pages.length}-sayfa.pdf`);
      console.log("✅ PDF başarıyla oluşturuldu!");

    } catch (error) {
      console.error("❌ PDF export hatası:", error);
      alert("PDF export sırasında hata oluştu: " + error.message);
    } finally {
      // Temiz görünümü eski haline döndür
      if (!wasCleanView) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setCleanView(false);
      }
    }
  };

  // ---------------------------
  //  RESİM EKLE
  // ---------------------------
  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (f) {
        const data = f.target.result;

        // Document mode - Editöre inline görsel ekle
        if (editorMode === "document" && currentEditor) {
          currentEditor.chain().focus().setImage({ src: data }).run();
          return;
        }

        // Free mode - Overlay olarak ekle
        if (!activePage) return;

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

        setContextMenu({ visible: false, x: 0, y: 0, targetId: null, targetType: null });
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
  const handleRightClick = (id, pos, type = 'text', selectedCells = []) => {
    setContextMenu({
      visible: true,
      x: pos.x,
      y: pos.y,
      targetId: id,
      targetType: type,
      selectedCells: selectedCells,
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
              tables: (p.tables || []).filter((table) => table.id !== id),
            }
          : p
      )
    );

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null, targetType: null });
    if (activeOverlay === id) setActiveOverlay(null);
    if (inlineEditingId === id) setInlineEditingId(null);
  };

  // ===== TABLO İŞLEMLERİ =====
  const addTableRowBefore = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  const newRows = table.rows + 1;
                  const newData = [...(table.data || [])];
                  // Başa yeni satır ekle (boş hücrelerle)
                  newData.unshift(Array(table.cols).fill(''));
                  return { ...table, rows: newRows, data: newData };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const addTableRow = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  const newRows = table.rows + 1;
                  const newData = [...(table.data || [])];
                  // Yeni satır ekle (boş hücrelerle)
                  newData.push(Array(table.cols).fill(''));
                  return { ...table, rows: newRows, data: newData };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const addTableColumnBefore = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  const newCols = table.cols + 1;
                  const newData = (table.data || []).map(row => ['', ...row]);
                  return { ...table, cols: newCols, data: newData };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const addTableColumn = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  const newCols = table.cols + 1;
                  const newData = (table.data || []).map(row => [...row, '']);
                  return { ...table, cols: newCols, data: newData };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const deleteTableRow = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id && table.rows > 1) {
                  const newRows = table.rows - 1;
                  const newData = [...(table.data || [])];
                  newData.pop(); // Son satırı sil
                  return { ...table, rows: newRows, data: newData };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const deleteTableColumn = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id && table.cols > 1) {
                  const newCols = table.cols - 1;
                  const newData = (table.data || []).map(row => row.slice(0, -1));
                  return { ...table, cols: newCols, data: newData };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const toggleTableHeaderRow = () => {
    const id = contextMenu.targetId;
    if (!id) return;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  return { ...table, headerRow: !table.headerRow };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const changeTableCellColor = (color, isBackground = true) => {
    const id = contextMenu.targetId;
    const selectedCells = contextMenu.selectedCells || [];
    
    console.log('changeTableCellColor çağrıldı:', { id, selectedCells, color, isBackground });
    
    if (!id || selectedCells.length === 0) {
      alert("Lütfen renklendirmek istediğiniz hücreleri seçin (Ctrl + tıklama ile).");
      setContextMenu((prev) => ({ ...prev, visible: false }));
      return;
    }

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  const newCellStyles = { ...(table.cellStyles || {}) };
                  
                  selectedCells.forEach(cell => {
                    const key = `${cell.row}-${cell.col}`;
                    // Her hücre stilini tamamen yeni bir obje olarak oluştur
                    newCellStyles[key] = { ...(newCellStyles[key] || {}) };
                    
                    if (isBackground) {
                      newCellStyles[key].backgroundColor = color;
                      console.log(`Hücre ${key} arka plan rengi ${color} olarak ayarlandı`);
                    } else {
                      newCellStyles[key].color = color;
                      console.log(`Hücre ${key} yazı rengi ${color} olarak ayarlandı`);
                    }
                  });
                  
                  console.log('Yeni cellStyles:', newCellStyles);
                  return { ...table, cellStyles: newCellStyles };
                }
                return table;
              }),
            }
          : p
      )
    );

    // Menüyü hemen kapatma, kullanıcı birden fazla renk seçebilsin
    // setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const mergeTableCells = () => {
    const id = contextMenu.targetId;
    const selectedCells = contextMenu.selectedCells || [];
    
    if (!id || selectedCells.length < 2) {
      alert("Lütfen birleştirmek istediğiniz en az 2 hücreyi seçin (Ctrl + tıklama ile).");
      setContextMenu((prev) => ({ ...prev, visible: false }));
      return;
    }

    // Find min/max row and col to determine merge area
    const rows = selectedCells.map(c => c.row);
    const cols = selectedCells.map(c => c.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const rowspan = maxRow - minRow + 1;
    const colspan = maxCol - minCol + 1;

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  const newMergedCells = { ...(table.mergedCells || {}) };
                  const cellKey = `${minRow}-${minCol}`;
                  
                  // Remove any existing merges for selected cells
                  selectedCells.forEach(cell => {
                    const key = `${cell.row}-${cell.col}`;
                    delete newMergedCells[key];
                  });
                  
                  // Add new merge
                  newMergedCells[cellKey] = { colspan, rowspan };
                  
                  return { ...table, mergedCells: newMergedCells };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const splitTableCell = () => {
    const id = contextMenu.targetId;
    const selectedCells = contextMenu.selectedCells || [];
    
    if (!id || selectedCells.length === 0) {
      alert("Lütfen bölmek istediğiniz birleştirilmiş hücreyi seçin.");
      setContextMenu((prev) => ({ ...prev, visible: false }));
      return;
    }

    setPages((prev) =>
      prev.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              tables: (p.tables || []).map((table) => {
                if (table.id === id) {
                  const newMergedCells = { ...(table.mergedCells || {}) };
                  
                  // Remove merge for selected cells
                  selectedCells.forEach(cell => {
                    const key = `${cell.row}-${cell.col}`;
                    delete newMergedCells[key];
                  });
                  
                  return { ...table, mergedCells: newMergedCells };
                }
                return table;
              }),
            }
          : p
      )
    );

    setContextMenu((prev) => ({ ...prev, visible: false }));
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

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null, targetType: null });
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

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null, targetType: null });
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

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null, targetType: null });
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

    setContextMenu({ visible: false, x: 0, y: 0, targetId: null, targetType: null });
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
        cleanView={cleanView}
        onToggleCleanView={() => setCleanView(!cleanView)}
      />

      <div className="flex flex-row grow">
        {/* SOL SAYFA PANELİ - Temiz görünüm dışında göster */}
        {!cleanView && (
          <PagesPanel
          pages={pages}
          activePageId={activePageId}
          onSelectPage={(id) => {
            setActivePageId(id);
            setActiveOverlay(null);
            setInlineEditingId(null);
            setContextMenu((prev) => ({ ...prev, visible: false }));
          }}
          onAddPage={addPage}
          onChangePageMode={(pageId, newMode) => {
            setPages((prev) =>
              prev.map((p) =>
                p.id === pageId
                  ? { ...p, mode: newMode }
                  : p
              )
            );
          }}
        />
        )}

        {/* TÜM SAYFALAR - Scroll ile görünür */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          {/* Sticky Toolbar - Belge Modu Kontrolleri */}
          {!cleanView && activePage?.mode === "document" && currentEditor && (
            <div className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-lg w-full">
              <DocumentToolbar 
                editor={currentEditor}
                onOpenEquationEditor={handleOpenEquationEditor}
                onOpenMathSymbolPanel={handleOpenMathSymbolPanel}
              />
            </div>
          )}

          {/* Sticky Toolbar - Serbest Mod Kontrolleri */}
          {!cleanView && activePage?.mode === "free" && currentEditor && (
            <div className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-lg w-full">
              <DocumentToolbar 
                editor={currentEditor}
                onOpenEquationEditor={handleOpenEquationEditor}
                onOpenMathSymbolPanel={handleOpenMathSymbolPanel}
              />
            </div>
          )}

          {/* Eski Custom Toolbar - Yedek */}
          {!cleanView && activePage?.mode === "free" && false && (
            <div className="sticky top-0 z-[100] bg-white border-b border-gray-200 shadow-lg w-full">
              <div className="flex items-center justify-between px-6 py-2 gap-4">
                {/* Sol Grup - Format Kontrolleri */}
                <div className="flex items-center gap-1 flex-wrap">
                  {/* Başlık Seçimi */}
                  <div className="flex items-center gap-1">
                    <select
                      onMouseDown={(e) => e.preventDefault()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!currentEditor) return;
                        if (value === "p") {
                          currentEditor.chain().focus().setParagraph().run();
                        } else if (value === "h1") {
                          currentEditor.chain().focus().toggleHeading({ level: 1 }).run();
                        } else if (value === "h2") {
                          currentEditor.chain().focus().toggleHeading({ level: 2 }).run();
                        } else if (value === "h3") {
                          currentEditor.chain().focus().toggleHeading({ level: 3 }).run();
                        }
                      }}
                      value={
                        currentEditor?.isActive("heading", { level: 1 })
                          ? "h1"
                          : currentEditor?.isActive("heading", { level: 2 })
                          ? "h2"
                          : currentEditor?.isActive("heading", { level: 3 })
                          ? "h3"
                          : "p"
                      }
                      disabled={!currentEditor || !activeOverlay}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Metin Stili"
                    >
                      <option value="p">Normal</option>
                      <option value="h1">Başlık 1</option>
                      <option value="h2">Başlık 2</option>
                      <option value="h3">Başlık 3</option>
                    </select>
                  </div>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Text Formatting */}
                  <div className="flex items-center gap-1">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => currentEditor?.chain().focus().toggleBold().run()}
                      disabled={!currentEditor || !activeOverlay}
                      className={`p-1.5 rounded transition-all ${!currentEditor || !activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'} ${currentEditor?.isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Kalın (Ctrl+B)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                      </svg>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => currentEditor?.chain().focus().toggleItalic().run()}
                      disabled={!currentEditor || !activeOverlay}
                      className={`p-1.5 rounded transition-all ${!currentEditor || !activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'} ${currentEditor?.isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="İtalik (Ctrl+I)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="4" x2="10" y2="4"></line>
                        <line x1="14" y1="20" x2="5" y2="20"></line>
                        <line x1="15" y1="4" x2="9" y2="20"></line>
                      </svg>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => currentEditor?.chain().focus().toggleUnderline().run()}
                      disabled={!currentEditor || !activeOverlay}
                      className={`p-1.5 rounded transition-all ${!currentEditor || !activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'} ${currentEditor?.isActive('underline') ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Altı Çizili (Ctrl+U)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                        <line x1="4" y1="21" x2="20" y2="21"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Text Align */}
                  <div className="flex items-center gap-1">
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => currentEditor?.chain().focus().setTextAlign('left').run()}
                      disabled={!currentEditor || !activeOverlay}
                      className={`p-1.5 rounded transition-all ${!currentEditor || !activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'} ${currentEditor?.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Sola Hizala"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="17" y1="10" x2="3" y2="10"></line>
                        <line x1="21" y1="6" x2="3" y2="6"></line>
                        <line x1="21" y1="14" x2="3" y2="14"></line>
                        <line x1="17" y1="18" x2="3" y2="18"></line>
                      </svg>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => currentEditor?.chain().focus().setTextAlign('center').run()}
                      disabled={!currentEditor || !activeOverlay}
                      className={`p-1.5 rounded transition-all ${!currentEditor || !activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'} ${currentEditor?.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Ortala"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="10" x2="6" y2="10"></line>
                        <line x1="21" y1="6" x2="3" y2="6"></line>
                        <line x1="21" y1="14" x2="3" y2="14"></line>
                        <line x1="18" y1="18" x2="6" y2="18"></line>
                      </svg>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => currentEditor?.chain().focus().setTextAlign('right').run()}
                      disabled={!currentEditor || !activeOverlay}
                      className={`p-1.5 rounded transition-all ${!currentEditor || !activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'} ${currentEditor?.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : ''}`}
                      title="Sağa Hizala"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="21" y1="10" x2="7" y2="10"></line>
                        <line x1="21" y1="6" x2="3" y2="6"></line>
                        <line x1="21" y1="14" x2="3" y2="14"></line>
                        <line x1="21" y1="18" x2="7" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Font Size & Color */}
                  <div className="flex items-center gap-1">
                    <select
                      onMouseDown={(e) => e.preventDefault()}
                      value={currentEditor?.getAttributes('textStyle').fontSize || '16px'}
                      onChange={(e) => currentEditor?.chain().focus().setFontSize(e.target.value).run()}
                      disabled={!currentEditor || !activeOverlay}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Yazı Boyutu"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                      <option value="28px">28px</option>
                      <option value="32px">32px</option>
                    </select>

                    <input
                      type="color"
                      onMouseDown={(e) => e.preventDefault()}
                      value={currentEditor?.getAttributes('textStyle').color || '#000000'}
                      onChange={(e) => currentEditor?.chain().focus().setColor(e.target.value).run()}
                      disabled={!currentEditor || !activeOverlay}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Yazı Rengi"
                    />
                    
                    <input
                      type="color"
                      onMouseDown={(e) => e.preventDefault()}
                      onChange={(e) => currentEditor?.chain().focus().setHighlight({ color: e.target.value }).run()}
                      disabled={!currentEditor || !activeOverlay}
                      defaultValue="#FFFF00"
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Vurgu Rengi"
                    />
                    
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => currentEditor?.chain().focus().toggleHighlight().run()}
                      disabled={!currentEditor || !activeOverlay}
                      className={`px-2 py-1.5 rounded text-xs transition-all ${!currentEditor || !activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'} ${currentEditor?.isActive('highlight') ? 'bg-yellow-100 text-yellow-700' : ''}`}
                      title="Vurgula"
                    >
                      🖍 Vurgu
                    </button>
                  </div>

                  <div className="w-px h-6 bg-gray-300"></div>

                  {/* Math */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleOpenEquationEditor}
                      disabled={!activeOverlay}
                      className={`p-1.5 rounded transition-all ${!activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-purple-50'} text-purple-600`}
                      title="Denklem Ekle"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleOpenMathSymbolPanel}
                      disabled={!activeOverlay}
                      className={`p-1.5 rounded transition-all ${!activeOverlay ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-50'} text-indigo-600`}
                      title="Sembol Ekle"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                        <path d="M2 2l7.586 7.586"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Sağ Grup - Grid/Snap/Zoom Kontrolleri */}
                <div className="flex items-center gap-2">
                {/* Grid Toggle */}
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    showGrid
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                  title="Grid göster/gizle"
                >
                  ⌘ Grid
                </button>

                {/* Snap Toggle */}
                <button
                  onClick={() => setSnapEnabled(!snapEnabled)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    snapEnabled
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                  title="Grid'e yapışmayı aç/kapat"
                >
                  🧲 Snap
                </button>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Grid Size */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">Grid:</span>
                  <select
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value={5}>5px</option>
                    <option value={10}>10px</option>
                    <option value={20}>20px</option>
                    <option value={25}>25px</option>
                    <option value={50}>50px</option>
                  </select>
                </div>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Zoom */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 text-gray-600 text-sm font-bold"
                    title="Zoom out"
                  >
                    −
                  </button>
                  <span className="text-xs text-gray-600 font-medium w-12 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-100 text-gray-600 text-sm font-bold"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoom(100)}
                    className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100 text-gray-600 font-medium"
                    title="Reset zoom"
                  >
                    Reset
                  </button>
                </div>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Guides Toggle */}
                <button
                  onClick={() => setShowGuides(!showGuides)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    showGuides
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                  title="Kılavuz çizgileri göster/gizle"
                >
                  📏 Rehber
                </button>

                <div className="w-px h-6 bg-gray-300"></div>

                {/* Info */}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold">Sayfa:</span>
                    <span>{activePageId}</span>
                  </div>
                  {activeOverlay && (
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <span className="font-semibold">Seçili:</span>
                      <span>#{activeOverlay.substring(0, 8)}</span>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-8 flex flex-col gap-8 items-center">
            {pages.map((page) => (
              <div
                key={page.id}
                id={`page-${page.id}`}
                className={`relative transition-all ${
                  !cleanView && page.id === activePageId
                    ? "ring-4 ring-blue-400 ring-offset-4"
                    : !cleanView && "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                }`}
                onClick={() => {
                  if (!cleanView && page.id !== activePageId) {
                    setActivePageId(page.id);
                    setActiveOverlay(null);
                    setInlineEditingId(null);
                  }
                }}
                style={{
                  cursor: !cleanView && page.id !== activePageId ? "pointer" : "default",
                }}
              >
                {/* Sayfa Numarası Etiketi (sadece edit modda) */}
                {!cleanView && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-200 text-xs font-semibold text-gray-700 z-50">
                    Sayfa {page.id} • {page.mode === "document" ? "Belge" : "Serbest"}
                  </div>
                )}

                {/* Serbest Mod Canvas */}
                {page.mode === "free" && (
                  <PageCanvas
                    overlays={page.overlays}
                    images={page.images}
                    tables={page.tables || []}
                    pageSettings={page.pageSettings}
                    activeOverlay={page.id === activePageId ? activeOverlay : null}
                    setActiveOverlay={page.id === activePageId ? setActiveOverlay : () => {}}
                    activePageId={page.id}
                    onOverlayChange={handleOverlayChange}
                    onImageChange={handleImageChange}
                    onTableChange={handleTableChange}
                    onRightClick={handleRightClick}
                    onCellEdit={(tableId, row, col) => {
                      if (page.id === activePageId) {
                        setActiveTableCell({ tableId, row, col });
                        setActiveTable(tableId);
                      }
                    }}
                    inlineEditingId={page.id === activePageId ? inlineEditingId : null}
                    setInlineEditingId={page.id === activePageId ? setInlineEditingId : () => {}}
                    onEditorCreate={page.id === activePageId ? setCurrentEditor : () => {}}
                    onOpenEquationEditor={handleOpenEquationEditor}
                    onOpenMathSymbolPanel={handleOpenMathSymbolPanel}
                    presentationMode={page.id !== activePageId || cleanView}
                    showGrid={showGrid}
                    showGuides={showGuides}
                    gridSize={gridSize}
                    snapEnabled={snapEnabled}
                    zoom={zoom}
                  />
                )}

                {/* Belge Modu Editör */}
                {page.mode === "document" && (
                  <div className="bg-white shadow-2xl" style={{ width: 794, height: 1123, overflow: "hidden" }}>
                    {page.id === activePageId ? (
                      <DocumentEditor
                        content={page.documentContent || ""}
                        onChange={(newContent) => {
                          setPages((prev) =>
                            prev.map((p) =>
                              p.id === page.id
                                ? { ...p, documentContent: newContent }
                                : p
                            )
                          );
                        }}
                        onEditorReady={setCurrentEditor}
                        articleSettings={articleSettings}
                        onOpenEquationEditor={handleOpenEquationEditor}
                        onOpenMathSymbolPanel={handleOpenMathSymbolPanel}
                      />
                    ) : (
                      <div 
                        className="w-full h-full p-16 overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: page.documentContent || "<p>Boş sayfa</p>" }}
                        style={{
                          fontSize: `${articleSettings.bodyFontSize}px`,
                          lineHeight: articleSettings.bodyLineHeight,
                          color: articleSettings.bodyColor,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ MAKALE AYARLARI PANELİ - Her zaman göster (temiz görünüm hariç) */}
        {!cleanView && (
          <ArticleSettingsPanel
            settings={articleSettings}
            onSettingsChange={handleArticleSettingsChange}
          />
        )}
      </div>

      {/* SAĞ TIK MENÜ - Temiz görünümde gizli */}
      {!cleanView && contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 10000,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '4px',
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.targetType === 'table' ? (
            // TABLO İÇİN ÖZEL MENÜ
            <>
              <button
                onClick={addTableRowBefore}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>⬆️</span>
                <span>Üste Satır Ekle</span>
              </button>

              <button
                onClick={addTableRow}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>⬇️</span>
                <span>Alta Satır Ekle</span>
              </button>

              <button
                onClick={deleteTableRow}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#dc2626',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🗑️</span>
                <span>Satır Sil</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

              <button
                onClick={addTableColumnBefore}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>⬅️</span>
                <span>Sola Sütun Ekle</span>
              </button>

              <button
                onClick={addTableColumn}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>➡️</span>
                <span>Sağa Sütun Ekle</span>
              </button>

              <button
                onClick={deleteTableColumn}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#dc2626',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🗑️</span>
                <span>Sütun Sil</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

              <button
                onClick={mergeTableCells}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#059669',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#d1fae5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🔗</span>
                <span>Hücreleri Birleştir</span>
              </button>

              <button
                onClick={splitTableCell}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#059669',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#d1fae5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>✂️</span>
                <span>Hücreyi Böl</span>
              </button>

              <button
                onClick={toggleTableHeaderRow}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#059669',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#d1fae5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>📋</span>
                <span>Başlık Satırını Aç/Kapat</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

              <div style={{ padding: '8px 12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Hücre Arka Plan Rengi</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {['#ffffff', '#f3f4f6', '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#fce7f3'].map(color => (
                    <button
                      key={color}
                      onClick={() => changeTableCellColor(color, true)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: color,
                        cursor: 'pointer',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div style={{ padding: '0 12px 8px 12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Yazı Rengi</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {['#000000', '#374151', '#dc2626', '#ea580c', '#059669', '#2563eb', '#7c3aed', '#db2777'].map(color => (
                    <button
                      key={color}
                      onClick={() => changeTableCellColor(color, false)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: color,
                        cursor: 'pointer',
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                  handleOpenEquationEditor();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#7c3aed',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3e8ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>∑</span>
                <span>Denklem Ekle</span>
              </button>

              <button
                onClick={() => {
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                  handleOpenMathSymbolPanel();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#7c3aed',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3e8ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>π</span>
                <span>Sembol Ekle</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

              <button
                onClick={deleteOverlay}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#dc2626',
                  fontWeight: '600',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🗑️</span>
                <span>Tabloyu Sil</span>
              </button>
            </>
          ) : (
            // NORMAL OVERLAY MENÜ (TEXT/IMAGE)
            <>
              <button
                onClick={() => {
                  if (!contextMenu.targetId) return;
                  setActiveOverlay(contextMenu.targetId);
                  setInlineEditingId(contextMenu.targetId);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>✏️</span>
                <span>Düzenle</span>
              </button>

              <button
                onClick={bringToFront}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>⬆️</span>
                <span>Öne Getir</span>
              </button>

              <button
                onClick={sendToBack}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>⬇️</span>
                <span>Arkaya Gönder</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

              <button
                onClick={copyStyle}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#2563eb',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>📋</span>
                <span>Stili Kopyala</span>
              </button>

              <button
                onClick={pasteStyle}
                disabled={!clipboard.style}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: clipboard.style ? 'pointer' : 'not-allowed',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: clipboard.style ? '#2563eb' : '#9ca3af',
                }}
                title={!clipboard.style ? "Stili kopya etmek için ilk önce 'Stili Kopyala' yapınız" : ""}
                onMouseOver={(e) => {
                  if (clipboard.style) e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>📝</span>
                <span>Stili Yapıştır</span>
              </button>

              <button
                onClick={copyFormat}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#059669',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#d1fae5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>📏</span>
                <span>Biçimi Kopyala</span>
              </button>

              <button
                onClick={pasteFormat}
                disabled={!clipboard.format}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: clipboard.format ? 'pointer' : 'not-allowed',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: clipboard.format ? '#059669' : '#9ca3af',
                }}
                title={!clipboard.format ? "Biçimi kopya etmek için ilk önce 'Biçimi Kopyala' yapınız" : ""}
                onMouseOver={(e) => {
                  if (clipboard.format) e.currentTarget.style.background = '#d1fae5';
                }}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🔧</span>
                <span>Biçimi Yapıştır</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

              <button
                onClick={addImageToSelectedArea}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#7c3aed',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3e8ff'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🖼️</span>
                <span>Görsel Ekle</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

              <button
                onClick={deleteOverlay}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#dc2626',
                  fontWeight: '600',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🗑️</span>
                <span>Sil</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* TABLO GİRİŞ MODALİ */}
      {showTableModal && (
        <TableInputModal
          isOpen={showTableModal}
          onClose={() => setShowTableModal(false)}
          onInsert={handleInsertTable}
        />
      )}

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
