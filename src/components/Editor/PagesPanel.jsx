import { useState } from "react";
import { FileEdit, Layout, Plus } from "lucide-react";

export default function PagesPanel({ pages, activePageId, onSelectPage, onAddPage, onChangePageMode }) {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, pageId: null });

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

  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <>
      <div className="w-52 h-full bg-gray-50 border-r border-gray-200 flex flex-col"
        onClick={() => {
          setContextMenu({ visible: false, x: 0, y: 0, pageId: null });
          setShowAddMenu(false);
        }}
      >
        <div className="p-4 pb-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-700">Sayfalar</h2>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu(!showAddMenu);
                }}
                className="p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition-all"
                title="Yeni Sayfa Ekle"
              >
                <Plus size={18} />
              </button>
              
              {showAddMenu && (
                <div
                  className="absolute top-full right-0 mt-1 bg-white border shadow-lg rounded text-sm z-[9999] whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50"
                    onClick={() => {
                      onAddPage("document");
                      setShowAddMenu(false);
                    }}
                  >
                    <FileEdit size={14} className="text-blue-500" />
                    Belge Sayfası
                  </button>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-purple-50"
                    onClick={() => {
                      onAddPage("free");
                      setShowAddMenu(false);
                    }}
                  >
                    <Layout size={14} className="text-purple-500" />
                    Serbest Sayfa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="flex flex-col gap-2.5">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onSelectPage(page.id)}
                onContextMenu={(e) => handleContextMenu(e, page.id)}
                className={`w-full h-24 border-2 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-150 relative ${
                  page.id === activePageId
                    ? "bg-blue-500 border-blue-500 text-white shadow-lg"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                <div className="absolute top-2 right-2">
                  {page.mode === "document" ? (
                    <FileEdit size={14} className={page.id === activePageId ? "text-white" : "text-blue-500"} />
                  ) : (
                    <Layout size={14} className={page.id === activePageId ? "text-white" : "text-purple-500"} />
                  )}
                </div>
                {page.title}
                <span className={`text-[10px] mt-1 ${
                  page.id === activePageId ? "text-blue-100" : "text-gray-500"
                }`}>
                  {page.mode === "document" ? "Belge" : "Serbest"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {contextMenu.visible && (
        <div
          className="fixed bg-white border shadow-lg rounded text-sm z-[9999]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50"
            onClick={() => handleChangeMode("document")}
          >
            <FileEdit size={14} className="text-blue-500" />
            Belge Moduna Çevir
          </button>
          <button
            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-purple-50"
            onClick={() => handleChangeMode("free")}
          >
            <Layout size={14} className="text-purple-500" />
            Serbest Moda Çevir
          </button>
        </div>
      )}
    </>
  );
}
