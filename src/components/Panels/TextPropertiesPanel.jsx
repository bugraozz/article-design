import { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading2,
  X,
  Sigma,
  PenTool,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import FontSize from "../../extensions/FontSize";
import InlineColor from "../../extensions/InlineColor";
import { TextStyle } from "@tiptap/extension-text-style";
import { MathInline, MathBlock } from "../../extensions/MathExtension";

export default function TextPropertiesPanel({
  overlayId,
  overlayHtml,
  titleFontSize,
  titleColor,
  onChange,
  onClose,
  onApplyColor,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
  onEditorReady,
}) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center", "right"],
        }),
        Highlight.configure({ multicolor: true }),
        FontSize,
        InlineColor,
        TextStyle,
        Table.configure({
          resizable: true,
          handleWidth: 4,
          cellMinWidth: 50,
          lastColumnResizable: true,
          HTMLAttributes: {
            class: "tiptap-table",
            style: "border-collapse: collapse; width: 100%; border: 1px solid #d1d5db;",
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
        MathInline,
        MathBlock,
      ],
      content: overlayHtml,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      onSelectionUpdate: ({ editor }) => {
        // Her cursor hareketi sonrası editörü parent'a bildir
        if (onEditorReady) {
          onEditorReady(editor);
        }
      },
    },
    [overlayId]
  );

  // Editor hazır olduğunda parent'a bildir
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Content değişince editor'ü güncelle
  useEffect(() => {
    if (editor && overlayHtml && editor.getHTML() !== overlayHtml) {
      editor.commands.setContent(overlayHtml);
    }
  }, [overlayId, editor]);

  const handleFontSize = (size) => {
    editor?.chain().focus().setMark("fontSize", { size }).run();
  };

  const handleTextColor = (color) => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    
    // Eğer metin seçili değilse
    if (from === to) {
      alert("Lütfen rengi değiştirmek istediğiniz metni seçin!");
      return;
    }
    
    // Seçili metni al
    const selectedText = editor.state.doc.textBetween(from, to, "");
    
    // Mevcut HTML'i al
    const currentHtml = editor.getHTML();
    
    // Seçili metni <span> ile wrap et
    // SADECE İLK EŞLEŞMEYİ değiştir
    const newHtml = currentHtml.replace(
      selectedText,
      `<span style="color: ${color}">${selectedText}</span>`
    );
    
    // TipTap'ı bypass et, doğrudan onChange ile parent'a gönder
    onChange(newHtml);
    
    // Editor'ü güncellemek için setContent kullan
    editor.commands.setContent(newHtml);
  };

  const handleTextAlign = (align) => {
    editor?.chain().focus().setTextAlign(align).run();
  };

  if (!editor) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-lg flex flex-col h-full">
      {/* Başlık */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Metin Özellikleri</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* EDITOR ALANI - Metin yazılacak yer */}
        <div className="border border-gray-300 rounded p-3 bg-gray-50 min-h-32">
          <EditorContent 
            editor={editor}
            className="prose prose-sm max-w-none focus:outline-none"
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          />
        </div>

        {/* Stil Düğmeleri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stil
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded border transition ${
                editor.isActive("bold")
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Kalın"
            >
              <Bold size={18} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded border transition ${
                editor.isActive("italic")
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="İtalik"
            >
              <Italic size={18} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded border transition ${
                editor.isActive("underline")
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Altı Çizili"
            >
              <Underline size={18} />
            </button>

            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                // onChange çağırarak TextOverlay'i güncelle
                setTimeout(() => {
                  onChange(editor.getHTML());
                  
                  const editorElement = document.querySelector('[contenteditable="true"]');
                  if (editorElement && editorElement.parentElement) {
                    editorElement.parentElement.style.setProperty("--title-color", titleColor || "#1f2937");
                    editorElement.parentElement.style.setProperty("--title-font-size", titleFontSize ? `${titleFontSize}px` : "24px");
                  }
                }, 10);
              }}
              className={`p-2 rounded border transition ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Başlık"
            >
              <Heading2 size={18} />
            </button>
          </div>
        </div>

        {/* Font Boyutu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Boyutu
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              {["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"].map(
                (size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSize(size)}
                    className="px-3 py-2 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-sm font-medium transition active:bg-blue-100"
                  >
                    {size.replace("px", "")}
                  </button>
                )
              )}
            </div>
            <p className="text-xs text-gray-500">💡 Metni seçin, sonra boyutu tıkla</p>
          </div>
        </div>

        {/* Renk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yazı Rengi
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                defaultValue="#000000"
                onChange={(e) => {
                  handleTextColor(e.target.value);
                }}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                title="Seçili metin rengini değiştir"
              />
              <button
                onClick={() => handleTextColor("#000000")}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-sm transition"
                title="Siyaha sıfırla"
              >
                Sıfırla
              </button>
            </div>
            {/* Hızlı Renk Seçenekleri */}
            <div className="flex gap-2 flex-wrap">
              {["#000000", "#FFFFFF", "#FF0000", "#00AA00", "#0000FF", "#FF8800", "#9933FF", "#FF1493"].map((color) => (
                <button
                  key={color}
                  onClick={() => handleTextColor(color)}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-600 transition"
                  style={{ backgroundColor: color }}
                  title={`${color} rengini seç`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">💡 Metni seçin, sonra rengi değiştirin</p>
          </div>
        </div>

        {/* Hizalama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hizalama
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleTextAlign("left")}
              className={`p-2 rounded border transition ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Sola Hizala"
            >
              <AlignLeft size={18} />
            </button>

            <button
              onClick={() => handleTextAlign("center")}
              className={`p-2 rounded border transition ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Ortaya Hizala"
            >
              <AlignCenter size={18} />
            </button>

            <button
              onClick={() => handleTextAlign("right")}
              className={`p-2 rounded border transition ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Sağa Hizala"
            >
              <AlignRight size={18} />
            </button>
          </div>
        </div>

        {/* Listeler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listeler
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded border transition ${
                editor.isActive("bulletList")
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Madde İşareti"
            >
              <List size={18} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded border transition ${
                editor.isActive("orderedList")
                  ? "bg-blue-100 border-blue-400"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
              title="Numaralandırılmış"
            >
              <ListOrdered size={18} />
            </button>
          </div>
        </div>

        {/* Ek Seçenekler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vurgula
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              onInput={(e) => {
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: e.target.value })
                  .run();
              }}
              defaultValue="#FFFF00"
              className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              title="Vurgu Rengi"
            />
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`px-3 py-2 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-sm transition flex-1 ${
                editor.isActive("highlight") ? "bg-blue-100 border-blue-400" : ""
              }`}
            >
              Kapat
            </button>
          </div>
        </div>

        {/* Matematik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Matematik
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenEquationEditor}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 border border-purple-300 rounded hover:bg-purple-100 text-sm font-medium text-purple-700 transition"
              title="Denklem Ekle"
            >
              <Sigma size={18} />
              Denklem
            </button>

            <button
              onClick={onOpenMathSymbolPanel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-300 rounded hover:bg-indigo-100 text-sm font-medium text-indigo-700 transition"
              title="Sembol Ekle"
            >
              <PenTool size={18} />
              Sembol
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 İmleci nereye koyduysan oraya ekler</p>
        </div>
      </div>
    </div>
  );
}
