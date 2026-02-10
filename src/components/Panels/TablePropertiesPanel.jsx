import { useState, useEffect } from "react";
import { ChevronDown, Table, Trash2, Plus, Minus, X, Merge, Split } from "lucide-react";

export default function TablePropertiesPanel({
  overlayId,
  editor,
  onChange,
  onClose,
}) {
  const [tableWidth, setTableWidth] = useState(100);
  const [cellPadding, setCellPadding] = useState(12);
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderColor, setBorderColor] = useState("#d1d5db");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [headerBgColor, setHeaderBgColor] = useState("#f3f4f6");

  if (!editor || !editor.isActive("table")) {
    return null;
  }

  // Tablo genişliğini güncelle
  const handleTableWidth = (width) => {
    setTableWidth(width);
    const tables = editor.view.dom.querySelectorAll("table");
    tables.forEach((table) => {
      table.style.width = width + "%";
    });
  };

  // Hücre padding'ini güncelle
  const handleCellPadding = (padding) => {
    setCellPadding(padding);
    const cells = editor.view.dom.querySelectorAll("table td, table th");
    cells.forEach((cell) => {
      cell.style.padding = padding + "px";
    });
  };

  // Border genişliğini güncelle
  const handleBorderWidth = (width) => {
    setBorderWidth(width);
    const tables = editor.view.dom.querySelectorAll("table");
    tables.forEach((table) => {
      table.style.borderWidth = width + "px";
      const cells = table.querySelectorAll("td, th");
      cells.forEach((cell) => {
        cell.style.borderWidth = width + "px";
      });
    });
  };

  // Border rengini güncelle
  const handleBorderColor = (color) => {
    setBorderColor(color);
    const tables = editor.view.dom.querySelectorAll("table");
    tables.forEach((table) => {
      table.style.borderColor = color;
      const cells = table.querySelectorAll("td, th");
      cells.forEach((cell) => {
        cell.style.borderColor = color;
      });
    });
  };

  // Hücre arka plan rengini güncelle
  const handleCellBgColor = (color) => {
    setBgColor(color);
    const cells = editor.view.dom.querySelectorAll("table tbody td");
    cells.forEach((cell) => {
      cell.style.backgroundColor = color;
    });
  };

  // Header arka plan rengini güncelle
  const handleHeaderBgColor = (color) => {
    setHeaderBgColor(color);
    const headers = editor.view.dom.querySelectorAll("table thead th");
    headers.forEach((header) => {
      header.style.backgroundColor = color;
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Başlık - Professional Gradient Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-red-600 border-b border-rose-500/20 shadow-[0_4px_12px_rgba(225,29,72,0.15)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/30 shadow-inner">
            <Table size={18} className="drop-shadow-sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Tablo Düzenle</h3>
            <p className="text-[10px] text-rose-100/80 font-medium">Yapı ve Tasarım</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-all duration-200"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-20">

        {/* TABLO GENİŞLİĞİ */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Genişlik</label>
            <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">%{tableWidth}</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={tableWidth}
            onChange={(e) => handleTableWidth(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 shadow-inner"
          />
        </div>

        {/* HÜCRE PADDING */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Hücre Boşluğu</label>
            <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">{cellPadding}px</span>
          </div>
          <input
            type="range"
            min="4"
            max="24"
            value={cellPadding}
            onChange={(e) => handleCellPadding(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-600"
          />
        </div>

        {/* KENARLIK AYARLARI */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide block">Kenarlıklar</label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[9px] text-neutral-400 font-medium block mb-1">Kalınlık ({borderWidth}px)</span>
              <input
                type="range"
                min="1"
                max="4"
                value={borderWidth}
                onChange={(e) => handleBorderWidth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-600"
              />
            </div>
            <div>
              <span className="text-[9px] text-neutral-400 font-medium block mb-1">Renk</span>
              <div className="flex items-center gap-2 border border-neutral-200 rounded-lg p-1 bg-white">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => handleBorderColor(e.target.value)}
                  className="w-6 h-6 rounded border-none p-0 bg-transparent cursor-pointer"
                />
                <span className="text-[10px] text-neutral-500 font-mono uppercase">{borderColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RENK AYARLARI */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide block">Arka Plan Renkleri</label>

          <div className="space-y-2">
            <div className="flex items-center justify-between border border-neutral-200 rounded-lg p-2 bg-white">
              <span className="text-xs text-neutral-600">Hücre Rengi</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => handleCellBgColor(e.target.value)}
                  className="w-6 h-6 rounded border-none p-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border border-neutral-200 rounded-lg p-2 bg-white">
              <span className="text-xs text-neutral-600">Başlık Rengi</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={headerBgColor}
                  onChange={(e) => handleHeaderBgColor(e.target.value)}
                  className="w-6 h-6 rounded border-none p-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLO İŞLEMLERİ */}
        <div className="pt-4 border-t border-neutral-200">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide block mb-3">Yapı</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/50 border border-slate-200/60 rounded-xl hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus size={14} /> Satır Ekle
            </button>

            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/50 border border-slate-200/60 rounded-xl hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus size={14} /> Sütun Ekle
            </button>

            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-neutral-500 text-xs font-medium transition"
            >
              <Minus size={14} /> Satır Sil
            </button>

            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-neutral-500 text-xs font-medium transition"
            >
              <Minus size={14} /> Sütun Sil
            </button>

            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 text-red-600 text-xs font-medium transition mt-1"
            >
              <Trash2 size={14} /> Tabloyu Sil
            </button>
          </div>
        </div>

        {/* HÜCRE İŞLEMLERİ */}
        <div className="pt-4 border-t border-neutral-200">
          <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide block mb-3">Hücre</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => editor.chain().focus().mergeCells().run()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              disabled={!editor.can().mergeCells()}
            >
              <Merge size={14} /> Birleştir
            </button>

            <button
              onClick={() => editor.chain().focus().splitCell().run()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 text-neutral-600 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={!editor.can().splitCell()}
            >
              <Split size={14} /> Böl
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
