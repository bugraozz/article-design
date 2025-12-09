// src/overlays/TextOverlay.jsx
import { useState, useRef, useEffect } from "react";
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
  isActive,
  isEditing,
  onClick,
  onDoubleClick,
  onRightClick,
  onInlineChange,
  onEditorCreate,
  onPositionChange,
  showGrid = false,
  gridSize = 20,
  guides = [],
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
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right"] }),
        Highlight.configure({ multicolor: true }),
        FontSize,
        InlineColor,
        UnderlineExt,
        TextStyle,
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
      ],
      content: html,
      onUpdate: ({ editor }) => {
        onInlineChange?.(editor.getHTML());
        // İçerik güncellenince container height'ını ölç
        if (isEditing && editorContainerRef.current) {
          setTimeout(() => {
            if (editorContainerRef.current) {
              const scrollHeight = editorContainerRef.current.scrollHeight;
              if (scrollHeight !== currentSize.height) {
                const newHeight = Math.max(30, scrollHeight);
                setCurrentSize((prev) => ({ ...prev, height: newHeight }));
                onPositionChange?.(id, { height: newHeight });
              }
            }
          }, 10);
        }
      },
    },
    [id, isEditing]
  );

  useEffect(() => {
    if (editor && isEditing && html && editor.getHTML() !== html) {
      editor.commands.setContent(html);
    }
  }, [id, isEditing, editor]);

  // Editor seçilince parent'a geç - isEditing fark etmez
  useEffect(() => {
    if (editor) {
      onEditorCreate?.(editor);
    }
  }, [editor, onEditorCreate]);

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
  const snapToGrid = (value) => {
    if (!showGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const snapToGuides = (value, isVertical) => {
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
  };

  const handleMouseDown = (e) => {
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
  }, [isDragging, isResizing, dragOffset, x, y, currentSize, resizeDir, id, onPositionChange, onInlineChange, html]);

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
        height: isEditing ? "auto" : currentSize.height,
        minHeight: currentSize.height,
        transform: `rotate(${rotate || 0}deg)`,
        transformOrigin: "top left",
        pointerEvents: "auto",
        cursor: isDragging ? "grabbing" : isActive && !isEditing ? "grab" : "text",
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
        onRightClick?.(id, { x: e.clientX, y: e.clientY });
      }}
    >
      {isEditing ? (
        <div
          ref={editorContainerRef}
          style={{
            outline: "none",
            border: "2px solid #10b981",
            borderRadius: "4px",
            padding: "8px",
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            height: "auto",
            minHeight: "30px",
            width: "100%",
            boxSizing: "border-box",
            overflow: "visible",
            boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.3)",
            fontSize: "14px",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
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
              className="tiptap-editor-content"
            >
              <EditorContent 
                editor={editor}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onContextMenu={(e) => {
                  // Tablo içinde sağ-tık ise context menu göster
                  if (editor.isActive("table")) {
                    e.preventDefault();
                    e.stopPropagation();
                    setTableContextMenu({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }
                }}
                onClick={(e) => {
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
          className="text-overlay-display"
          style={{
            outline: "none",
            whiteSpace: "pre-wrap",
            border: isActive ? "2px solid #3b82f6" : "1px dashed rgba(59, 130, 246, 0.3)",
            borderRadius: "4px",
            padding: "8px",
            backgroundColor: isActive ? "rgba(59, 130, 246, 0.02)" : "transparent",
            transition: "all 0.2s ease",
            height: "100%",
            overflow: "hidden",
            boxShadow: isActive ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
            fontSize: fontSize ? `${fontSize}px` : "14px",
            "--default-text-color": color || "#000000",
            lineHeight: lineHeight || 1.4,
            textIndent: `${Math.max(0, textIndent || 0)}px`,
            "--heading-font-size": titleFontSize ? `${titleFontSize}px` : "inherit",
            "--heading-color": titleColor || color || "#000000",
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRightClick?.({ x: e.clientX, y: e.clientY });
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {/* Resize Handles - Sadece aktif ve editing değilken göster */}
      {isActive && !isEditing && (
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

      {/* TABLE CONTEXT MENU */}
      {tableContextMenu.visible && editor?.isActive("table") && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-xl z-50 py-1 min-w-max"
          style={{
            top: Math.min(tableContextMenu.y, window.innerHeight - 300),
            left: Math.min(tableContextMenu.x, window.innerWidth - 200),
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => setTableContextMenu({ ...tableContextMenu, visible: false })}
        >
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
        </div>
      )}
    </div>
  );
}
