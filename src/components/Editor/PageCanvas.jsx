// src/components/Editor/PageCanvas.jsx
import { useEffect, useRef, useState } from "react";
import TextOverlay from "../../overlays/TextOverlay";
import ImageOverlay from "../../overlays/ImageOverlay";
import RulerOverlay from "./RulerOverlay";

export default function PageCanvas({
  overlays = [],
  images = [],
  pageSettings = {},
  activeOverlay,
  setActiveOverlay,
  activePageId,
  onOverlayChange,
  onImageChange,
  onRightClick,
  inlineEditingId,
  setInlineEditingId,
  onEditorCreate,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
}) {
  const canvasRef = useRef(null);
  const pageContainerRef = useRef(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [guides, setGuides] = useState([]);
  const [pageMargin, setPageMargin] = useState(40);
  const [activeImage, setActiveImage] = useState(null);

  // ===========================
  //  SNAPPING LOGİK
  // ===========================
  // Snapping logic
  const snapToGrid = (value) => {
    if (!showGrid) return value;
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
    <div className="relative flex items-center justify-center w-full h-full bg-gray-200">
      {/* Rulers */}
      <RulerOverlay pageWidth={794} pageHeight={1123} />

      {/* Kontrol Toolbar */}
      <div className="absolute top-4 left-36 bg-white rounded-lg shadow-md p-3 space-y-2 z-40">
        <div className="flex gap-2 items-center text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Grid</span>
          </label>
        </div>

        <div className="flex gap-2 items-center text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Rehberler</span>
          </label>
        </div>

        <div className="flex gap-2 items-center text-sm">
          <label className="text-gray-600">Grid:</label>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value={10}>10px</option>
            <option value={20}>20px</option>
            <option value={30}>30px</option>
            <option value={50}>50px</option>
          </select>
        </div>

        <div className="flex gap-2 items-center text-sm">
          <label className="text-gray-600">Margin:</label>
          <input
            type="number"
            value={pageMargin}
            onChange={(e) => setPageMargin(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 w-16"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div
        id="a4-page"
        ref={pageContainerRef}
        className="shadow-lg relative bg-white rounded"
        style={{
          width: 794,
          height: 1123,
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          marginTop: 30,
          marginLeft: 30,
          paddingTop: `${pageSettings?.marginTop || 40}px`,
          paddingBottom: `${pageSettings?.marginBottom || 40}px`,
          paddingLeft: `${pageSettings?.marginLeft || 50}px`,
          paddingRight: `${pageSettings?.marginRight || 50}px`,
          boxSizing: "border-box",
        }}
      >
        <canvas ref={canvasRef} style={{ position: "relative", zIndex: 1, display: "none" }} />

        {/* Grid Overlay */}
        {showGrid && (
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
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width={794} height={1123} fill="url(#grid)" />
          </svg>
        )}

        {/* Margin Rehberleri */}
        {showGuides && (
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

        {/* Draggable Rehberler */}
        {showGuides && (
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

        {/* Rehber Ekleme Düğmeleri */}
        <div className="absolute bottom-4 left-4 flex gap-2 z-40">
          <button
            onClick={() =>
              setGuides([...guides, { type: "h", position: 300 }])
            }
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            + H Rehber
          </button>
          <button
            onClick={() =>
              setGuides([...guides, { type: "v", position: 300 }])
            }
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            + V Rehber
          </button>
          {guides.length > 0 && (
            <button
              onClick={() =>
                setGuides(guides.slice(0, -1))
              }
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Kaldır
            </button>
          )}
        </div>

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
                setActiveImage(null);
              }}
              onDoubleClick={() => {
                setActiveOverlay(item.id);
                setInlineEditingId(item.id);
                onEditorCreate?.(null); // Editor reset
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
              isActive={img.id === activeImage}
              onClick={() => {
                setActiveImage(img.id);
                setActiveOverlay(null);
                setInlineEditingId(null);
              }}
              onRightClick={onRightClick}
              onPositionChange={(id, partial) => {
                onImageChange?.(id, partial);
              }}
              showGrid={showGrid}
              gridSize={gridSize}
              guides={guides}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
