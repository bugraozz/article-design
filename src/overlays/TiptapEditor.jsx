// src/overlays/TiptapEditor.jsx
import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import FontSize from "../extensions/FontSize";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { MathInline, MathBlock } from "../extensions/MathExtension";

export default function TiptapEditor({ initialContent, onChange, onEditorReady, onOpenEquationEditor, onOpenMathSymbolPanel }) {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ["paragraph", "heading"] }),
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
    content: initialContent || "<p></p>",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  // Editor ready olunca parent'a bildir
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // initialContent değişirse (sayfa / overlay değişimi) editor'ü sync et
  useEffect(() => {
    if (!editor || initialContent == null) return;
    const current = editor.getHTML();
    if (current !== initialContent) {
      editor.commands.setContent(initialContent, false);
    }
  }, [editor, initialContent]);

  // Sağ tık menüsünü kapat
  useEffect(() => {
    const closeMenu = () => setContextMenu({ visible: false, x: 0, y: 0 });
    if (contextMenu.visible) {
      document.addEventListener('click', closeMenu);
      return () => document.removeEventListener('click', closeMenu);
    }
  }, [contextMenu.visible]);

  // Sağ tık handler
  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  if (!editor) return null;

  return (
    <div
      className="w-full h-full bg-white rounded-lg border-2 border-gray-300 shadow-md overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={handleContextMenu}
    >
      {/* Modern Toolbar - İki Satır */}
      <div className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-300 p-4 space-y-3">
        {/* İlk Satır - Temel Stil */}
        <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-gray-200">
          {/* Stil Butonları */}
          <div className="flex gap-1 items-center">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-md font-semibold transition ${
                editor.isActive("bold")
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              title="Kalın (Ctrl+B)"
            >
              B
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-md italic transition ${
                editor.isActive("italic")
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              title="İtalik (Ctrl+I)"
            >
              I
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-md underline transition ${
                editor.isActive("underline")
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              title="Altı Çizili (Ctrl+U)"
            >
              U
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Font Boyutu - Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  editor
                    .chain()
                    .focus()
                    .setMark("fontSize", { size: e.target.value })
                    .run();
                  e.target.value = "";
                }
              }}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer font-medium"
              title="Font Boyutu"
            >
              <option value="">Aa</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
              <option value="36px">36px</option>
              <option value="40px">40px</option>
            </select>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Renk */}
            <div className="flex items-center gap-1">
              <input
                type="color"
                onInput={(e) =>
                  editor.chain().focus().setColor(e.target.value).run()
                }
                defaultValue="#000000"
                className="w-10 h-10 border-2 border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition"
                title="Yazı Rengi"
              />
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Hizalama */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded-md transition ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              title="Sola Hizala"
            >
              ⬅
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 rounded-md transition ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              title="Ortaya Hizala"
            >
              ↔
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded-md transition ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              title="Sağa Hizala"
            >
              ➡
            </button>
          </div>
        </div>

        {/* İkinci Satır - Listeler ve Diğer */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-md transition ${
              editor.isActive("bulletList")
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
            title="Madde İşareti Listesi"
          >
            •
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-md transition ${
              editor.isActive("orderedList")
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
            title="Numaralandırılmış Liste"
          >
            1.
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Vurgu Rengi */}
          <input
            type="color"
            onInput={(e) =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: e.target.value })
                .run()
            }
            defaultValue="#FFFF00"
            className="w-10 h-10 border-2 border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition"
            title="Vurgu Rengi"
          />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded-md transition ${
              editor.isActive("highlight")
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
            title="Vurguyu Kapat"
          >
            ✕ Vurgu
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Tablo Butonları */}
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-2 rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition font-medium"
            title="Tablo Ekle (3x3)"
          >
            📊 Tablo
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.isActive("table")}
            className={`p-2 rounded-md transition ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Satır Ekle"
          >
            ➕ Satır
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.isActive("table")}
            className={`p-2 rounded-md transition ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Sütun Ekle"
          >
            ➕ Sütun
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.isActive("table")}
            className={`p-2 rounded-md transition ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Satır Sil"
          >
            ➖ Satır
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.isActive("table")}
            className={`p-2 rounded-md transition ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Sütun Sil"
          >
            ➖ Sütun
          </button>
        </div>
      </div>

      {/* Editable Alan - Modern Görünüm */}
      <EditorContent
        editor={editor}
        className="tiptap-content-editor flex-1 overflow-y-auto p-6"
        style={{ outline: "none" }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Context Menu */}
      {contextMenu.visible && (
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
            minWidth: '180px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setContextMenu({ visible: false, x: 0, y: 0 });
              onOpenEquationEditor?.();
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
            onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <span>∑</span>
            <span>Denklem Ekle</span>
          </button>
          
          <button
            onClick={() => {
              setContextMenu({ visible: false, x: 0, y: 0 });
              onOpenMathSymbolPanel?.();
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
            onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <span>π</span>
            <span>Sembol Ekle</span>
          </button>
        </div>
      )}
    </div>
  );
}
