// src/overlays/TextOverlay.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import FontSize from "../extensions/FontSize";
import InlineColor from "../extensions/InlineColor";
import { Underline as UnderlineExt } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { processMathInHTML } from "../utils/mathRenderer";
import { MathInline, MathBlock } from "../extensions/MathExtension";

export default function TextOverlay({
  id,
  html,
  x,
  y,
  width,
  height,
  rotate,
  fontSize,
  color,
  lineHeight,
  textIndent,
  titleFontSize,
  titleColor,
  autoResize = true,
  locked = false,
  isActive,
  isEditing,
  onClick,
  onDoubleClick,
  onRightClick,
  onInlineChange,
  onEditorCreate,
  onPositionChange,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
  showGrid = false,
  gridSize = 20,
  guides = [],
  snapEnabled = true,
  presentationMode = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const editorContainerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState("");
  const [currentSize, setCurrentSize] = useState({ width, height });
  const lastUpdateRef = useRef(0);
  const UPDATE_THRESHOLD = 50; // 50ms'de bir update
  const [tableContextMenu, setTableContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // Inline editor
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ 
          heading: { 
            levels: [1, 2, 3] 
          },
          strike: false,
          underline: false, // StarterKit'te underline varsa disable et
        }),
        UnderlineExt, // Önce UnderlineExt'i ekle
        TextAlign.configure({ 
          types: ["heading", "paragraph"], 
          alignments: ["left", "center", "right", "justify"] 
        }),
        Highlight.configure({ 
          multicolor: true,
          HTMLAttributes: {
            class: 'tiptap-highlight',
          },
        }),
        FontSize,
        InlineColor,
        TextStyle, // TextStyle'ı Color'dan önce
        Color, // Color'u en sona
        Table.configure({
          resizable: true,
          handleWidth: 4,
          cellMinWidth: 50,
          lastColumnResizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell.configure({
          HTMLAttributes: {
            class: "tiptap-table-cell",
          },
        }),
        MathInline,
        MathBlock,
      ],
      content: html,
      editorProps: {
        attributes: {
          style: 'outline: none; padding: 4px;',
        },
      },
      onUpdate: ({ editor }) => {
        const newHtml = editor.getHTML();
        console.log('📝 TextOverlay onUpdate:', newHtml);
        onInlineChange?.(newHtml);

        if (!autoResize) return;
        
        // İçerik güncellenince container boyutunu otomatik ayarla
        setTimeout(() => {
          if (editorContainerRef.current) {
            // Geçici div ile gerçek içerik boyutunu ölç
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.width = `${currentSize.width - 16}px`; // padding çıkar
            tempDiv.style.fontSize = fontSize ? `${fontSize}px` : '14px';
            tempDiv.style.lineHeight = lineHeight || 1.4;
            tempDiv.style.whiteSpace = 'pre-wrap';
            tempDiv.style.wordWrap = 'break-word';
            tempDiv.style.wordBreak = 'break-word';
            tempDiv.innerHTML = newHtml;
            document.body.appendChild(tempDiv);
            
            const neededHeight = tempDiv.scrollHeight + 16; // padding ekle
            document.body.removeChild(tempDiv);
            
            const updates = {};
            
            // Yükseklik güncelle
            if (neededHeight > currentSize.height) {
              updates.height = Math.min(800, neededHeight);
            }
            
            if (Object.keys(updates).length > 0) {
              setCurrentSize((prev) => ({ ...prev, ...updates }));
              onPositionChange?.(id, updates);
            }
          }
        }, 50);
      },
    },
    [id] // isEditing'i kaldır - editor bir kere oluşturulsun
  );

  // İlk mount kontrolü için ref
  const isInitialMount = useRef(true);

  // Editor mounting ve content güncellemesi için effect
  useEffect(() => {
    if (!autoResize) return;
    if (editor && html) {
      const currentHtml = editor.getHTML();
      // İlk mount veya dışarıdan gelen HTML editörden farklıysa güncelle
      if (isInitialMount.current || (currentHtml !== html && !isEditing)) {
        console.log('🔄 TextOverlay: Dışarıdan HTML güncellendi, editöre yükleniyor');
        editor.commands.setContent(html);
        isInitialMount.current = false;
        
        // İçerik güncellenince boyutu hesapla
        setTimeout(() => {
          if (editorContainerRef.current) {
            const container = editorContainerRef.current;
            const contentHeight = container.scrollHeight;
            const contentWidth = container.scrollWidth;
            const currentHeight = container.clientHeight;
            const currentWidth = container.clientWidth;
            
            const updates = {};
            
            // Yükseklik - sadece içerik taşıyorsa büyüt
            if (contentHeight > currentHeight) {
              updates.height = Math.min(800, currentSize.height + (contentHeight - currentHeight) + 10);
            }
            
            // Genişlik - sadece içerik taşıyorsa büyüt
            if (contentWidth > currentWidth) {
              updates.width = Math.min(700, currentSize.width + (contentWidth - currentWidth) + 10);
            }
            
            if (Object.keys(updates).length > 0) {
              setCurrentSize((prev) => ({ ...prev, ...updates }));
              onPositionChange?.(id, updates);
            }
          }
        }, 100);
      }
    }
  }, [html, editor]);

  // Font boyutu, lineHeight veya diğer stil değişikliklerinde boyutu ayarla
  useEffect(() => {
    if (!autoResize) return;
    if (editor && editorContainerRef.current) {
      setTimeout(() => {
        if (editorContainerRef.current) {
          const currentHtml = editor.getHTML();
          
          // Geçici div ile gerçek içerik boyutunu ölç
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.visibility = 'hidden';
          tempDiv.style.width = `${currentSize.width - 16}px`; // padding çıkar
          tempDiv.style.fontSize = fontSize ? `${fontSize}px` : '14px';
          tempDiv.style.lineHeight = lineHeight || 1.4;
          tempDiv.style.whiteSpace = 'pre-wrap';
          tempDiv.style.wordWrap = 'break-word';
          tempDiv.style.wordBreak = 'break-word';
          tempDiv.innerHTML = currentHtml;
          document.body.appendChild(tempDiv);
          
          const neededHeight = tempDiv.scrollHeight + 16; // padding ekle
          document.body.removeChild(tempDiv);
          
          // Yükseklik güncelle
          if (neededHeight > currentSize.height) {
            const updates = { height: Math.min(800, neededHeight) };
            setCurrentSize((prev) => ({ ...prev, ...updates }));
            onPositionChange?.(id, updates);
          }
        }
      }, 100);
    }
  }, [fontSize, lineHeight, color]);

  // Editor seçilince parent'a geç - DocumentEditor gibi
  useEffect(() => {
    if (editor) {
      console.log(`✅ TextOverlay ${id}: Editor oluşturuldu, parent'a gönderiliyor`);
      console.log(`✅ TextOverlay ${id}: onEditorCreate fonksiyonu:`, typeof onEditorCreate);
      onEditorCreate?.(editor);
    }
  }, [editor, onEditorCreate]);
  
  // isEditing DEĞİL, isActive değiştiğinde editor'ü parent'a geç
  // Böylece overlay seçildiğinde bile toolbar çalışır
  useEffect(() => {
    console.log(`🔍 TextOverlay ${id}: isActive değişti:`, isActive, 'editor:', !!editor);
    if (editor && isActive) {
      console.log(`✅ TextOverlay ${id}: Aktif hale geldi, editor parent'a gönderiliyor`);
      console.log(`✅ TextOverlay ${id}: onEditorCreate çağrılıyor:`, typeof onEditorCreate);
      onEditorCreate?.(editor);
    }
  }, [isActive, editor, onEditorCreate]);

  // Editing moduna geçtiğinde focus ver
  useEffect(() => {
    if (editor && isEditing) {
      // Focus'u editöre ver
      setTimeout(() => {
        try {
          editor.commands.focus();
        } catch (e) {
          // Ignore focus errors
        }
      }, 100);
    }
  }, [isEditing]);

  useEffect(() => {
    setCurrentSize({ width, height });
  }, [width, height]);

  // Context menu dışında tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tableContextMenu.visible && !containerRef.current?.contains(e.target)) {
        setTableContextMenu({ ...tableContextMenu, visible: false });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [tableContextMenu.visible]);

  // Snapping helper functions
  const snapToGrid = useCallback((value) => {
    console.log('🎯 snapToGrid called:', { value, snapEnabled, showGrid, gridSize });
    if (!snapEnabled || !showGrid) return value;
    const snapped = Math.round(value / gridSize) * gridSize;
    console.log('🎯 snapToGrid result:', snapped);
    return snapped;
  }, [snapEnabled, showGrid, gridSize]);

  const snapToGuides = useCallback((value, isVertical) => {
    if (guides.length === 0) return value;
    const SNAP_DISTANCE = 10;
    const relevantGuides = guides.filter((g) =>
      isVertical ? g.type === "v" : g.type === "h"
    );
    for (const guide of relevantGuides) {
      if (Math.abs(value - guide.position) < SNAP_DISTANCE) {
        return guide.position;
      }
    }
    return value;
  }, [guides]);

  const handleMouseDown = (e) => {
    // Eğer locked ise hiçbir şey yapma
    if (locked || presentationMode) return;
    
    // Eğer resize handle üzerinde ise
    const target = e.target;
    if (target.dataset.resize) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDir(target.dataset.resize);
      setDragOffset({ x: e.clientX, y: e.clientY });
      return;
    }

    // Sürükleme moduna geç
    if (isActive && !isEditing) {
      e.stopPropagation();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - x,
        y: e.clientY - y,
      });
    }
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < UPDATE_THRESHOLD) return;
      lastUpdateRef.current = now;

      if (isDragging) {
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Snapping uygula
        newX = snapToGrid(snapToGuides(newX, true));
        newY = snapToGrid(snapToGuides(newY, false));

        onPositionChange?.(id, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragOffset.x;
        const deltaY = e.clientY - dragOffset.y;

        const newSize = { ...currentSize };

        if (resizeDir.includes("e")) {
          newSize.width = Math.max(50, currentSize.width + deltaX);
        }
        if (resizeDir.includes("s")) {
          newSize.height = Math.max(30, currentSize.height + deltaY);
        }
        if (resizeDir.includes("w")) {
          const newW = Math.max(50, currentSize.width - deltaX);
          const diff = newW - currentSize.width;
          onPositionChange?.(id, { x: x + diff, width: newW });
          newSize.width = newW;
        }
        if (resizeDir.includes("n")) {
          const newH = Math.max(30, currentSize.height - deltaY);
          const diff = newH - currentSize.height;
          onPositionChange?.(id, { y: y + diff, height: newH });
          newSize.height = newH;
        }

        // Sağ ve alt kenarlar
        if (resizeDir === "e" || resizeDir === "se") {
          onPositionChange?.(id, { width: newSize.width });
        }
        if (resizeDir === "s" || resizeDir === "se") {
          onPositionChange?.(id, { height: newSize.height });
        }

        setCurrentSize(newSize);
      }
    };

    const handleMouseUp = () => {
      // Resize bitince final size'ı kaydet
      if (isResizing) {
        onPositionChange?.(id, { width: currentSize.width, height: currentSize.height });
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, x, y, currentSize, resizeDir, id, onPositionChange, snapToGrid, snapToGuides]);

  const ResizeHandle = ({ direction }) => (
    <div
      data-resize={direction}
      onMouseDown={handleMouseDown}
      className="absolute bg-blue-500 rounded hover:bg-blue-600 transition cursor-pointer"
      style={{
        width: "12px",
        height: "12px",
        zIndex: 100,
        ...(direction.includes("n") && { top: "-6px" }),
        ...(direction.includes("s") && { bottom: "-6px" }),
        ...(direction.includes("w") && { left: "-6px" }),
        ...(direction.includes("e") && { right: "-6px" }),
        ...(direction === "nw" && { top: "-6px", left: "-6px" }),
        ...(direction === "ne" && { top: "-6px", right: "-6px" }),
        ...(direction === "sw" && { bottom: "-6px", left: "-6px" }),
        ...(direction === "se" && { bottom: "-6px", right: "-6px" }),
        ...(direction === "n" && { top: "-6px", left: "50%", transform: "translateX(-50%)" }),
        ...(direction === "s" && { bottom: "-6px", left: "50%", transform: "translateX(-50%)" }),
        ...(direction === "w" && { left: "-6px", top: "50%", transform: "translateY(-50%)" }),
        ...(direction === "e" && { right: "-6px", top: "50%", transform: "translateY(-50%)" }),
      }}
    />
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: currentSize.width,
        height: currentSize.height,
        transform: `rotate(${rotate || 0}deg)`,
        transformOrigin: "top left",
        pointerEvents: "auto",
        cursor: isDragging ? "grabbing" : (id === "authors" || id === "institution" || id === "contact") ? "pointer" : (isActive && !isEditing ? "grab" : "text"),
        boxSizing: "border-box",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRightClick?.(id, { x: e.clientX, y: e.clientY }, 'text');
      }}
    >
      {/* Yazar, kurum ve iletişim overlay'ları için özel davranış - düzenlenemez statik metin */}
      {(id === "authors" || id === "institution" || id === "contact") ? (
        <div
          style={{
            outline: "none",
            whiteSpace: "pre-wrap",
            border: presentationMode ? "none" : isActive ? "2px solid #3b82f6" : "1px dashed rgba(59, 130, 246, 0.2)",
            borderRadius: "4px",
            padding: "8px",
            backgroundColor: isActive ? "rgba(59, 130, 246, 0.05)" : "transparent",
            transition: "all 0.2s ease",
            height: "100%",
            overflow: "visible",
            boxShadow: isActive ? "0 0 0 2px rgba(59, 130, 246, 0.1)" : "none",
            fontSize: fontSize ? `${fontSize}px` : "14px",
            color: color || "#000000",
            lineHeight: lineHeight || 1.4,
            boxSizing: "border-box",
            wordWrap: "break-word",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            '--paragraph-font-size': fontSize ? `${fontSize}px` : '14px',
            '--default-text-color': color || '#000000',
            '--heading-font-size': titleFontSize ? `${titleFontSize}px` : 'inherit',
            '--heading-color': titleColor || color || '#000000',
          }}
          dangerouslySetInnerHTML={{ __html: processMathInHTML(html) }}
        />
      ) : isEditing ? (
        <div
          ref={editorContainerRef}
          style={{
            outline: "none",
            border: presentationMode ? "none" : "1px solid #10b981",
            borderRadius: "4px",
            padding: "8px",
            backgroundColor: presentationMode ? "transparent" : "rgba(16, 185, 129, 0.03)",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            overflow: "visible",
            boxShadow: presentationMode ? "none" : "0 0 0 1px rgba(16, 185, 129, 0.2)",
            fontSize: fontSize ? `${fontSize}px` : "14px",
            color: color || "#000000",
            lineHeight: lineHeight || 1.4,
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            '--paragraph-font-size': fontSize ? `${fontSize}px` : '14px',
            '--default-text-color': color || '#000000',
            '--heading-font-size': titleFontSize ? `${titleFontSize}px` : 'inherit',
            '--heading-color': titleColor || color || '#000000',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {editor && (
            <div
              style={{
                width: "100%",
                minHeight: "30px",
                boxSizing: "border-box",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              className="tiptap-editor-content text-overlay-tiptap"
            >
              <EditorContent 
                editor={editor}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Tablo içinde sağ-tık ise tablo context menu göster
                  if (editor.isActive("table")) {
                    setTableContextMenu({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  } else {
                    // Normal sağ tık - genel context menu
                    setTableContextMenu({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      isGeneralMenu: true,
                    });
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Context menu açıksa kapat
                  if (tableContextMenu.visible) {
                    setTableContextMenu({ ...tableContextMenu, visible: false });
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          ref={editorContainerRef}
          className="text-overlay-display"
          style={{
            outline: "none",
            whiteSpace: "pre-wrap",
            border: presentationMode ? "none" : "1px dashed rgba(59, 130, 246, 0.3)",
            borderRadius: "4px",
            padding: "8px",
            backgroundColor: "transparent",
            transition: "all 0.2s ease",
            height: "100%",
            overflow: "visible",
            boxShadow: "none",
            fontSize: fontSize ? `${fontSize}px` : "14px",
            color: color || "#000000",
            lineHeight: lineHeight || 1.4,
            textIndent: `${Math.max(0, textIndent || 0)}px`,
            boxSizing: "border-box",
            wordWrap: "break-word",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            '--paragraph-font-size': fontSize ? `${fontSize}px` : '14px',
            '--default-text-color': color || '#000000',
            '--heading-font-size': titleFontSize ? `${titleFontSize}px` : 'inherit',
            '--heading-color': titleColor || color || '#000000',
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRightClick?.(id, { x: e.clientX, y: e.clientY }, 'text');
          }}
          dangerouslySetInnerHTML={{ __html: processMathInHTML(html) }}
        />
      )}

      {/* Resize Handles - Sadece aktif, editing değilken ve presentationMode false ise göster */}
      {/* Yazar, kurum ve iletişim overlay'ları resize edilemez */}
      {isActive && !isEditing && !presentationMode && !locked && (id !== "authors" && id !== "institution" && id !== "contact") && (
        <>
          <ResizeHandle direction="nw" />
          <ResizeHandle direction="ne" />
          <ResizeHandle direction="sw" />
          <ResizeHandle direction="se" />
          <ResizeHandle direction="n" />
          <ResizeHandle direction="s" />
          <ResizeHandle direction="w" />
          <ResizeHandle direction="e" />
        </>
      )}

      {/* CONTEXT MENU - Tablo veya Genel */}
      {tableContextMenu.visible && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-xl z-50 py-1 min-w-max"
          style={{
            top: Math.min(tableContextMenu.y, window.innerHeight - 300),
            left: Math.min(tableContextMenu.x, window.innerWidth - 200),
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setTableContextMenu({ ...tableContextMenu, visible: false })}
        >
        {tableContextMenu.isGeneralMenu ? (
          // GENEL MENU - Denklem/Sembol
          <>
            <button
              onClick={() => {
                onOpenEquationEditor?.();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              className="block w-full text-left px-4 py-2 hover:bg-purple-50 text-sm font-medium text-gray-700 border-b border-gray-100"
            >
              <span className="mr-2">∑</span>Denklem Ekle
            </button>
            <button
              onClick={() => {
                onOpenMathSymbolPanel?.();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm font-medium text-gray-700"
            >
              <span className="mr-2">π</span>Sembol Ekle
            </button>
          </>
        ) : (
          // TABLO MENU
          <>
            {/* Add Row */}
            <button
              onClick={() => {
                editor.chain().focus().addRowAfter().run();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm font-medium text-gray-700 border-b border-gray-100"
            >
              ➕ Satır Ekle
            </button>

            {/* Add Column */}
            <button
              onClick={() => {
                editor.chain().focus().addColumnAfter().run();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              className="block w-full text-left px-4 py-2 hover:bg-blue-50 text-sm font-medium text-gray-700 border-b border-gray-100"
            >
              ➕ Sütun Ekle
            </button>

            {/* Delete Row */}
            <button
              onClick={() => {
                editor.chain().focus().deleteRow().run();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              className="block w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600 border-b border-gray-100"
            >
              ➖ Satır Sil
            </button>

            {/* Delete Column */}
            <button
              onClick={() => {
                editor.chain().focus().deleteColumn().run();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              className="block w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-600 border-b border-gray-100"
            >
              ➖ Sütun Sil
            </button>

            {/* Merge Cells */}
            <button
              onClick={() => {
                editor.chain().focus().mergeCells().run();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              disabled={!editor.can().mergeCells()}
              className={`block w-full text-left px-4 py-2 text-sm font-medium border-b border-gray-100 ${
                editor.can().mergeCells()
                  ? "hover:bg-green-50 text-green-600"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              🔗 Birleştir
            </button>

            {/* Split Cell */}
            <button
              onClick={() => {
                editor.chain().focus().splitCell().run();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              disabled={!editor.can().splitCell()}
              className={`block w-full text-left px-4 py-2 text-sm font-medium border-b border-gray-100 ${
                editor.can().splitCell()
                  ? "hover:bg-green-50 text-green-600"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              ✂️ Böl
            </button>

            {/* Delete Table */}
            <button
              onClick={() => {
                editor.chain().focus().deleteTable().run();
                setTableContextMenu({ ...tableContextMenu, visible: false });
              }}
              className="block w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-medium text-red-700"
            >
              🗑️ Tabloyu Sil
            </button>
          </>
        )}
        </div>
      )}
    </div>
  );
}
