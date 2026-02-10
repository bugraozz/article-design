// src/components/Modals/TableStyleModal.jsx
// Word-like table style selection modal

import React, { useState } from "react";
import { X } from "lucide-react";
import { TABLE_STYLES } from "../../types/tableStyles";

export default function TableStyleModal({
  isOpen = false,
  onClose = () => {},
  onSelect = () => {},
}) {
  const [selectedStyle, setSelectedStyle] = useState('tableGrid');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (rows > 0 && cols > 0 && rows <= 20 && cols <= 20) {
      onSelect(selectedStyle, rows, cols);
      // Reset
      setSelectedStyle('tableGrid');
      setRows(3);
      setCols(3);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleInsert();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "800px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
              Tablo Stili Seç
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
              Word benzeri hazır tablo stilleri
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
            onMouseLeave={(e) => e.target.style.background = "none"}
          >
            <X size={24} color="#6b7280" />
          </button>
        </div>

        {/* Table Size Inputs */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="table-rows"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Satır Sayısı
            </label>
            <input
              id="table-rows"
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              onKeyPress={handleKeyPress}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="table-cols"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Sütun Sayısı
            </label>
            <input
              id="table-cols"
              type="number"
              min="1"
              max="20"
              value={cols}
              onChange={(e) => setCols(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              onKeyPress={handleKeyPress}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
        </div>

        {/* Style Grid */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#374151", marginBottom: "16px" }}>
            Stil Seçin
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            {Object.values(TABLE_STYLES).map((style) => (
              <div
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                style={{
                  padding: "16px",
                  border: selectedStyle === style.id ? "3px solid #3b82f6" : "2px solid #e5e7eb",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: selectedStyle === style.id ? "#eff6ff" : "white",
                  boxShadow: selectedStyle === style.id ? "0 4px 12px rgba(59, 130, 246, 0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) => {
                  if (selectedStyle !== style.id) {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStyle !== style.id) {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    textAlign: "center",
                    marginBottom: "8px",
                  }}
                >
                  {style.preview}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#1f2937",
                    textAlign: "center",
                    marginBottom: "4px",
                  }}
                >
                  {style.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  {style.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px" }}>
            Önizleme ({rows}x{cols})
          </h3>
          <div style={{ overflow: "auto" }}>
            <table
              style={{
                ...TABLE_STYLES[selectedStyle].styles.table,
                fontSize: "12px",
              }}
            >
              <tbody>
                {Array(Math.min(rows, 4)).fill(null).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {Array(Math.min(cols, 5)).fill(null).map((_, colIdx) => {
                      const isHeader = rowIdx === 0 && TABLE_STYLES[selectedStyle].headerRow;
                      const isAlternate = TABLE_STYLES[selectedStyle].styles.alternateRow && rowIdx % 2 === 0;
                      const cellStyle = isHeader 
                        ? TABLE_STYLES[selectedStyle].styles.header
                        : isAlternate && TABLE_STYLES[selectedStyle].styles.cellAlt
                          ? TABLE_STYLES[selectedStyle].styles.cellAlt
                          : TABLE_STYLES[selectedStyle].styles.cell;
                      
                      const CellTag = isHeader ? 'th' : 'td';
                      
                      return (
                        <CellTag
                          key={colIdx}
                          style={{
                            ...cellStyle,
                            padding: "8px",
                            minWidth: "60px",
                          }}
                        >
                          {isHeader ? `Başlık ${colIdx + 1}` : `${rowIdx},${colIdx + 1}`}
                        </CellTag>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(rows > 4 || cols > 5) && (
            <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "8px", fontStyle: "italic" }}>
              * Önizleme maksimum 4x5 gösterir
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
              e.target.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.borderColor = "#e5e7eb";
            }}
          >
            İptal
          </button>
          <button
            onClick={handleInsert}
            disabled={rows < 1 || cols < 1 || rows > 20 || cols > 20}
            style={{
              padding: "10px 24px",
              border: "none",
              borderRadius: "8px",
              background: rows > 0 && cols > 0 && rows <= 20 && cols <= 20 
                ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                : "#9ca3af",
              color: "white",
              cursor: rows > 0 && cols > 0 && rows <= 20 && cols <= 20 ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow: rows > 0 && cols > 0 && rows <= 20 && cols <= 20 
                ? "0 4px 12px rgba(59, 130, 246, 0.3)" 
                : "none",
            }}
            onMouseEnter={(e) => {
              if (rows > 0 && cols > 0 && rows <= 20 && cols <= 20) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (rows > 0 && cols > 0 && rows <= 20 && cols <= 20) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
              }
            }}
          >
            Tablo Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}
