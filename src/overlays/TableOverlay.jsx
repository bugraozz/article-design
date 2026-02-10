// src/overlays/TableOverlay.jsx
import { useState, useRef, useEffect, useCallback } from "react";

export default function TableOverlay({
  id,
  x,
  y,
  width,
  height,
  rows = 3,
  cols = 3,
  data = [],
  mergedCells = {}, // { "0-0": { colspan: 2, rowspan: 1 } }
  cellStyles = {}, // { "0-0": { backgroundColor: "#fff", color: "#000" } }
  tableStyle = {}, // Table-level styles from style template
  isActive,
  onClick,
  onRightClick,
  onPositionChange,
  onDataChange,
  onMergedCellsChange,
  onCellEdit, // Yeni: hücre düzenleme callback'i
  showGrid = false,
  gridSize = 20,
  guides = [],
  snapEnabled = true,
  headerRow = true,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState("");
  const [currentSize, setCurrentSize] = useState({ width, height });
  const [isEditingCell, setIsEditingCell] = useState(null);
  const [tableData, setTableData] = useState(data);
  const [selectedCells, setSelectedCells] = useState([]); // [{row, col}]
  const containerRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const UPDATE_THRESHOLD = 50;

  // Debug: cellStyles prop değişikliklerini izle
  useEffect(() => {
    console.log('TableOverlay cellStyles güncellendi:', JSON.stringify(cellStyles, null, 2));
  }, [cellStyles]);

  // Initialize table data if empty
  useEffect(() => {
    if (data.length === 0) {
      const initialData = Array(rows).fill(null).map((_, rowIdx) =>
        Array(cols).fill(null).map((_, colIdx) => {
          if (headerRow && rowIdx === 0) {
            return `Başlık ${colIdx + 1}`;
          }
          return `Hücre ${rowIdx + 1}-${colIdx + 1}`;
        })
      );
      setTableData(initialData);
      onDataChange?.(id, initialData);
    } else {
      setTableData(data);
    }
  }, [data, rows, cols, headerRow, id, onDataChange]);

  useEffect(() => {
    setCurrentSize({ width, height });
  }, [width, height]);

  const snapToGrid = useCallback((value) => {
    console.log('🎯 [TableOverlay] snapToGrid:', { value, snapEnabled, showGrid, gridSize });
    if (!snapEnabled || !showGrid) return value;
    const snapped = Math.round(value / gridSize) * gridSize;
    console.log('🎯 [TableOverlay] snapToGrid result:', snapped);
    return snapped;
  }, [snapEnabled, showGrid, gridSize]);

  const snapToGuides = useCallback((value, isVertical) => {
    if (guides.length === 0) return value;
    const SNAP_DISTANCE = 10;
    const relevantGuides = guides.filter((g) =>
      isVertical ? g.type === "v" : g.type === "h"
    );
    for (const guide of relevantGuides) {
      if (Math.abs(value - guide.position) < SNAP_DISTANCE) {
        return guide.position;
      }
    }
    return value;
  }, [guides]);

  const handleMouseDown = (e) => {
    // Eğer hücre düzenleniyorsa drag'i engelle
    if (isEditingCell !== null) {
      return;
    }

    const target = e.target;
    if (target.dataset.resize) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDir(target.dataset.resize);
      setDragOffset({ x: e.clientX, y: e.clientY });
      return;
    }

    // Eğer tıklanan element bir input ise drag başlatma
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    if (isActive) {
      e.stopPropagation();
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - x,
        y: e.clientY - y,
      });
    }
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        newX = snapToGrid(snapToGuides(newX, true));
        newY = snapToGrid(snapToGuides(newY, false));

        onPositionChange?.(id, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragOffset.x;
        const deltaY = e.clientY - dragOffset.y;

        let newSize = { ...currentSize };
        let updates = {};

        if (resizeDir.includes("e")) {
          newSize.width = Math.max(150, currentSize.width + deltaX);
          updates.width = newSize.width;
        }
        if (resizeDir.includes("s")) {
          newSize.height = Math.max(100, currentSize.height + deltaY);
          updates.height = newSize.height;
        }
        if (resizeDir.includes("w")) {
          const newW = Math.max(150, currentSize.width - deltaX);
          updates.x = x - (newW - currentSize.width);
          updates.width = newW;
          newSize.width = newW;
        }
        if (resizeDir.includes("n")) {
          const newH = Math.max(100, currentSize.height - deltaY);
          updates.y = y - (newH - currentSize.height);
          updates.height = newH;
          newSize.height = newH;
        }

        setCurrentSize(newSize);
        if (Object.keys(updates).length > 0) {
          onPositionChange?.(id, updates);
        }
        setDragOffset({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        onPositionChange?.(id, { width: currentSize.width, height: currentSize.height });
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, x, y, currentSize, resizeDir, id, onPositionChange, snapToGrid, snapToGuides]);

  const handleCellDoubleClick = (rowIdx, colIdx) => {
    setIsEditingCell({ row: rowIdx, col: colIdx });
    onCellEdit?.(id, rowIdx, colIdx); // Parent'a bildir
  };

  const handleCellChange = (rowIdx, colIdx, value) => {
    const newData = tableData.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIdx && cIdx === colIdx) return value;
        return cell;
      })
    );
    setTableData(newData);
    onDataChange?.(id, newData);
  };

  const handleCellBlur = () => {
    setIsEditingCell(null);
  };

  const ResizeHandle = ({ direction }) => {
    const borderWidth = isActive ? 2 : 1;
    return (
      <div
        data-resize={direction}
        onMouseDown={handleMouseDown}
        className="absolute bg-blue-500 rounded hover:bg-blue-600 transition cursor-pointer"
        style={{
          width: "8px",
          height: "8px",
          zIndex: 100,
          ...(direction === "nw" && { top: `${borderWidth}px`, left: `${borderWidth}px` }),
          ...(direction === "ne" && { top: `${borderWidth}px`, right: `${borderWidth}px` }),
          ...(direction === "sw" && { bottom: `${borderWidth}px`, left: `${borderWidth}px` }),
          ...(direction === "se" && { bottom: `${borderWidth}px`, right: `${borderWidth}px` }),
          ...(direction === "n" && { top: `${borderWidth}px`, left: "50%", transform: "translateX(-50%)" }),
          ...(direction === "s" && { bottom: `${borderWidth}px`, left: "50%", transform: "translateX(-50%)" }),
          ...(direction === "w" && { left: `${borderWidth}px`, top: "50%", transform: "translateY(-50%)" }),
          ...(direction === "e" && { right: `${borderWidth}px`, top: "50%", transform: "translateY(-50%)" }),
        }}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: currentSize.width,
        height: currentSize.height,
        pointerEvents: "auto",
        cursor: isDragging ? "grabbing" : isActive && !isEditingCell ? "grab" : "default",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Context menu açılıyor, selectedCells:', selectedCells);
        onRightClick?.(id, { x: e.clientX, y: e.clientY }, 'table', selectedCells);
      }}
    >
      <div 
        className="tableWrapper"
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        <table
          className="word-table"
          style={{
            width: "100%",
            borderCollapse: tableStyle?.borderCollapse || "collapse",
            tableLayout: "fixed",
            margin: 0,
            border: tableStyle?.border || "solid #000000 0.5pt",
            fontFamily: tableStyle?.fontFamily || "Calibri, sans-serif",
            fontSize: tableStyle?.fontSize || "11pt",
          }}
        >
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => {
                // Check if this cell is covered by a merged cell
                const cellKey = `${rowIdx}-${colIdx}`;
                let isCovered = false;
                
                // Check if any previous cell's merge covers this position
                for (let r = 0; r <= rowIdx; r++) {
                  for (let c = 0; c <= colIdx; c++) {
                    const key = `${r}-${c}`;
                    if (mergedCells[key]) {
                      const { colspan = 1, rowspan = 1 } = mergedCells[key];
                      if (r + rowspan > rowIdx && c + colspan > colIdx && (r !== rowIdx || c !== colIdx)) {
                        isCovered = true;
                        break;
                      }
                    }
                  }
                  if (isCovered) break;
                }

                if (isCovered) return null;

                const isEditing = isEditingCell?.row === rowIdx && isEditingCell?.col === colIdx;
                const isHeader = headerRow && rowIdx === 0;
                const isSelected = selectedCells.some(sc => sc.row === rowIdx && sc.col === colIdx);
                const cellMerge = mergedCells[cellKey] || {};
                const colspan = cellMerge.colspan || 1;
                const rowspan = cellMerge.rowspan || 1;
                // Word cellStyles kullan
                const cellStyle = cellStyles[cellKey] || {};

                const handleCellClick = (e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedCells(prev => {
                      const exists = prev.some(sc => sc.row === rowIdx && sc.col === colIdx);
                      if (exists) {
                        console.log('Hücre seçimi kaldırıldı:', rowIdx, colIdx);
                        return prev.filter(sc => !(sc.row === rowIdx && sc.col === colIdx));
                      } else {
                        console.log('Hücre seçildi:', rowIdx, colIdx);
                        return [...prev, { row: rowIdx, col: colIdx }];
                      }
                    });
                  }
                };

                return isHeader ? (
                  <th
                    key={colIdx}
                    colSpan={colspan}
                    rowSpan={rowspan}
                    onClick={handleCellClick}
                    onDoubleClick={() => handleCellDoubleClick(rowIdx, colIdx)}
                    style={{
                      border: cellStyle.border || "solid #000000 0.5pt",
                      borderBottom: cellStyle.borderBottom || cellStyle.border || "solid #000000 0.5pt",
                      padding: cellStyle.padding || "0cm 5.4pt",
                      verticalAlign: cellStyle.verticalAlign || "top",
                      backgroundColor: cellStyle.backgroundColor || "#ffffff",
                      color: cellStyle.color || "#000000",
                      fontWeight: cellStyle.fontWeight || "normal",
                      textAlign: cellStyle.textAlign || "left",
                      cursor: "pointer",
                      outline: isSelected ? "2px solid #3b82f6" : "none",
                      outlineOffset: isSelected ? "-1px" : "0",
                    }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                        onBlur={handleCellBlur}
                        autoFocus
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      />
                    ) : (
                      <div 
                        dangerouslySetInnerHTML={{ __html: cell }} 
                        style={{ 
                          display: "inline-block",
                          width: "100%",
                          wordBreak: "break-word"
                        }}
                      />
                    )}
                  </th>
                ) : (
                  <td
                    key={colIdx}
                    colSpan={colspan}
                    rowSpan={rowspan}
                    onClick={handleCellClick}
                    onDoubleClick={() => handleCellDoubleClick(rowIdx, colIdx)}
                    className="word-table-cell"
                    style={{
                      border: cellStyle.border || "solid #000000 0.5pt",
                      borderBottom: cellStyle.borderBottom || cellStyle.border || "solid #000000 0.5pt",
                      padding: cellStyle.padding || "0cm 5.4pt",
                      verticalAlign: cellStyle.verticalAlign || "top",
                      backgroundColor: cellStyle.backgroundColor || "#ffffff",
                      color: cellStyle.color || "#000000",
                      textAlign: cellStyle.textAlign || "left",
                      cursor: "pointer",
                      outline: isSelected ? "2px solid #3b82f6" : "none",
                      outlineOffset: isSelected ? "-1px" : "0",
                    }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                        onBlur={handleCellBlur}
                        autoFocus
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: "14px",
                        }}
                      />
                    ) : (
                      <div 
                        dangerouslySetInnerHTML={{ __html: cell }} 
                        style={{ 
                          display: "inline-block",
                          width: "100%",
                          wordBreak: "break-word"
                        }}
                      />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Resize Handles */}
      {isActive && !isEditingCell && (
        <>
          <ResizeHandle direction="nw" />
          <ResizeHandle direction="ne" />
          <ResizeHandle direction="sw" />
          <ResizeHandle direction="se" />
          <ResizeHandle direction="n" />
          <ResizeHandle direction="s" />
          <ResizeHandle direction="w" />
          <ResizeHandle direction="e" />
        </>
      )}
    </div>
  );
}
