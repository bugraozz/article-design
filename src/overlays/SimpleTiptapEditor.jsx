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

export default function SimpleTiptapEditor({ initialContent, onChange, onEditorReady }) {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ["paragraph", "heading"] }),
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
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  if (!editor) return null;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-2 items-center">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-2 rounded font-semibold text-sm transition ${
            editor.isActive("bold")
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          title="Kalın"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-2 rounded italic text-sm transition ${
            editor.isActive("italic")
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          title="İtalik"
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-2 rounded underline text-sm transition ${
            editor.isActive("underline")
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          title="Altı Çizili"
        >
          U
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Font Size */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setMark("fontSize", { size: e.target.value }).run();
              e.target.value = "";
            }
          }}
          className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 cursor-pointer"
        >
          <option value="">Boyut</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
        </select>

        {/* Color */}
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
          defaultValue="#000000"
          className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer hover:border-blue-400 transition"
          title="Yazı Rengi"
        />

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`px-3 py-2 text-sm rounded ${
            editor.isActive({ textAlign: "left" })
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          ⬅
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`px-3 py-2 text-sm rounded ${
            editor.isActive({ textAlign: "center" })
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          ↔
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`px-3 py-2 text-sm rounded ${
            editor.isActive({ textAlign: "right" })
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          ➡
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-2 text-sm rounded ${
            editor.isActive("bulletList")
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          title="Madde İşareti"
        >
          •
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-2 text-sm rounded ${
            editor.isActive("orderedList")
              ? "bg-blue-500 text-white shadow"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          title="Numaralandırılmış Liste"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Highlight */}
        <input
          type="color"
          onInput={(e) =>
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
          }
          defaultValue="#FFFF00"
          className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer hover:border-blue-400 transition"
          title="Vurgu Rengi"
        />

        <div className="w-px h-6 bg-gray-300"></div>

        {/* TABLE BUTTONS */}
        {/* Insert Table */}
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="px-3 py-2 text-sm rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
          title="Tablo Ekle (3x3)"
        >
          📊 Tablo
        </button>

        {/* Add Row Before */}
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.isActive("table")}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.isActive("table")
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Satır Ekle (Üstüne)"
        >
          ⬆️ Satır
        </button>

        {/* Add Row After */}
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.isActive("table")}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.isActive("table")
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Satır Ekle (Altına)"
        >
          ⬇️ Satır
        </button>

        {/* Delete Row */}
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.isActive("table")}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.isActive("table")
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Satır Sil"
        >
          🗑️ Satır
        </button>

        {/* Add Column Before */}
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.isActive("table")}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.isActive("table")
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Sütun Ekle (Soluna)"
        >
          ⬅️ Sütun
        </button>

        {/* Add Column After */}
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.isActive("table")}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.isActive("table")
              ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Sütun Ekle (Sağına)"
        >
          ➡️ Sütun
        </button>

        {/* Delete Column */}
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.isActive("table")}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.isActive("table")
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Sütun Sil"
        >
          🗑️ Sütun
        </button>

        {/* Merge Cells */}
        <button
          onClick={() => editor.chain().focus().mergeCells().run()}
          disabled={!editor.can().mergeCells()}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.can().mergeCells()
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Hücreleri Birleştir"
        >
          🔗 Birleştir
        </button>

        {/* Split Cell */}
        <button
          onClick={() => editor.chain().focus().splitCell().run()}
          disabled={!editor.can().splitCell()}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.can().splitCell()
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Hücreyi Böl"
        >
          ✂️ Böl
        </button>

        {/* Delete Table */}
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.isActive("table")}
          className={`px-3 py-2 text-sm rounded font-medium transition ${
            editor.isActive("table")
              ? "bg-red-700 text-white hover:bg-red-800"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          title="Tabloyu Sil"
        >
          🗑️ Tablo
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto p-4 tiptap-editor-content"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={handleContextMenu}
      />

      {/* Professional Context Menu */}
      {contextMenu.visible && editor && (
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
