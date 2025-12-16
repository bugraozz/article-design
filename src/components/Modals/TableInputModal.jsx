/**
 * Table Input Modal
 * Tablo boyutu giriş modalı - PowerPoint tarzı
 */

import React, { useState } from "react";
import { X } from "lucide-react";

export default function TableInputModal({
  isOpen = false,
  onClose = () => {},
  onInsert = () => {},
}) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (rows > 0 && cols > 0 && rows <= 20 && cols <= 20) {
      onInsert(rows, cols);
      // Reset
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
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            Tablo Ekle
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="table-rows"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Satır Sayısı (1-20)
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
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="table-cols"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Sütun Sayısı (1-20)
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
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

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
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            İptal
          </button>
          <button
            onClick={handleInsert}
            disabled={rows < 1 || cols < 1 || rows > 20 || cols > 20}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              background: rows > 0 && cols > 0 && rows <= 20 && cols <= 20 ? "#3b82f6" : "#9ca3af",
              color: "white",
              cursor: rows > 0 && cols > 0 && rows <= 20 && cols <= 20 ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}
