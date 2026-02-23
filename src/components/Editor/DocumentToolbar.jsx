// src/components/Editor/DocumentToolbar.jsx
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Columns,
  Undo,
  Redo,
  Sigma,
  PenTool,
  Table,
  Plus,
  Trash2,
  Merge,
  Split,
  Palette,
  Baseline,
} from "lucide-react";

export default function DocumentToolbar({
  editor,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
  // Serbest mod için grid kontrolleri
  showGridControls = false,
  showGrid,
  setShowGrid,
  snapEnabled,
  setSnapEnabled,
  gridSize,
  setGridSize,
  zoom,
  setZoom,
  showGuides,
  setShowGuides,
}) {
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);

  if (!editor) return null;

  // Debug grid props
  useEffect(() => {
    if (showGridControls) {
      console.log('🎛️ DocumentToolbar Grid Props:', {
        showGrid,
        snapEnabled,
        gridSize,
        zoom,
        showGuides,
        setZoom: typeof setZoom,
      });
    }
  }, [showGridControls, showGrid, snapEnabled, gridSize, zoom, showGuides, setZoom]);

  const toggleTwoColumns = () => {
    const currentClasses = editor.getAttributes('paragraph').class || '';
    if (currentClasses.includes('two-columns')) {
      editor.chain().focus().unsetMark('textStyle').run();
      editor.commands.setNode('paragraph', { class: '' });
    } else {
      editor.commands.setNode('paragraph', { class: 'two-columns' });
    }
  };

  return (
    <div className="document-toolbar">
      {/* History */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="toolbar-btn"
          title="Geri Al (Ctrl+Z)"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="toolbar-btn"
          title="Yinele (Ctrl+Y)"
        >
          <Redo size={16} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Headings */}
      <div className="toolbar-group">
        <button
          onClick={() => {
            console.log('🟡 H1 düğmesine basıldı');
            console.log('🟡 Heading extension aktif mi:', editor.extensionManager.extensions.find(e => e.name === 'heading'));
            console.log('🟡 Şu an heading aktif mi:', editor.isActive('heading', { level: 1 }));
            editor.chain().focus().toggleHeading({ level: 1 }).run();
            console.log('🟡 İşlem sonrası heading aktif mi:', editor.isActive('heading', { level: 1 }));
          }}
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Başlık 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => {
            console.log('🟡 H2 düğmesine basıldı');
            editor.chain().focus().toggleHeading({ level: 2 }).run();
            console.log('🟡 İşlem sonrası heading aktif mi:', editor.isActive('heading', { level: 2 }));
          }}
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Başlık 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => {
            console.log('🟡 H3 düğmesine basıldı');
            editor.chain().focus().toggleHeading({ level: 3 }).run();
            console.log('🟡 İşlem sonrası heading aktif mi:', editor.isActive('heading', { level: 3 }));
          }}
          className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          title="Başlık 3"
        >
          <Heading3 size={16} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          onClick={() => {
            console.log('🔴 Bold düğmesine basıldı');
            console.log('🔴 Editor:', editor);
            console.log('🔴 Editor selection:', editor.state.selection);
            console.log('🔴 Seçili metin:', editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ''));
            editor.chain().focus().toggleBold().run();
          }}
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Kalın (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="İtalik (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="Alt Çizgi (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Metin Rengi */}
      <div className="toolbar-group">
        <div className="relative group">
          <button
            className="toolbar-btn flex flex-col items-center justify-center pt-1"
            title="Metin Rengi"
            onClick={(e) => {
              e.currentTarget.nextElementSibling?.click();
            }}
          >
            <Baseline size={16} />
            <div
              className="w-3 h-0.5 mt-0.5 rounded-full"
              style={{ backgroundColor: editor.getAttributes('inlineColor').color || '#000000' }}
            ></div>
          </button>
          <input
            type="color"
            value={editor.getAttributes('inlineColor').color || '#000000'}
            onChange={(e) => {
              editor.chain().focus().setInlineColor(e.target.value).run();
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Metin Rengi Seç"
          />
        </div>

        <div className="relative">
          <button
            className="toolbar-btn flex flex-col items-center justify-center pt-1"
            title="Vurgu Rengi"
            onClick={() => setHighlightMenuOpen(!highlightMenuOpen)}
          >
            <Palette size={16} className="text-amber-500" />
            <div
              className="w-3 h-0.5 mt-0.5 rounded-full"
              style={{ backgroundColor: editor.getAttributes('highlight').color || '#fef08a' }}
            ></div>
          </button>

          {highlightMenuOpen && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg p-2 flex gap-1 z-[9999]"
              onMouseLeave={() => setHighlightMenuOpen(false)}
            >
              {[
                '#fef08a',
                '#bbf7d0',
                '#bfdbfe',
                '#fbcfe8',
                '#fed7aa',
                '#a5f3fc',
              ].map(color => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setHighlight({ color }).run();
                    setHighlightMenuOpen(false);
                  }}
                  className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setHighlightMenuOpen(false);
                }}
                className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                title="Vurguyu Kaldır"
              >
                <div className="w-4 h-[1px] bg-red-500 rotate-45"></div>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            editor.chain().focus().unsetInlineColor().unsetHighlight().run();
          }}
          className="toolbar-btn text-gray-400 hover:text-red-500"
          title="Renkleri Temizle"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Alignment */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          title="Sola Hizala"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          title="Ortala"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          title="Sağa Hizala"
        >
          <AlignRight size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
          title="İki Yana Yasla"
        >
          <AlignJustify size={16} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Lists */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Madde İşareti"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Numaralı Liste"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Two Columns */}
      <div className="toolbar-group">
        <button
          onClick={toggleTwoColumns}
          className={`toolbar-btn ${editor.getAttributes('paragraph').class?.includes('two-columns') ? 'active' : ''}`}
          title="İki Sütun"
        >
          <Columns size={16} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Tablo İşlemleri */}
      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="toolbar-btn"
          title="Tablo Ekle"
        >
          <Table size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.isActive("table")}
          className={`toolbar-btn ${editor.isActive("table") ? '' : 'opacity-40'}`}
          title="Üste Satır Ekle"
        >
          <Plus size={14} />
          <span className="text-[10px] ml-0.5">↑</span>
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.isActive("table")}
          className={`toolbar-btn ${editor.isActive("table") ? '' : 'opacity-40'}`}
          title="Alta Satır Ekle"
        >
          <Plus size={14} />
          <span className="text-[10px] ml-0.5">↓</span>
        </button>
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.isActive("table")}
          className={`toolbar-btn ${editor.isActive("table") ? 'text-red-600' : 'opacity-40'}`}
          title="Satır Sil"
        >
          <Trash2 size={14} />
          <span className="text-[10px] ml-0.5">─</span>
        </button>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.isActive("table")}
          className={`toolbar-btn ${editor.isActive("table") ? '' : 'opacity-40'}`}
          title="Sola Sütun Ekle"
        >
          <Plus size={14} />
          <span className="text-[10px] ml-0.5">←</span>
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.isActive("table")}
          className={`toolbar-btn ${editor.isActive("table") ? '' : 'opacity-40'}`}
          title="Sağa Sütun Ekle"
        >
          <Plus size={14} />
          <span className="text-[10px] ml-0.5">→</span>
        </button>
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.isActive("table")}
          className={`toolbar-btn ${editor.isActive("table") ? 'text-red-600' : 'opacity-40'}`}
          title="Sütun Sil"
        >
          <Trash2 size={14} />
          <span className="text-[10px] ml-0.5">│</span>
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Tablo Genişlik Kontrolü */}
      {editor.isActive("table") && (
        <div className="toolbar-group">
          <select
            onChange={(e) => {
              const width = e.target.value;
              // Tabloyu seç ve genişlik ayarla
              const { state } = editor;
              const { selection } = state;
              const table = selection.$anchor.node(-1);

              if (table && table.type.name === 'table') {
                // CSS class ekleyerek genişlik ayarla
                editor.commands.command(({ tr, state }) => {
                  const pos = selection.$anchor.before(-1);
                  tr.setNodeMarkup(pos, null, { ...table.attrs, class: width });
                  return true;
                });
              }
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
            title="Tablo Genişliği"
          >
            <option value="">Tablo Genişliği</option>
            <option value="table-width-25">25%</option>
            <option value="table-width-50">50%</option>
            <option value="table-width-75">75%</option>
            <option value="table-width-100">100% (Tam)</option>
            <option value="table-width-auto">Otomatik</option>
          </select>
        </div>
      )}

      <div className="toolbar-separator"></div>

      <div className="toolbar-group">
        <button
          onClick={() => editor.chain().focus().mergeCells().run()}
          disabled={!editor.can().mergeCells()}
          className={`toolbar-btn ${editor.can().mergeCells() ? 'text-green-600' : 'opacity-40'}`}
          title="Hücreleri Birleştir"
        >
          <Merge size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().splitCell().run()}
          disabled={!editor.can().splitCell()}
          className={`toolbar-btn ${editor.can().splitCell() ? 'text-green-600' : 'opacity-40'}`}
          title="Hücreyi Böl"
        >
          <Split size={14} />
        </button>
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.isActive("table")}
          className={`toolbar-btn ${editor.isActive("table") ? 'text-red-700 font-bold' : 'opacity-40'}`}
          title="Tabloyu Sil"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="toolbar-separator"></div>

      {/* Matematik */}
      <div className="toolbar-group">
        <button
          onClick={onOpenEquationEditor}
          className="toolbar-btn"
          title="Denklem Ekle"
        >
          <Sigma size={16} />
        </button>
        <button
          onClick={onOpenMathSymbolPanel}
          className="toolbar-btn"
          title="Sembol Ekle"
        >
          <PenTool size={16} />
        </button>
      </div>

      {/* Grid Kontrolleri - Sadece Serbest Mod */}
      {showGridControls && (
        <>
          <div className="toolbar-separator"></div>
          <div className="toolbar-group" style={{ gap: '6px' }}>
            <button
              onClick={() => setShowGrid?.(!showGrid)}
              className={`toolbar-btn-extended ${showGrid ? 'active' : ''}`}
              title="Grid göster/gizle"
            >
              ⌘ Grid
            </button>
            <button
              onClick={() => setSnapEnabled?.(!snapEnabled)}
              className={`toolbar-btn-extended ${snapEnabled ? 'active' : ''}`}
              title="Grid'e yapışmayı aç/kapat"
            >
              🧲 Snap
            </button>
            <select
              value={gridSize}
              onChange={(e) => setGridSize?.(Number(e.target.value))}
              className="toolbar-select"
              title="Grid boyutu"
            >
              <option value={5}>5px</option>
              <option value={10}>10px</option>
              <option value={20}>20px</option>
              <option value={25}>25px</option>
              <option value={50}>50px</option>
            </select>
            <button
              onClick={() => setShowGuides?.(!showGuides)}
              className={`toolbar-btn-extended ${showGuides ? 'active' : ''}`}
              title="Rehber çizgileri göster/gizle"
            >
              📐 Guide
            </button>
          </div>
          <div className="toolbar-separator"></div>
          <div className="toolbar-group" style={{ gap: '4px' }}>
            {/* Zoom kontrolleri kaldırıldı - Otomatik fit yapılacak */}
            <span style={{ fontSize: '11px', color: '#a3a3a3', minWidth: '40px', textAlign: 'center', userSelect: 'none' }}>
              Otomatik
            </span>
          </div>
        </>
      )}

      <style jsx>{`
        .document-toolbar {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px 8px;
          background: #fafafa;
          border-bottom: 1px solid #e0e0e0;
          position: sticky;
          top: 0;
          z-index: 0;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          min-height: 36px;
          width: 100%;
        }

        .toolbar-group {
          display: flex;
          gap: 1px;
        }

        .toolbar-separator {
          width: 1px;
          height: 20px;
          background: #d4d4d4;
          margin: 0 6px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          border-radius: 3px;
          cursor: pointer;
          color: #525252;
          transition: all 0.1s;
          font-size: 14px;
        }

        .toolbar-btn:hover:not(:disabled) {
          background: #e5e5e5;
          color: #262626;
        }

        .toolbar-btn.active {
          background: #d4d4d4;
          color: #171717;
        }

        .toolbar-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .toolbar-btn-extended {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          height: 28px;
          border: none;
          background: #f5f5f5;
          border-radius: 3px;
          cursor: pointer;
          color: #525252;
          transition: all 0.1s;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .toolbar-btn-extended:hover {
          background: #e5e5e5;
          color: #262626;
        }

        .toolbar-btn-extended.active {
          background: #3b82f6;
          color: white;
        }

        .toolbar-select {
          height: 28px;
          border: 1px solid #d4d4d4;
          border-radius: 3px;
          padding: 0 6px;
          font-size: 11px;
          background: white;
          color: #525252;
          cursor: pointer;
          outline: none;
        }

        .toolbar-select:hover {
          border-color: #a3a3a3;
        }

        .toolbar-select:focus {
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
