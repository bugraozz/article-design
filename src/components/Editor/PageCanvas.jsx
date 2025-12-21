// src/components/Editor/PageCanvas.jsx
import { useEffect, useRef, useState } from "react";
import TextOverlay from "../../overlays/TextOverlay";
import ImageOverlay from "../../overlays/ImageOverlay";
import TableOverlay from "../../overlays/TableOverlay";
import RulerOverlay from "./RulerOverlay";

export default function PageCanvas({
  overlays = [],
  images = [],
  tables = [],
  pageSettings = {},
  activeOverlay,
  setActiveOverlay,
  activePageId,
  onOverlayChange,
  onImageChange,
  onTableChange,
  onRightClick,
  onCellEdit, // Yeni callback
  inlineEditingId,
  setInlineEditingId,
  onEditorCreate,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
  presentationMode = false,
  showGrid = true,
  showGuides = true,
  gridSize = 10,
  snapEnabled = true,
  zoom = 100,
}) {
  const canvasRef = useRef(null);
  const pageContainerRef = useRef(null);
  const [guides, setGuides] = useState([]);
  const [pageMargin, setPageMargin] = useState(40);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTable, setActiveTable] = useState(null);

  // ===========================
  //  SNAPPING LOGİK
  // ===========================
  // Snapping logic - geliştirilmiş
  const snapToGrid = (value) => {
    if (!snapEnabled || !showGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const snapToGuides = (value, isVertical) => {
    if (!showGuides || guides.length === 0) return value;

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
  };

  // ===========================
  //  CANVAS INIT (sadece sayfa değişince)
  // ===========================
  useEffect(() => {
    // Hiçbir şey yapma - Fabric.js kaldırıldı, tamamen HTML tabanlı sistem
  }, [activePageId]);

  // ===========================
  //  RENDER
  // ===========================
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease",
        }}
      >
        <div
          ref={pageContainerRef}
          className="shadow-2xl relative bg-white"
          style={{
            width: 794,
            height: 1123,
            boxShadow: "0 10px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.1)",
            borderRadius: "2px",
            paddingTop: `${pageSettings?.marginTop || 40}px`,
            paddingBottom: `${pageSettings?.marginBottom || 40}px`,
            paddingLeft: `${pageSettings?.marginLeft || 50}px`,
            paddingRight: `${pageSettings?.marginRight || 50}px`,
            boxSizing: "border-box",
          }}
        >
        <canvas ref={canvasRef} style={{ position: "relative", zIndex: 1, display: "none" }} />

        {/* Grid Overlay - Profesyonel (sadece edit modda) */}
        {!presentationMode && showGrid && (
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{ zIndex: 2, width: 794, height: 1123 }}
          >
            <defs>
              <pattern
                id="grid"
                width={gridSize}
                height={gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                  fill="none"
                  stroke="#e0e7ff"
                  strokeWidth="0.3"
                  opacity="0.6"
                />
              </pattern>
              {/* Her 5. grid çizgisi daha kalın */}
              <pattern
                id="grid-major"
                width={gridSize * 5}
                height={gridSize * 5}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
                  fill="none"
                  stroke="#c7d2fe"
                  strokeWidth="0.5"
                  opacity="0.8"
                />
              </pattern>
            </defs>
            <rect width={794} height={1123} fill="url(#grid)" />
            <rect width={794} height={1123} fill="url(#grid-major)" />
          </svg>
        )}

        {/* Margin Rehberleri (sadece edit modda) */}
        {!presentationMode && showGuides && (
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{ zIndex: 3, width: 794, height: 1123 }}
          >
            {/* Sol margin */}
            <line
              x1={pageMargin}
              y1={0}
              x2={pageMargin}
              y2={1123}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Sağ margin */}
            <line
              x1={794 - pageMargin}
              y1={0}
              x2={794 - pageMargin}
              y2={1123}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Üst margin */}
            <line
              x1={0}
              y1={pageMargin}
              x2={794}
              y2={pageMargin}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
            />
            {/* Alt margin */}
            <line
              x1={0}
              y1={1123 - pageMargin}
              x2={794}
              y2={1123 - pageMargin}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
            />
          </svg>
        )}

        {/* Draggable Rehberler (sadece edit modda) */}
        {!presentationMode && showGuides && (
          <svg
            className="absolute top-0 left-0"
            style={{
              zIndex: 4,
              width: 794,
              height: 1123,
              cursor: "crosshair",
            }}
          >
            {guides.map((guide, idx) =>
              guide.type === "h" ? (
                <line
                  key={`h-${idx}`}
                  x1={0}
                  y1={guide.position}
                  x2={794}
                  y2={guide.position}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.7"
                  style={{ cursor: "row-resize" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startY = e.clientY;
                    const startPos = guide.position;
                    const containerRect = pageContainerRef.current.getBoundingClientRect();

                    const handleMouseMove = (moveEvent) => {
                      const deltaY = moveEvent.clientY - startY;
                      const newPos = startPos + deltaY / (window.devicePixelRatio || 1);
                      setGuides((prev) =>
                        prev.map((g, i) =>
                          i === idx && g.type === "h"
                            ? { ...g, position: Math.max(0, Math.min(1123, newPos)) }
                            : g
                        )
                      );
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                    };

                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                  }}
                />
              ) : (
                <line
                  key={`v-${idx}`}
                  x1={guide.position}
                  y1={0}
                  x2={guide.position}
                  y2={1123}
                  stroke="#3b82f6"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.7"
                  style={{ cursor: "col-resize" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startPos = guide.position;

                    const handleMouseMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const newPos = startPos + deltaX / (window.devicePixelRatio || 1);
                      setGuides((prev) =>
                        prev.map((g, i) =>
                          i === idx && g.type === "v"
                            ? { ...g, position: Math.max(0, Math.min(794, newPos)) }
                            : g
                        )
                      );
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                    };

                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                  }}
                />
              )
            )}
          </svg>
        )}

        {/* HTML Overlay (canvas'ın üstünde) */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 10 }}
        >
          {/* Metinler */}
          {overlays.map((item) => (
            <TextOverlay
              key={item.id}
              id={item.id}
              html={item.html}
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              rotate={item.rotate}
              fontSize={item.fontSize}
              color={item.color}
              lineHeight={item.lineHeight}
              textIndent={item.textIndent}
              titleFontSize={item.titleFontSize}
              titleColor={item.titleColor}
              isActive={item.id === activeOverlay}
              isEditing={item.id === inlineEditingId}
              onClick={() => {
                setActiveOverlay(item.id);
                setInlineEditingId(item.id); // Seçildiğinde düzenleme moduna da geç
                setActiveImage(null);
                setActiveTable(null);
              }}
              onDoubleClick={() => {
                setActiveOverlay(item.id);
                setInlineEditingId(item.id);
              }}
              onRightClick={onRightClick}
              onInlineChange={(newHtml) =>
                onOverlayChange?.(item.id, { html: newHtml })
              }
              onEditorCreate={onEditorCreate}
              onPositionChange={(id, partial) => {
                onOverlayChange?.(id, partial);
              }}
              onOpenEquationEditor={onOpenEquationEditor}
              onOpenMathSymbolPanel={onOpenMathSymbolPanel}
              showGrid={showGrid}
              gridSize={gridSize}
              guides={guides}
              snapEnabled={snapEnabled}
              presentationMode={presentationMode}
            />
          ))}

          {/* Resimler */}
          {images.map((img) => (
            <ImageOverlay
              key={img.id}
              id={img.id}
              src={img.src}
              x={img.x}
              y={img.y}
              width={img.width}
              height={img.height}
              angle={img.angle}
              borderRadius={img.borderRadius}
              isActive={img.id === activeImage}
              onClick={() => {
                setActiveImage(img.id);
                setActiveOverlay(null);
                setActiveTable(null);
                setInlineEditingId(null);
              }}
              onRightClick={onRightClick}
              onPositionChange={(id, partial) => {
                onImageChange?.(id, partial);
              }}
              showGrid={showGrid}
              gridSize={gridSize}
              guides={guides}
              snapEnabled={snapEnabled}
            />
          ))}

          {/* Tablolar */}
          {tables.map((table) => (
            <TableOverlay
              key={table.id}
              id={table.id}
              x={table.x}
              y={table.y}
              width={table.width}
              height={table.height}
              rows={table.rows}
              cols={table.cols}
              data={table.data}
              mergedCells={table.mergedCells || {}}
              cellStyles={table.cellStyles || {}}
              headerRow={table.headerRow}
              isActive={table.id === activeTable}
              onClick={() => {
                setActiveTable(table.id);
                setActiveOverlay(null);
                setActiveImage(null);
                setInlineEditingId(null);
              }}
              onRightClick={onRightClick}
              onPositionChange={(id, partial) => {
                onTableChange?.(id, partial);
              }}
              onDataChange={(id, newData) => {
                onTableChange?.(id, { data: newData });
              }}
              onMergedCellsChange={(id, mergedCells) => {
                onTableChange?.(id, { mergedCells });
              }}
              onCellEdit={(tableId, row, col) => {
                // Parent'a hücre düzenleme bilgisini gönder
                onCellEdit?.(tableId, row, col);
              }}
              showGrid={showGrid}
              gridSize={gridSize}
              guides={guides}
              snapEnabled={snapEnabled}
            />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
