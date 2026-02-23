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
  Highlighter
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
        Table.configure({
          resizable: true,
          handleWidth: 4,
          cellMinWidth: 50,
          lastColumnResizable: true,
          HTMLAttributes: {
            class: "tiptap-table",
            style: "border-collapse: collapse; width: 100%; border: 1px solid #e5e7eb;",
          },
        }),
        TableRow,
        TableHeader,
        TableCell,
        MathInline,
        MathBlock,
      ],
      content: overlayHtml,
      onUpdate: ({ editor, transaction }) => {
        const html = editor.getHTML();
        console.log('📝 TextPropertiesPanel onUpdate - HTML changed');
        onChange(html);
      },
      onSelectionUpdate: ({ editor }) => {
        if (onEditorReady) {
          onEditorReady(editor);
        }
      },
    },
    [overlayId]
  );

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && overlayHtml && editor.getHTML() !== overlayHtml) {
      // Sadece focus yoksa güncelle ki yazarken atlama yapmasın
      if (!editor.isFocused) {
        console.log('📥 TextPropertiesPanel setContent:', {
          inputHTML: overlayHtml.substring(0, 200),
          currentHTML: editor.getHTML().substring(0, 200),
        });
        editor.commands.setContent(overlayHtml);
      }
    }
  }, [overlayId, editor]); // overlayHtml dependency removed to prevent loop

  const handleFontSize = (size) => {
    editor?.chain().focus().setMark("fontSize", { size }).run();
  };

  const handleTextColor = (color) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      alert("Lütfen rengi değiştirmek istediğiniz metni seçin!");
      return;
    }
    
    console.log('🎨 handleTextColor:', color);
    editor.chain()
      .focus()
      .setInlineColor(color)
      .run();
    
    // Hemen sonra state check
    console.log('📊 State after setInlineColor:');
    editor.state.doc.nodesBetween(from, to, (node, pos) => {
      console.log('  Node:', node.type.name, 'Marks:', node.marks);
    });
  };

  const handleTextAlign = (align) => {
    editor?.chain().focus().setTextAlign(align).run();
  };

  if (!editor) return null;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Başlık - Professional Gradient Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-red-600 border-b border-rose-500/20 shadow-[0_4px_12px_rgba(225,29,72,0.15)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/30 shadow-inner">
            <Type size={18} className="drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Metin Düzenle</h3>
            <p className="text-[10px] text-rose-100/80 font-medium">İçerik stili ve biçimlendirme</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all duration-200"
        >
          <X size={18} />
        </button>
      </div>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-20">

        {/* EDITOR ALANI */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">İçerik</label>
          <div className="border border-slate-200/60 rounded-xl p-3 bg-white/50 backdrop-blur-sm shadow-sm min-h-[120px] focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-300 transition-all duration-300">
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none focus:outline-none"
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            />
          </div>
        </div>

        {/* Araç Grupları */}
        <div className="space-y-4">

          {/* Stil Düğmeleri */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2 block">Temel Stil</label>
            <div className="flex gap-2 bg-neutral-50 p-1 rounded-lg border border-neutral-100">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`flex-1 p-2 rounded-lg transition-all duration-300 ${editor.isActive("bold")
                  ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25 border-transparent scale-105"
                  : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200/60 hover:shadow-sm"
                  }`}
                title="Kalın"
              >
                <Bold size={16} className="mx-auto" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`flex-1 p-2 rounded-lg transition-all duration-300 ${editor.isActive("italic")
                  ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25 border-transparent scale-105"
                  : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200/60 hover:shadow-sm"
                  }`}
                title="İtalik"
              >
                <Italic size={16} className="mx-auto" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`flex-1 p-2 rounded-lg transition-all duration-300 ${editor.isActive("underline")
                  ? "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25 border-transparent scale-105"
                  : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200/60 hover:shadow-sm"
                  }`}
                title="Altı Çizili"
              >
                <Underline size={16} className="mx-auto" />
              </button>

              <button
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  setTimeout(() => {
                    onChange(editor.getHTML());
                  }, 10);
                }}
                className={`flex-1 p-2 rounded-lg transition-all duration-300 ${editor.isActive("heading", { level: 2 })
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/30 border-transparent scale-105"
                  : "text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200/60 hover:shadow-sm"
                  }`}
                title="Başlık Yap"
              >
                <Heading2 size={16} className="mx-auto" />
              </button>
            </div>
          </div>

          {/* Hizalama */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2 block">Hizalama</label>
            <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
              <button
                onClick={() => handleTextAlign("left")}
                className={`flex-1 p-2 rounded-lg transition-all duration-300 ${editor.isActive({ textAlign: "left" })
                  ? "bg-white text-rose-600 shadow-md border-rose-100 scale-105"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
              >
                <AlignLeft size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => handleTextAlign("center")}
                className={`flex-1 p-2 rounded-lg transition-all duration-300 ${editor.isActive({ textAlign: "center" })
                  ? "bg-white text-rose-600 shadow-md border-rose-100 scale-105"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
              >
                <AlignCenter size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => handleTextAlign("right")}
                className={`flex-1 p-2 rounded-lg transition-all duration-300 ${editor.isActive({ textAlign: "right" })
                  ? "bg-white text-rose-600 shadow-md border-rose-100 scale-105"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }`}
              >
                <AlignRight size={16} className="mx-auto" />
              </button>
            </div>
          </div>

          {/* Listeler */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2 block">Listeler</label>
            <div className="flex gap-2 bg-neutral-50 p-1 rounded-lg border border-neutral-100">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`flex-1 p-2 rounded-md transition-all ${editor.isActive("bulletList")
                  ? "bg-neutral-100 text-neutral-900 shadow-inner border border-neutral-200"
                  : "text-neutral-500 hover:bg-white hover:text-neutral-700"
                  }`}
              >
                <List size={16} className="mx-auto" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`flex-1 p-2 rounded-md transition-all ${editor.isActive("orderedList")
                  ? "bg-neutral-100 text-neutral-900 shadow-inner border border-neutral-200"
                  : "text-neutral-500 hover:bg-white hover:text-neutral-700"
                  }`}
              >
                <ListOrdered size={16} className="mx-auto" />
              </button>
            </div>
          </div>

          {/* Font Boyutu */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2 block">Font Boyutu</label>
            <div className="grid grid-cols-4 gap-2">
              {["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"].map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSize(size)}
                  className="py-1.5 bg-white border border-neutral-200 rounded hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 text-xs font-medium transition text-neutral-600"
                >
                  {size.replace("px", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Renk Seçimi */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2 block">Renk & Vurgu</label>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 flex items-center gap-2 border border-neutral-200 rounded-lg p-1.5 bg-white">
                <input
                  type="color"
                  defaultValue="#000000"
                  onChange={(e) => handleTextColor(e.target.value)}
                  className="w-8 h-8 rounded-md cursor-pointer border-none bg-transparent"
                />
                <span className="text-xs text-neutral-500">Yazı</span>
              </div>
              <div className="flex-1 flex items-center gap-2 border border-neutral-200 rounded-lg p-1.5 bg-white">
                <input
                  type="color"
                  defaultValue="#FFFF00"
                  onChange={(e) => {
                    editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
                  }}
                  className="w-8 h-8 rounded-md cursor-pointer border-none bg-transparent"
                />
                <span className="text-xs text-neutral-500">Vurgu</span>
              </div>
            </div>

            {/* Hızlı Renkler */}
            <div className="flex gap-1.5 flex-wrap">
              {["#000000", "#DC2626", "#2563EB", "#16A34A", "#CA8A04", "#9333EA"].map((color) => (
                <button
                  key={color}
                  onClick={() => handleTextColor(color)}
                  className="w-6 h-6 rounded-full border border-neutral-100 hover:scale-110 transition shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={() => handleTextColor('#000000')}
                className="h-6 px-2 rounded-full border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-600 hover:bg-neutral-100 flex items-center"
              >
                Sıfırla
              </button>
            </div>
          </div>

          {/* Matematik */}
          <div className="pt-2 border-t border-neutral-200">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-2 block">Matematik</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenEquationEditor}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-br from-violet-500 to-purple-600 border border-violet-400/30 rounded-xl hover:shadow-lg hover:shadow-violet-500/20 text-xs font-bold text-white transition-all duration-300 hover:-translate-y-0.5"
              >
                <Sigma size={14} />
                Denklem
              </button>

              <button
                onClick={onOpenMathSymbolPanel}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 text-xs font-bold text-orange-700 transition"
              >
                <PenTool size={14} />
                Sembol
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
