import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AnnotationManagerPro, ANNOTATION_TOOLS, PRESET_COLORS } from '../../utils/pdfAnnotationPro';
import { RedactionManager } from '../../utils/pdfRedaction';
import { PdfExportUtilPro } from '../../utils/pdfExportPro';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

export default function ProfessionalPdfViewerFixed({ pdfUrl, fileName = 'document.pdf' }) {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.5);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [actualPageSize, setActualPageSize] = useState({ width: 0, height: 0 });
  const [currentTool, setCurrentTool] = useState(ANNOTATION_TOOLS.NONE);
  const [currentColor, setCurrentColor] = useState(PRESET_COLORS[0].value);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [drawPoints, setDrawPoints] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [redactions, setRedactions] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [showAnnotationList, setShowAnnotationList] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const annotationManager = useRef(new AnnotationManagerPro()).current;
  const redactionManager = useRef(new RedactionManager()).current;

  useEffect(() => {
    const unsubscribeAnnotations = annotationManager.onChange((state) => {
      setAnnotations(state.annotations);
      setSelectedAnnotation(state.selectedAnnotation);
      setCurrentTool(state.currentTool);
      setCurrentColor(state.currentColor);
      setCanUndo(annotationManager.canUndo());
      setCanRedo(annotationManager.canRedo());
    });
    const unsubscribeRedactions = redactionManager.onChange(setRedactions);
    
    return () => {
      unsubscribeAnnotations();
      unsubscribeRedactions();
    };
  }, [annotationManager, redactionManager]);

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let pdfDataBytes;

        if (pdfUrl.startsWith('data:application/pdf;base64,')) {
          const base64Data = pdfUrl.split(',')[1];
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfDataBytes = bytes;
        } else {
          const response = await fetch(pdfUrl);
          const arrayBuffer = await response.arrayBuffer();
          pdfDataBytes = new Uint8Array(arrayBuffer);
        }

        if (!isMounted) return;

        // Store as Uint8Array to prevent detachment issues
        setPdfData(pdfDataBytes);
        
        // Create a copy for PDF.js to prevent detachment of original data
        const pdfDataCopy = new Uint8Array(pdfDataBytes);
        const doc = await pdfjsLib.getDocument({ data: pdfDataCopy }).promise;
        setPdf(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('PDF yükleme hatası:', err);
        if (isMounted) {
          setError(`PDF yüklenemedi: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let isMounted = true;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        
        // Get actual PDF page size (scale 1.0)
        const actualViewport = page.getViewport({ scale: 1.0 });
        setActualPageSize({ width: actualViewport.width, height: actualViewport.height });
        
        // Get viewport for current scale
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        setPageSize({ width: viewport.width, height: viewport.height });

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        renderOverlay();
      } catch (err) {
        console.error('Sayfa render hatası:', err);
        if (isMounted) {
          setError(`Sayfa render edilemedi: ${err.message}`);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [pdf, currentPage, scale]);

  const normalizeCoord = (coord, viewportDimension, actualDimension) => {
    // Convert viewport coordinate to actual PDF coordinate (0-1 range)
    const viewportRatio = coord / viewportDimension;
    return viewportRatio;
  };

  const denormalizeCoord = (normalizedCoord, dimension) => {
    return normalizedCoord * dimension;
  };
  
  const normalizeToActualPdf = (coord, viewportDimension) => {
    // Convert viewport coordinate to actual PDF coordinate
    return (coord / viewportDimension) * actualPageSize.width;
  };

  const rgbToRgba = (color, opacity = 1) => {
    return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${opacity})`;
  };

  const renderOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !canvasRef.current || pageSize.width === 0) return;

    const overlayCanvas = overlayCanvasRef.current;
    const mainCanvas = canvasRef.current;
    const ctx = overlayCanvas.getContext('2d');

    overlayCanvas.width = mainCanvas.width;
    overlayCanvas.height = mainCanvas.height;

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const pageAnnotations = annotations.filter(a => a.pageIndex === currentPage - 1);
    const pageRedactions = redactions.filter(r => r.pageIndex === currentPage - 1);

    pageAnnotations.forEach(annotation => {
      const isSelected = selectedAnnotation?.id === annotation.id;
      
      const x = denormalizeCoord(annotation.x, pageSize.width);
      const y = denormalizeCoord(annotation.y, pageSize.height);
      const width = denormalizeCoord(annotation.width, pageSize.width);
      const height = denormalizeCoord(annotation.height, pageSize.height);
      
      if (annotation.type === 'highlight') {
        ctx.save();
        
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        const baseColor = annotation.color;
        gradient.addColorStop(0, rgbToRgba(baseColor, 0.35));
        gradient.addColorStop(0.5, rgbToRgba(baseColor, 0.45));
        gradient.addColorStop(1, rgbToRgba(baseColor, 0.35));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = rgbToRgba(baseColor, 0.6);
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        ctx.restore();
        
        if (isSelected) {
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.strokeRect(x - 3, y - 3, width + 6, height + 6);
          ctx.setLineDash([]);
          
          drawResizeHandles(ctx, x, y, width, height);
        }
      } else if (annotation.type === 'text') {
        const fontSize = denormalizeCoord(annotation.fontSize || 0.02, pageSize.height);
        ctx.fillStyle = rgbToRgba(annotation.color);
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(annotation.text, x, y);
        
        if (isSelected) {
          const metrics = ctx.measureText(annotation.text);
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x - 2, y - fontSize - 2, metrics.width + 4, fontSize + 4);
          ctx.setLineDash([]);
        }
      } else if (annotation.type === 'drawing') {
        ctx.strokeStyle = rgbToRgba(annotation.color);
        ctx.lineWidth = annotation.lineWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = rgbToRgba(annotation.color, 0.3);
        ctx.shadowBlur = 2;
        
        ctx.beginPath();
        annotation.points.forEach((point, index) => {
          const px = denormalizeCoord(point.x, pageSize.width);
          const py = denormalizeCoord(point.y, pageSize.height);
          if (index === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        if (isSelected) {
          const bounds = getDrawingBounds(annotation.points);
          const bx = denormalizeCoord(bounds.x, pageSize.width);
          const by = denormalizeCoord(bounds.y, pageSize.height);
          const bw = denormalizeCoord(bounds.width, pageSize.width);
          const bh = denormalizeCoord(bounds.height, pageSize.height);
          
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(bx - 5, by - 5, bw + 10, bh + 10);
          ctx.setLineDash([]);
        }
      } else if (annotation.type === 'sticky') {
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        const baseColor = annotation.color;
        gradient.addColorStop(0, rgbToRgba(baseColor, 0.95));
        gradient.addColorStop(1, rgbToRgba(baseColor, 0.85));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
        
        ctx.strokeStyle = rgbToRgba({ r: 0.8, g: 0.7, b: 0 });
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        ctx.fillStyle = rgbToRgba({ r: 0.9, g: 0.8, b: 0.1 }, 0.3);
        ctx.fillRect(x, y, width, 20);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        const lines = wrapText(ctx, annotation.text, width - 20);
        lines.forEach((line, i) => {
          ctx.fillText(line, x + 10, y + 35 + i * 15);
        });
        
        if (isSelected) {
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
          ctx.setLineDash([]);
        }
      }
    });

    pageRedactions.forEach(redaction => {
      const x = denormalizeCoord(redaction.x, pageSize.width);
      const y = denormalizeCoord(redaction.y, pageSize.height);
      const width = denormalizeCoord(redaction.width, pageSize.width);
      const height = denormalizeCoord(redaction.height, pageSize.height);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    });
  }, [annotations, redactions, currentPage, selectedAnnotation, pageSize]);

  const drawResizeHandles = (ctx, x, y, width, height) => {
    const handleSize = 8;
    const handles = [
      { x: x - handleSize/2, y: y - handleSize/2 },
      { x: x + width - handleSize/2, y: y - handleSize/2 },
      { x: x - handleSize/2, y: y + height - handleSize/2 },
      { x: x + width - handleSize/2, y: y + height - handleSize/2 },
    ];
    
    ctx.fillStyle = '#2196F3';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  };

  const getDrawingBounds = (points) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  };

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width < maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  const getCanvasCoordinates = (e) => {
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const handleCanvasMouseDown = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    
    if (currentTool === ANNOTATION_TOOLS.NONE) {
      const clickedAnnotation = annotations
        .filter(a => a.pageIndex === currentPage - 1)
        .reverse()
        .find(a => isPointInAnnotation(x, y, a));
      
      if (clickedAnnotation) {
        annotationManager.selectAnnotation(clickedAnnotation.id);
      } else {
        annotationManager.selectAnnotation(null);
      }
      return;
    }

    if (currentTool === ANNOTATION_TOOLS.ERASER) {
      const clickedAnnotation = annotations
        .filter(a => a.pageIndex === currentPage - 1)
        .reverse()
        .find(a => isPointInAnnotation(x, y, a));
      
      if (clickedAnnotation) {
        annotationManager.removeAnnotation(clickedAnnotation.id);
      }
      return;
    }

    setIsDrawing(true);
    setDrawStart({ x, y });
    
    if (currentTool === ANNOTATION_TOOLS.DRAW) {
      setDrawPoints([{ x, y }]);
    }
  };

  const isPointInAnnotation = (x, y, annotation) => {
    const ax = denormalizeCoord(annotation.x, pageSize.width);
    const ay = denormalizeCoord(annotation.y, pageSize.height);
    const awidth = denormalizeCoord(annotation.width, pageSize.width);
    const aheight = denormalizeCoord(annotation.height, pageSize.height);
    
    if (annotation.type === 'highlight' || annotation.type === 'sticky') {
      return x >= ax && x <= ax + awidth && y >= ay && y <= ay + aheight;
    } else if (annotation.type === 'text') {
      const fontSize = denormalizeCoord(annotation.fontSize || 0.02, pageSize.height);
      const width = annotation.text.length * fontSize * 0.6;
      return x >= ax && x <= ax + width && y >= ay - fontSize && y <= ay;
    } else if (annotation.type === 'drawing') {
      return annotation.points.some(point => {
        const px = denormalizeCoord(point.x, pageSize.width);
        const py = denormalizeCoord(point.y, pageSize.height);
        const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
        return distance < 10;
      });
    }
    return false;
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;

    const { x, y } = getCanvasCoordinates(e);

    if (currentTool === ANNOTATION_TOOLS.DRAW) {
      setDrawPoints(prev => [...prev, { x, y }]);
      
      const ctx = overlayCanvasRef.current.getContext('2d');
      renderOverlay();
      
      ctx.strokeStyle = rgbToRgba(currentColor);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      drawPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      const ctx = overlayCanvasRef.current.getContext('2d');
      renderOverlay();

      const width = x - drawStart.x;
      const height = y - drawStart.y;

      if (currentTool === ANNOTATION_TOOLS.HIGHLIGHT) {
        const gradient = ctx.createLinearGradient(drawStart.x, drawStart.y, drawStart.x, drawStart.y + height);
        gradient.addColorStop(0, rgbToRgba(currentColor, 0.35));
        gradient.addColorStop(0.5, rgbToRgba(currentColor, 0.45));
        gradient.addColorStop(1, rgbToRgba(currentColor, 0.35));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(drawStart.x, drawStart.y, width, height);
        
        ctx.strokeStyle = rgbToRgba(currentColor, 0.6);
        ctx.lineWidth = 1;
        ctx.strokeRect(drawStart.x, drawStart.y, width, height);
      } else if (currentTool === ANNOTATION_TOOLS.REDACT) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(drawStart.x, drawStart.y, width, height);
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawStart.x, drawStart.y, width, height);
      } else if (currentTool === ANNOTATION_TOOLS.STICKY) {
        const stickyWidth = 200;
        const stickyHeight = 150;
        
        const gradient = ctx.createLinearGradient(drawStart.x, drawStart.y, drawStart.x, drawStart.y + stickyHeight);
        gradient.addColorStop(0, rgbToRgba(currentColor, 0.95));
        gradient.addColorStop(1, rgbToRgba(currentColor, 0.85));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(drawStart.x, drawStart.y, stickyWidth, stickyHeight);
        ctx.strokeStyle = rgbToRgba({ r: 0.8, g: 0.7, b: 0 });
        ctx.lineWidth = 2;
        ctx.strokeRect(drawStart.x, drawStart.y, stickyWidth, stickyHeight);
      }
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (!isDrawing || !drawStart) return;

    const { x, y } = getCanvasCoordinates(e);

    const width = x - drawStart.x;
    const height = y - drawStart.y;

    if (currentTool === ANNOTATION_TOOLS.HIGHLIGHT) {
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        const normalizedX = normalizeCoord(Math.min(drawStart.x, x), pageSize.width, actualPageSize.width);
        const normalizedY = normalizeCoord(Math.min(drawStart.y, y), pageSize.height, actualPageSize.height);
        const normalizedWidth = normalizeCoord(Math.abs(width), pageSize.width, actualPageSize.width);
        const normalizedHeight = normalizeCoord(Math.abs(height), pageSize.height, actualPageSize.height);
        
        annotationManager.addAnnotation({
          type: 'highlight',
          pageIndex: currentPage - 1,
          x: normalizedX,
          y: normalizedY,
          width: normalizedWidth,
          height: normalizedHeight,
          color: currentColor,
          opacity: 0.4,
        });
      }
    } else if (currentTool === ANNOTATION_TOOLS.REDACT) {
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        const normalizedX = normalizeCoord(Math.min(drawStart.x, x), pageSize.width, actualPageSize.width);
        const normalizedY = normalizeCoord(Math.min(drawStart.y, y), pageSize.height, actualPageSize.height);
        const normalizedWidth = normalizeCoord(Math.abs(width), pageSize.width, actualPageSize.width);
        const normalizedHeight = normalizeCoord(Math.abs(height), pageSize.height, actualPageSize.height);
        
        redactionManager.addRedaction(currentPage - 1, normalizedX, normalizedY, normalizedWidth, normalizedHeight);
      }
    } else if (currentTool === ANNOTATION_TOOLS.TEXT) {
      const text = prompt('Metin girin:');
      if (text) {
        const normalizedX = normalizeCoord(drawStart.x, pageSize.width, actualPageSize.width);
        const normalizedY = normalizeCoord(drawStart.y, pageSize.height, actualPageSize.height);
        const normalizedFontSize = normalizeCoord(14, pageSize.height, actualPageSize.height);
        
        annotationManager.addAnnotation({
          type: 'text',
          pageIndex: currentPage - 1,
          x: normalizedX,
          y: normalizedY,
          text,
          fontSize: normalizedFontSize,
          color: { r: 0, g: 0, b: 0 },
        });
      }
    } else if (currentTool === ANNOTATION_TOOLS.DRAW) {
      if (drawPoints.length > 2) {
        const normalizedPoints = [...drawPoints, { x, y }].map(point => ({
          x: normalizeCoord(point.x, pageSize.width, actualPageSize.width),
          y: normalizeCoord(point.y, pageSize.height, actualPageSize.height),
        }));
        
        annotationManager.addAnnotation({
          type: 'drawing',
          pageIndex: currentPage - 1,
          points: normalizedPoints,
          color: currentColor,
          lineWidth: 2,
        });
      }
      setDrawPoints([]);
    } else if (currentTool === ANNOTATION_TOOLS.STICKY) {
      const text = prompt('Not metni girin:');
      if (text) {
        const normalizedX = normalizeCoord(drawStart.x, pageSize.width, actualPageSize.width);
        const normalizedY = normalizeCoord(drawStart.y, pageSize.height, actualPageSize.height);
        const normalizedWidth = normalizeCoord(200, pageSize.width, actualPageSize.width);
        const normalizedHeight = normalizeCoord(150, pageSize.height, actualPageSize.height);
        
        annotationManager.addAnnotation({
          type: 'sticky',
          pageIndex: currentPage - 1,
          x: normalizedX,
          y: normalizedY,
          text,
          color: currentColor,
          width: normalizedWidth,
          height: normalizedHeight,
        });
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
  };

  const handleExport = async () => {
    if (!pdfData) {
      alert('PDF verisi yüklenmedi');
      return;
    }

    try {
      // Annotation'ları denormalize et
      const denormalizedAnnotations = annotations.map(ann => {
        const result = { ...ann };
        
        if (ann.type === 'highlight' || ann.type === 'sticky') {
          result.x = ann.x * actualPageSize.width;
          result.y = ann.y * actualPageSize.height;
          result.width = ann.width * actualPageSize.width;
          result.height = ann.height * actualPageSize.height;
        } else if (ann.type === 'text') {
          result.x = ann.x * actualPageSize.width;
          result.y = ann.y * actualPageSize.height;
          result.fontSize = ann.fontSize * actualPageSize.height;
        } else if (ann.type === 'drawing') {
          result.points = ann.points.map(p => ({
            x: p.x * actualPageSize.width,
            y: p.y * actualPageSize.height,
          }));
        }
        
        return result;
      });
      
      // Redaction'ları da annotation olarak ekle
      const denormalizedRedactions = redactions.map(red => ({
        type: 'redaction',
        pageIndex: red.pageIndex,
        x: red.x * actualPageSize.width,
        y: red.y * actualPageSize.height,
        width: red.width * actualPageSize.width,
        height: red.height * actualPageSize.height,
      }));
      
      // Tüm annotation'ları ve redaction'ları birleştir
      const allItems = [...denormalizedAnnotations, ...denormalizedRedactions];
      
      await PdfExportUtilPro.exportAndDownload(pdfData, allItems, fileName);
      alert('PDF başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('Export error:', error);
      alert('PDF dışa aktarma hatası: ' + error.message);
    }
  };

  // Redaction export fonksiyonu kaldırıldı - artık normal export'a dahil

  const handleToolChange = (tool) => {
    annotationManager.setTool(tool);
    setCurrentTool(tool);
    if (tool !== ANNOTATION_TOOLS.NONE) {
      annotationManager.selectAnnotation(null);
    }
  };

  const handleColorChange = (color) => {
    annotationManager.setColor(color);
    setCurrentColor(color);
    setShowColorPicker(false);
  };

  const toolButtonStyle = (tool) => ({
    padding: '8px 16px',
    backgroundColor: currentTool === tool ? '#2196F3' : '#f5f5f5',
    color: currentTool === tool ? 'white' : '#333',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    boxShadow: currentTool === tool ? '0 2px 8px rgba(33, 150, 243, 0.3)' : 'none',
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0,
          flexWrap: 'wrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage <= 1 ? '#e0e0e0' : '#2196F3',
              color: currentPage <= 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            ←
          </button>

          <span style={{ fontSize: '13px', fontWeight: '500', minWidth: '80px', textAlign: 'center' }}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage >= totalPages ? '#e0e0e0' : '#2196F3',
              color: currentPage >= totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            →
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0' }} />

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
            disabled={scale <= 0.5}
            style={{
              padding: '8px 12px',
              backgroundColor: scale <= 0.5 ? '#e0e0e0' : '#4CAF50',
              color: scale <= 0.5 ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: scale <= 0.5 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            −
          </button>

          <span style={{ fontSize: '13px', fontWeight: '500', minWidth: '50px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale(Math.min(3, scale + 0.2))}
            disabled={scale >= 3}
            style={{
              padding: '8px 12px',
              backgroundColor: scale >= 3 ? '#e0e0e0' : '#4CAF50',
              color: scale >= 3 ? '#999' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: scale >= 3 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            +
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0' }} />

        <button onClick={() => handleToolChange(ANNOTATION_TOOLS.NONE)} style={toolButtonStyle(ANNOTATION_TOOLS.NONE)}>
          <span>🖱️</span> Seç
        </button>

        <button onClick={() => handleToolChange(ANNOTATION_TOOLS.HIGHLIGHT)} style={toolButtonStyle(ANNOTATION_TOOLS.HIGHLIGHT)}>
          <span>🖍️</span> Vurgula
        </button>

        <button onClick={() => handleToolChange(ANNOTATION_TOOLS.TEXT)} style={toolButtonStyle(ANNOTATION_TOOLS.TEXT)}>
          <span>📝</span> Metin
        </button>

        <button onClick={() => handleToolChange(ANNOTATION_TOOLS.DRAW)} style={toolButtonStyle(ANNOTATION_TOOLS.DRAW)}>
          <span>✏️</span> Çiz
        </button>

        <button onClick={() => handleToolChange(ANNOTATION_TOOLS.STICKY)} style={toolButtonStyle(ANNOTATION_TOOLS.STICKY)}>
          <span>📌</span> Not
        </button>

        <button onClick={() => handleToolChange(ANNOTATION_TOOLS.REDACT)} style={toolButtonStyle(ANNOTATION_TOOLS.REDACT)}>
          <span>⬛</span> Redakte
        </button>

        <button onClick={() => handleToolChange(ANNOTATION_TOOLS.ERASER)} style={toolButtonStyle(ANNOTATION_TOOLS.ERASER)}>
          <span>🗑️</span> Sil
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0' }} />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '2px solid ' + rgbToRgba(currentColor),
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div style={{ width: '20px', height: '20px', backgroundColor: rgbToRgba(currentColor), borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            Renk
          </button>

          {showColorPicker && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
            }}>
              {PRESET_COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.value)}
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: color.hex,
                    border: JSON.stringify(currentColor) === JSON.stringify(color.value) ? '3px solid #2196F3' : '2px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0' }} />

        <button
          onClick={() => annotationManager.undo()}
          disabled={!canUndo}
          style={{
            padding: '8px 16px',
            backgroundColor: canUndo ? '#FF9800' : '#e0e0e0',
            color: canUndo ? 'white' : '#999',
            border: 'none',
            borderRadius: '6px',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          ↶ Geri Al
        </button>

        <button
          onClick={() => annotationManager.redo()}
          disabled={!canRedo}
          style={{
            padding: '8px 16px',
            backgroundColor: canRedo ? '#FF9800' : '#e0e0e0',
            color: canRedo ? 'white' : '#999',
            border: 'none',
            borderRadius: '6px',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            fontWeight: '500',
          }}
        >
          ↷ İleri Al
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowAnnotationList(!showAnnotationList)}
            style={{
              padding: '8px 16px',
              backgroundColor: showAnnotationList ? '#9C27B0' : '#f5f5f5',
              color: showAnnotationList ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            📋 Notlar ({annotations.length})
          </button>

          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            💾 Dışa Aktar {(annotations.length + redactions.length) > 0 && `(${annotations.length + redactions.length})`}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: '#f5f5f5',
                color: '#666',
                fontSize: '16px',
              }}
            >
              📄 PDF yükleniyor...
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                backgroundColor: '#ffebee',
                color: '#c62828',
                fontSize: '16px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              ❌ {error}
            </div>
          )}

          {!isLoading && !error && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'auto',
                padding: '20px',
                backgroundColor: '#f5f5f5',
              }}
            >
              <div style={{ position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '4px',
                  }}
                />
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={() => {
                    setIsDrawing(false);
                    setDrawStart(null);
                    setDrawPoints([]);
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    cursor: currentTool !== ANNOTATION_TOOLS.NONE ? 'crosshair' : 'pointer',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {showAnnotationList && (
          <div
            style={{
              width: '300px',
              backgroundColor: 'white',
              borderLeft: '1px solid #e0e0e0',
              padding: '16px',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Annotation Listesi</h3>
            {annotations.length === 0 ? (
              <p style={{ color: '#999', fontSize: '14px' }}>Henüz annotation eklenmedi</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    onClick={() => {
                      setCurrentPage(annotation.pageIndex + 1);
                      annotationManager.selectAnnotation(annotation.id);
                    }}
                    style={{
                      padding: '12px',
                      backgroundColor: selectedAnnotation?.id === annotation.id ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedAnnotation?.id === annotation.id ? '2px solid #2196F3' : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                        {annotation.type === 'highlight' && '🖍️ Vurgulama'}
                        {annotation.type === 'text' && '📝 Metin'}
                        {annotation.type === 'drawing' && '✏️ Çizim'}
                        {annotation.type === 'sticky' && '📌 Not'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          annotationManager.removeAnnotation(annotation.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        Sil
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      Sayfa {annotation.pageIndex + 1}
                    </div>
                    {annotation.text && (
                      <div style={{ fontSize: '12px', color: '#333', marginTop: '4px', wordBreak: 'break-word' }}>
                        {annotation.text.substring(0, 50)}{annotation.text.length > 50 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
