import { useState } from "react";
import { FileEdit, Layout, Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";

export default function PagesPanel({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onChangePageMode,
  onDeletePage,
  onMovePage,
  onReorderPages
}) {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, pageId: null });
  const [draggedItemId, setDraggedItemId] = useState(null);

  const handleContextMenu = (e, pageId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      pageId
    });
  };

  const handleChangeMode = (mode) => {
    if (contextMenu.pageId && onChangePageMode) {
      onChangePageMode(contextMenu.pageId, mode);
    }
    setContextMenu({ visible: false, x: 0, y: 0, pageId: null });
  };

  const handleDeletePage = () => {
    if (contextMenu.pageId && onDeletePage) {
      if (confirm(`Sayfa silinecek. Emin misiniz?`)) {
        onDeletePage(contextMenu.pageId);
      }
    }
    setContextMenu({ visible: false, x: 0, y: 0, pageId: null });
  };

  const handleMove = (direction) => {
    if (contextMenu.pageId && onMovePage) {
      onMovePage(contextMenu.pageId, direction);
    }
    setContextMenu({ visible: false, x: 0, y: 0, pageId: null });
  };

  const handleInsertPage = (templateKey) => {
    if (contextMenu.pageId && onAddPage) {
      const index = pages.findIndex(p => p.id === contextMenu.pageId);
      onAddPage(templateKey, index);
    }
    setContextMenu({ visible: false, x: 0, y: 0, pageId: null });
  };

  // Drag and Drop
  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    if (draggedItemId === targetId) return;

    const draggedIndex = pages.findIndex(p => p.id === draggedItemId);
    const targetIndex = pages.findIndex(p => p.id === targetId);

    const newPages = [...pages];
    const [draggedItem] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, draggedItem);

    if (onReorderPages) onReorderPages(newPages);
  };

  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <>
      <div className="w-64 bg-white/40 backdrop-blur-md flex flex-col h-full border-r border-slate-200/50"
        onClick={() => {
          setContextMenu({ visible: false, x: 0, y: 0, pageId: null });
          setShowAddMenu(false);
        }}
      >
        <div className="p-5 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sayfalar</h2>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu(!showAddMenu);
                }}
                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                title="Yeni Sayfa Ekle"
              >
                <Plus size={18} />
              </button>

              {showAddMenu && (
                <div
                  className="absolute top-full right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl text-sm z-[9999] overflow-hidden min-w-[160px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-600 font-medium"
                    onClick={() => {
                      onAddPage("document");
                      setShowAddMenu(false);
                    }}
                  >
                    <FileEdit size={16} className="text-blue-500" />
                    Belge Sayfası
                  </button>
                  <button
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-600 font-medium border-t border-slate-100"
                    onClick={() => {
                      onAddPage("free");
                      setShowAddMenu(false);
                    }}
                  >
                    <Layout size={16} className="text-purple-500" />
                    Serbest Sayfa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          <div className="flex flex-col gap-4">
            {pages.map((page, index) => (
              <div
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, page.id)}
                onDragOver={(e) => handleDragOver(e, page.id)}
                className="group relative"
              >
                <button
                  onClick={() => onSelectPage(page.id)}
                  onContextMenu={(e) => handleContextMenu(e, page.id)}
                  className={`w-full group flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 relative aspect-[1/1.41] shadow-sm ${page.id === activePageId
                    ? "bg-white border-rose-500 shadow-rose-100 scale-[1.02]"
                    : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                    }`}
                >
                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab">
                    <GripVertical size={14} />
                  </div>

                  <div className="absolute top-2 right-2">
                    {page.mode === "document" ? (
                      <FileEdit size={14} className={page.id === activePageId ? "text-rose-500" : "text-slate-400"} />
                    ) : (
                      <Layout size={14} className={page.id === activePageId ? "text-rose-500" : "text-slate-400"} />
                    )}
                  </div>

                  <span className={`text-[10px] font-black uppercase mb-1 ${page.id === activePageId ? "text-rose-500" : "text-slate-400"}`}>
                    SAYFA {index + 1}
                  </span>

                  <div className={`w-10 h-1 rounded-full ${page.id === activePageId ? "bg-rose-500" : "bg-slate-100"}`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {contextMenu.visible && (
        <div
          className="fixed bg-white border border-slate-200 shadow-2xl rounded-xl text-sm z-[9999] overflow-hidden min-w-[200px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Sayfa Ayarları</div>

          <button
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-600 font-medium"
            onClick={() => handleMove("up")}
            disabled={pages.findIndex(p => p.id === contextMenu.pageId) === 0}
          >
            <ChevronUp size={16} className="text-slate-400" />
            Yukarı Taşı
          </button>
          <button
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-600 font-medium"
            onClick={() => handleMove("down")}
            disabled={pages.findIndex(p => p.id === contextMenu.pageId) === pages.length - 1}
          >
            <ChevronDown size={16} className="text-slate-400" />
            Aşağı Taşı
          </button>

          <div className="border-t border-slate-100"></div>
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Araya Ekle</div>

          <button
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-blue-50 text-blue-600 font-medium"
            onClick={() => handleInsertPage("document")}
          >
            <Plus size={16} />
            Belge Sayfası Ekle
          </button>
          <button
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-purple-50 text-purple-600 font-medium"
            onClick={() => handleInsertPage("free")}
          >
            <Plus size={16} />
            Serbest Sayfa Ekle
          </button>

          <div className="border-t border-slate-100"></div>

          <button
            className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-medium"
            onClick={handleDeletePage}
          >
            <Trash2 size={16} className="text-rose-500" />
            Sayfayı Sil
          </button>
        </div>
      )}
    </>
  );
}
