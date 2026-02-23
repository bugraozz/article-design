// src/overlays/TiptapEditor.jsx
import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import FontSize from "../extensions/FontSize";
import InlineColor from "../extensions/InlineColor";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { MathInline, MathBlock } from "../extensions/MathExtension";

export default function TiptapEditor({ initialContent, onChange, onEditorReady, onOpenEquationEditor, onOpenMathSymbolPanel }) {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        strike: false,
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'tiptap-highlight',
        },
      }),
      InlineColor,
      FontSize,
      TextAlign.configure({ 
        types: ["paragraph", "heading"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 50,
        lastColumnResizable: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
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
    editorProps: {
      attributes: {
        style: 'outline: none;',
      },
    },
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

  // Sağ tık handler - imlecin olduğu yerde aç
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
            {/* Başlık Seçenekleri */}
            <select
              onChange={(e) => {
                const value = e.target.value;
                if (value === "p") {
                  editor.chain().focus().setParagraph().run();
                } else if (value === "h1") {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                } else if (value === "h2") {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                } else if (value === "h3") {
                  editor.chain().focus().toggleHeading({ level: 3 }).run();
                }
              }}
              value={
                editor.isActive("heading", { level: 1 })
                  ? "h1"
                  : editor.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : "p"
              }
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer font-medium"
              title="Metin Stili"
            >
              <option value="p">Normal</option>
              <option value="h1">Başlık 1</option>
              <option value="h2">Başlık 2</option>
              <option value="h3">Başlık 3</option>
            </select>

            <div className="w-px h-6 bg-gray-300"></div>

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
              <label className="text-xs text-gray-600 font-medium">Renk:</label>
              <input
                type="color"
                onChange={(e) => {
                  const color = e.target.value;
                  editor.chain().focus().setColor(color).run();
                }}
                value={editor.getAttributes('textStyle').color || '#000000'}
                className="w-10 h-10 border-2 border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition"
                title="Yazı Rengi"
              />
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition"
                title="Rengi Sıfırla"
              >
                ✕
              </button>
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
            onChange={(e) => {
              const color = e.target.value;
              editor.chain().focus().setHighlight({ color }).run();
            }}
            defaultValue="#FFFF00"
            className="w-10 h-10 border-2 border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition"
            title="Vurgu Rengi"
          />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`px-3 py-2 rounded-md transition text-sm ${
              editor.isActive("highlight")
                ? "bg-yellow-400 text-gray-900 shadow-sm"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
            title="Vurgula / Vurguyu Kaldır"
          >
            {editor.isActive("highlight") ? "✓ Vurgu" : "🖍 Vurgu"}
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          {/* Tablo Butonları */}
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-2 rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 transition font-medium text-xs"
            title="Tablo Ekle (3x3)"
          >
            📊 Tablo
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.isActive("table")}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Üste Satır Ekle"
          >
            ⬆️ Satır
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.isActive("table")}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Alta Satır Ekle"
          >
            ⬇️ Satır
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.isActive("table")}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.isActive("table")
                ? "bg-red-50 text-red-600 border border-red-300 hover:bg-red-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Satır Sil"
          >
            🗑️ Satır
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.isActive("table")}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Sola Sütun Ekle"
          >
            ⬅️ Sütun
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.isActive("table")}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.isActive("table")
                ? "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Sağa Sütun Ekle"
          >
            ➡️ Sütun
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.isActive("table")}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.isActive("table")
                ? "bg-red-50 text-red-600 border border-red-300 hover:bg-red-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Sütun Sil"
          >
            🗑️ Sütun
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            type="button"
            onClick={() => editor.chain().focus().mergeCells().run()}
            disabled={!editor.can().mergeCells()}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.can().mergeCells()
                ? "bg-green-50 text-green-600 border border-green-300 hover:bg-green-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Hücreleri Birleştir"
          >
            🔗 Birleştir
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.can().splitCell()
                ? "bg-green-50 text-green-600 border border-green-300 hover:bg-green-100"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Hücreyi Böl"
          >
            ✂️ Böl
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.isActive("table")}
            className={`px-2 py-1.5 rounded-md transition text-xs ${
              editor.isActive("table")
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Tabloyu Sil"
          >
            🗑️ Tablo
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

      {/* Professional Context Menu */}
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
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tablo işlemleri - sadece tablo içindeyse göster */}
          {editor.isActive("table") && (
            <>
              <button
                onClick={() => {
                  editor.chain().focus().addRowBefore().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
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
                <span>⬆️</span>
                <span>Üste Satır Ekle</span>
              </button>
              
              <button
                onClick={() => {
                  editor.chain().focus().addRowAfter().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
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
                <span>⬇️</span>
                <span>Alta Satır Ekle</span>
              </button>
              
              <button
                onClick={() => {
                  editor.chain().focus().deleteRow().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
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
                onClick={() => {
                  editor.chain().focus().addColumnBefore().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
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
                <span>⬅️</span>
                <span>Sola Sütun Ekle</span>
              </button>

              <button
                onClick={() => {
                  editor.chain().focus().addColumnAfter().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
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
                <span>➡️</span>
                <span>Sağa Sütun Ekle</span>
              </button>

              <button
                onClick={() => {
                  editor.chain().focus().deleteColumn().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
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
                onClick={() => {
                  editor.chain().focus().mergeCells().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
                disabled={!editor.can().mergeCells()}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: editor.can().mergeCells() ? 'pointer' : 'not-allowed',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: editor.can().mergeCells() ? '#059669' : '#9ca3af',
                }}
                onMouseOver={(e) => {
                  if (editor.can().mergeCells()) e.currentTarget.style.background = '#d1fae5';
                }}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🔗</span>
                <span>Hücreleri Birleştir</span>
              </button>

              <button
                onClick={() => {
                  editor.chain().focus().splitCell().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
                disabled={!editor.can().splitCell()}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: editor.can().splitCell() ? 'pointer' : 'not-allowed',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: editor.can().splitCell() ? '#059669' : '#9ca3af',
                }}
                onMouseOver={(e) => {
                  if (editor.can().splitCell()) e.currentTarget.style.background = '#d1fae5';
                }}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>✂️</span>
                <span>Hücreyi Böl</span>
              </button>

              <button
                onClick={() => {
                  editor.chain().focus().deleteTable().run();
                  setContextMenu({ visible: false, x: 0, y: 0 });
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
                  color: '#dc2626',
                  fontWeight: '600',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>🗑️</span>
                <span>Tabloyu Sil</span>
              </button>

              <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>
            </>
          )}

          {/* Matematik işlemleri */}
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
