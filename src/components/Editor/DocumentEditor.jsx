// src/components/Editor/DocumentEditor.jsx
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TiptapImage from "@tiptap/extension-image";
import { FontSize } from "../../extensions/FontSize";
import { InlineColor } from "../../extensions/InlineColor";
import { MathInline, MathBlock } from "../../extensions/MathExtension";
import DocumentToolbar from "./DocumentToolbar";
import "../../styles/DocumentEditor.css";

export default function DocumentEditor({
  content,
  onChange,
  onEditorReady,
  articleSettings,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
}) {
  const containerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 50,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "tiptap-table-header",
        },
      }),
      TableCell.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            backgroundColor: {
              default: null,
              parseHTML: element => element.style.backgroundColor || null,
              renderHTML: attributes => {
                if (!attributes.backgroundColor) {
                  return {};
                }
                return {
                  style: `background-color: ${attributes.backgroundColor}`,
                };
              },
            },
            color: {
              default: null,
              parseHTML: element => element.style.color || null,
              renderHTML: attributes => {
                if (!attributes.color) {
                  return {};
                }
                return {
                  style: `color: ${attributes.color}`,
                };
              },
            },
          };
        },
      }).configure({
        HTMLAttributes: {
          class: "tiptap-table-cell",
        },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "document-image",
        },
      }),
      FontSize,
      InlineColor,
      MathInline,
      MathBlock,
    ],
    content: content || "<p>Yazmaya başlayın...</p>",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "document-editor-content",
        style: `
          font-size: ${articleSettings.bodyFontSize}px;
          color: ${articleSettings.bodyColor};
          line-height: ${articleSettings.bodyLineHeight};
        `,
      },
    },
  });

  useEffect(() => {
    if (editor) {
      onEditorReady?.(editor);
    }
  }, [editor, onEditorReady]);

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

  // Sayfa yüksekliği hesaplama
  const pageHeight = 1123; // A4 yüksekliği
  const contentHeight = pageHeight - articleSettings.pageMarginTop - articleSettings.pageMarginBottom;

  return (
    <div className="document-editor-wrapper" ref={containerRef}>
        {/* Sayfa Container - Otomatik sayfalara bölünme */}
        <div className="document-pages">
          {/* İlk sayfa */}
          <div className="document-page a4-page">
            <div
              className="document-page-content"
              style={{
                paddingTop: `${articleSettings.pageMarginTop}px`,
                paddingBottom: `${articleSettings.pageMarginBottom}px`,
                paddingLeft: `${articleSettings.pageMarginLeft}px`,
                paddingRight: `${articleSettings.pageMarginRight}px`,
                minHeight: `${contentHeight}px`,
                fontSize: `${articleSettings.bodyFontSize}px`,
                color: articleSettings.bodyColor,
                lineHeight: articleSettings.bodyLineHeight,
              }}
              onContextMenu={handleContextMenu}
            >
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

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

                <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>

                <div style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Hücre Arka Plan Rengi</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['#ffffff', '#f3f4f6', '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#fce7f3'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          console.log('Belge modu: Hücre arka plan rengi değiştiriliyor:', color);
                          editor.chain().focus().setCellAttribute('backgroundColor', color).run();
                          // Menüyü kapatma, kullanıcı birden fazla renk seçebilsin
                        }}
                        disabled={!editor.isActive('table')}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          backgroundColor: color,
                          cursor: editor.isActive('table') ? 'pointer' : 'not-allowed',
                          opacity: editor.isActive('table') ? 1 : 0.5,
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
                        onClick={() => {
                          console.log('Belge modu: Hücre yazı rengi değiştiriliyor:', color);
                          editor.chain().focus().setCellAttribute('color', color).run();
                          // Menüyü kapatma, kullanıcı birden fazla renk seçebilsin
                        }}
                        disabled={!editor.isActive('table')}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                          backgroundColor: color,
                          cursor: editor.isActive('table') ? 'pointer' : 'not-allowed',
                          opacity: editor.isActive('table') ? 1 : 0.5,
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

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

        <style>{`
          .document-editor-content p {
            text-indent: ${articleSettings.paragraphIndent}px;
          }

          .document-editor-content h1 {
            font-size: ${articleSettings.titleFontSize}px;
            color: ${articleSettings.titleColor};
            margin: 1em 0 0.5em 0;
          }

          .document-editor-content h2,
          .document-editor-content h3,
          .document-editor-content h4 {
            color: ${articleSettings.titleColor};
          }

          /* Tablo Wrapper - Sürüklenebilir */
          .tiptap-table-wrapper {
            display: inline-block;
            position: relative;
            margin: 1em 0;
            border: 2px dashed transparent;
            transition: border-color 0.2s, transform 0.05s;
            z-index: 1;
          }

          .tiptap-table-wrapper:hover {
            border-color: #3b82f6;
          }

          .tiptap-table-wrapper.selected {
            border-color: #3b82f6;
            background-color: rgba(59, 130, 246, 0.05);
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .tiptap-table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            overflow: hidden;
            pointer-events: auto;
            cursor: default;
          }

          .tiptap-table-cell {
            border: 1px solid #d1d5db;
            padding: 8px;
            position: relative;
            vertical-align: top;
            box-sizing: border-box;
          }

          .tiptap-table-cell > * {
            margin: 0;
          }

          .tiptap-table th {
            background-color: #f3f4f6;
            font-weight: 600;
            text-align: left;
            border: 1px solid #d1d5db;
            padding: 8px;
          }

          /* PowerPoint tarzı sütun resize handle'ları */
          .tiptap-table .column-resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: 0;
            width: 4px;
            background-color: #3b82f6;
            cursor: col-resize;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.2s;
          }

          .tiptap-table:hover .column-resize-handle {
            opacity: 0.5;
          }

          .tiptap-table .column-resize-handle:hover {
            opacity: 1 !important;
            width: 5px;
          }

          /* Seçili hücre stilleri */
          .tiptap-table .selectedCell {
            background-color: #dbeafe !important;
            position: relative;
            transition: background-color 0.15s ease;
          }

          .tiptap-table .selectedCell::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid #3b82f6;
            pointer-events: none;
            z-index: 1;
          }

          /* Hücre hover efekti */
          .tiptap-table td:hover,
          .tiptap-table th:hover {
            background-color: #f3f4f6;
            cursor: cell;
            transition: background-color 0.15s ease;
          }

          .tiptap-table .selectedCell:hover {
            background-color: #bfdbfe !important;
          }

          /* Sürüklerken seçim efekti */
          .tiptap-table td::selection,
          .tiptap-table th::selection {
            background-color: #dbeafe;
          }

          /* Tablo tutma handle'ı */
          .table-drag-handle {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: #3b82f6;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: move;
            opacity: 0;
            transition: opacity 0.2s;
            user-select: none;
          }

          .tiptap-table-wrapper:hover .table-drag-handle {
            opacity: 1;
          }
        `}</style>
      </div>
  );
}
