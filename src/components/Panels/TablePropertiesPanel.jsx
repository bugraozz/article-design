import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
    <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Tablo Özellikleri</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        {/* TABLO GENİŞLİĞİ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tablo Genişliği: {tableWidth}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={tableWidth}
            onChange={(e) => handleTableWidth(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* HÜCRE PADDING */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hücre İç Boşluğu: {cellPadding}px
          </label>
          <input
            type="range"
            min="4"
            max="24"
            value={cellPadding}
            onChange={(e) => handleCellPadding(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* BORDER GENİŞLİĞİ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kenar Kalınlığı: {borderWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="4"
            value={borderWidth}
            onChange={(e) => handleBorderWidth(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* BORDER RENGİ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kenar Rengi
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={borderColor}
              onChange={(e) => handleBorderColor(e.target.value)}
              className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
            />
            <span className="text-sm text-gray-600">{borderColor}</span>
          </div>
        </div>

        {/* HÜCRE ARKA PLAN RENGİ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hücre Arka Planı
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => handleCellBgColor(e.target.value)}
              className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
            />
            <span className="text-sm text-gray-600">{bgColor}</span>
          </div>
        </div>

        {/* HEADER ARKA PLAN RENGİ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Başlık Arka Planı
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={headerBgColor}
              onChange={(e) => handleHeaderBgColor(e.target.value)}
              className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
            />
            <span className="text-sm text-gray-600">{headerBgColor}</span>
          </div>
        </div>

        {/* TABLO İŞLEMLERİ */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Tablo İşlemleri</h4>
          <div className="space-y-2">
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
            >
              ➕ Satır Ekle
            </button>

            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-sm"
            >
              ➕ Sütun Ekle
            </button>

            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm"
            >
              ➖ Satır Sil
            </button>

            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm"
            >
              ➖ Sütun Sil
            </button>

            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="w-full px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition font-medium text-sm"
            >
              🗑️ Tabloyu Sil
            </button>
          </div>
        </div>

        {/* TABLO HÜCRE İŞLEMLERİ */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Hücre İşlemleri</h4>
          <div className="space-y-2">
            <button
              onClick={() => editor.chain().focus().mergeCells().run()}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!editor.can().mergeCells()}
            >
              🔗 Hücreleri Birleştir
            </button>

            <button
              onClick={() => editor.chain().focus().splitCell().run()}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!editor.can().splitCell()}
            >
              ✂️ Hücreyi Böl
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
