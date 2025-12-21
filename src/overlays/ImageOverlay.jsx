// src/overlays/ImageOverlay.jsx
import { useState, useRef, useEffect, useCallback } from "react";

export default function ImageOverlay({
  id,
  src,
  x,
  y,
  width,
  height,
  angle,
  borderRadius,
  isActive,
  onClick,
  onRightClick,
  onPositionChange,
  showGrid = false,
  gridSize = 20,
  guides = [],
  snapEnabled = true,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState("");
  const [currentSize, setCurrentSize] = useState({ width, height });
  const containerRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const UPDATE_THRESHOLD = 50; // 50ms'de bir update

  useEffect(() => {
    setCurrentSize({ width, height });
  }, [width, height]);

  // Snapping helper functions
  const snapToGrid = useCallback((value) => {
    console.log('🎯 [ImageOverlay] snapToGrid:', { value, snapEnabled, showGrid, gridSize });
    if (!snapEnabled || !showGrid) return value;
    const snapped = Math.round(value / gridSize) * gridSize;
    console.log('🎯 [ImageOverlay] snapToGrid result:', snapped);
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
    const target = e.target;
    if (target.dataset.resize) {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDir(target.dataset.resize);
      setDragOffset({ x: e.clientX, y: e.clientY });
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
      const now = Date.now();
      if (now - lastUpdateRef.current < UPDATE_THRESHOLD) return;
      lastUpdateRef.current = now;

      if (isDragging) {
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Snapping uygula
        newX = snapToGrid(snapToGuides(newX, true));
        newY = snapToGrid(snapToGuides(newY, false));

        onPositionChange?.(id, {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      } else if (isResizing) {
        const deltaX = e.clientX - dragOffset.x;
        const deltaY = e.clientY - dragOffset.y;

        const newSize = { ...currentSize };

        if (resizeDir.includes("e")) newSize.width = Math.max(50, currentSize.width + deltaX);
        if (resizeDir.includes("s")) newSize.height = Math.max(50, currentSize.height + deltaY);
        if (resizeDir.includes("w")) {
          const newW = Math.max(50, currentSize.width - deltaX);
          const diff = newW - currentSize.width;
          onPositionChange?.(id, { x: x + diff });
          newSize.width = newW;
        }
        if (resizeDir.includes("n")) {
          const newH = Math.max(50, currentSize.height - deltaY);
          const diff = newH - currentSize.height;
          onPositionChange?.(id, { y: y + diff });
          newSize.height = newH;
        }

        setCurrentSize(newSize);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        // Update final size
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

  const ResizeHandle = ({ direction }) => (
    <div
      data-resize={direction}
      onMouseDown={handleMouseDown}
      className="absolute bg-green-500 rounded hover:bg-green-600 transition cursor-pointer"
      style={{
        width: "12px",
        height: "12px",
        zIndex: 100,
        ...(direction.includes("n") && { top: "-6px" }),
        ...(direction.includes("s") && { bottom: "-6px" }),
        ...(direction.includes("w") && { left: "-6px" }),
        ...(direction.includes("e") && { right: "-6px" }),
        ...(direction === "nw" && { top: "-6px", left: "-6px" }),
        ...(direction === "ne" && { top: "-6px", right: "-6px" }),
        ...(direction === "sw" && { bottom: "-6px", left: "-6px" }),
        ...(direction === "se" && { bottom: "-6px", right: "-6px" }),
        ...(direction === "n" && { top: "-6px", left: "50%", transform: "translateX(-50%)" }),
        ...(direction === "s" && { bottom: "-6px", left: "50%", transform: "translateX(-50%)" }),
        ...(direction === "w" && { left: "-6px", top: "50%", transform: "translateY(-50%)" }),
        ...(direction === "e" && { right: "-6px", top: "50%", transform: "translateY(-50%)" }),
      }}
    />
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: currentSize.width,
        height: currentSize.height,
        transform: `rotate(${angle || 0}deg)`,
        transformOrigin: "center",
        pointerEvents: "auto",
        cursor: isDragging ? "grabbing" : isActive ? "grab" : "pointer",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRightClick?.(id, { x: e.clientX, y: e.clientY }, 'image');
      }}
    >
      {src ? (
        <img
          src={src}
          alt="overlay"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            border: isActive ? "2px solid #10b981" : "1px dashed rgba(16, 185, 129, 0.3)",
            borderRadius: borderRadius || "4px",
            pointerEvents: "none",
            boxShadow: isActive ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            border: isActive ? "2px solid #10b981" : "2px dashed #d1d5db",
            borderRadius: borderRadius || "4px",
            color: "#9ca3af",
            fontSize: "14px",
            fontWeight: "500",
            pointerEvents: "none",
            boxShadow: isActive ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
          }}
        >
          🖼️ Görsel Ekle
        </div>
      )}

      {/* Resize Handles */}
      {isActive && (
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
