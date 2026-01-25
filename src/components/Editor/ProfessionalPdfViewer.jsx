import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AnnotationManagerPro, ANNOTATION_TOOLS, PRESET_COLORS } from '../../utils/pdfAnnotationPro';
import { RedactionManager } from '../../utils/pdfRedaction';
import { PdfExportUtilPro } from '../../utils/pdfExportPro';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

export default function ProfessionalPdfViewer({ pdfUrl, fileName = 'document.pdf' }) {
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
          pdfDataBytes = await response.arrayBuffer();
        }

        if (!isMounted) return;

        setPdfData(pdfDataBytes);
        const doc = await pdfjsLib.getDocument({ data: pdfDataBytes }).promise;
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
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

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

  const rgbToRgba = (color, opacity = 1) => {
    return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)}, ${opacity})`;
  };

  const renderOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !canvasRef.current) return;

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
      
      if (annotation.type === 'highlight') {
        ctx.fillStyle = rgbToRgba(annotation.color, annotation.opacity || 0.4);
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        
        if (isSelected) {
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(annotation.x - 2, annotation.y - 2, annotation.width + 4, annotation.height + 4);
          ctx.setLineDash([]);
        }
      } else if (annotation.type === 'text') {
        ctx.fillStyle = rgbToRgba(annotation.color);
        ctx.font = `${annotation.fontSize || 14}px Arial`;
        ctx.fillText(annotation.text, annotation.x, annotation.y);
        
        if (isSelected) {
          const metrics = ctx.measureText(annotation.text);
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(annotation.x - 2, annotation.y - annotation.fontSize - 2, metrics.width + 4, annotation.fontSize + 4);
          ctx.setLineDash([]);
        }
      } else if (annotation.type === 'drawing') {
        ctx.strokeStyle = rgbToRgba(annotation.color);
        ctx.lineWidth = annotation.lineWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        annotation.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        
        if (isSelected) {
          const bounds = getDrawingBounds(annotation.points);
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
          ctx.setLineDash([]);
        }
      } else if (annotation.type === 'sticky') {
        ctx.fillStyle = rgbToRgba(annotation.color, 0.9);
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        ctx.strokeStyle = rgbToRgba({ r: 0.8, g: 0.7, b: 0 });
        ctx.lineWidth = 2;
        ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        const lines = wrapText(ctx, annotation.text, annotation.width - 20);
        lines.forEach((line, i) => {
          ctx.fillText(line, annotation.x + 10, annotation.y + 25 + i * 15);
        });
        
        if (isSelected) {
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(annotation.x - 2, annotation.y - 2, annotation.width + 4, annotation.height + 4);
          ctx.setLineDash([]);
        }
      }
    });

    pageRedactions.forEach(redaction => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(redaction.x, redaction.y, redaction.width, redaction.height);
      ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(redaction.x, redaction.y, redaction.width, redaction.height);
    });
  }, [annotations, redactions, currentPage, selectedAnnotation]);

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

  const handleCanvasMouseDown = (e) => {
    if (currentTool === ANNOTATION_TOOLS.NONE) {
      const rect = overlayCanvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
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
      const rect = overlayCanvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedAnnotation = annotations
        .filter(a => a.pageIndex === currentPage - 1)
        .reverse()
        .find(a => isPointInAnnotation(x, y, a));
      
      if (clickedAnnotation) {
        annotationManager.removeAnnotation(clickedAnnotation.id);
      }
      return;
    }

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
    
    if (currentTool === ANNOTATION_TOOLS.DRAW) {
      setDrawPoints([{ x, y }]);
    }
  };

  const isPointInAnnotation = (x, y, annotation) => {
    if (annotation.type === 'highlight' || annotation.type === 'sticky') {
      return x >= annotation.x && x <= annotation.x + annotation.width &&
             y >= annotation.y && y <= annotation.y + annotation.height;
    } else if (annotation.type === 'text') {
      const fontSize = annotation.fontSize || 14;
      const width = annotation.text.length * fontSize * 0.6;
      return x >= annotation.x && x <= annotation.x + width &&
             y >= annotation.y - fontSize && y <= annotation.y;
    } else if (annotation.type === 'drawing') {
      return annotation.points.some(point => {
        const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        return distance < 10;
      });
    }
    return false;
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
        ctx.fillStyle = rgbToRgba(currentColor, 0.4);
        ctx.fillRect(drawStart.x, drawStart.y, width, height);
      } else if (currentTool === ANNOTATION_TOOLS.REDACT) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(drawStart.x, drawStart.y, width, height);
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawStart.x, drawStart.y, width, height);
      } else if (currentTool === ANNOTATION_TOOLS.STICKY) {
        ctx.fillStyle = rgbToRgba(currentColor, 0.9);
        ctx.fillRect(drawStart.x, drawStart.y, 200, 150);
        ctx.strokeStyle = rgbToRgba({ r: 0.8, g: 0.7, b: 0 });
        ctx.lineWidth = 2;
        ctx.strokeRect(drawStart.x, drawStart.y, 200, 150);
      }
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (!isDrawing || !drawStart) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - drawStart.x;
    const height = y - drawStart.y;

    if (currentTool === ANNOTATION_TOOLS.HIGHLIGHT) {
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        annotationManager.addAnnotation(
          annotationManager.createHighlight(
            currentPage - 1,
            Math.min(drawStart.x, x),
            Math.min(drawStart.y, y),
            Math.abs(width),
            Math.abs(height),
            currentColor
          )
        );
      }
    } else if (currentTool === ANNOTATION_TOOLS.REDACT) {
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        redactionManager.addRedaction(
          currentPage - 1,
          Math.min(drawStart.x, x),
          Math.min(drawStart.y, y),
          Math.abs(width),
          Math.abs(height)
        );
      }
    } else if (currentTool === ANNOTATION_TOOLS.TEXT) {
      const text = prompt('Metin girin:');
      if (text) {
        annotationManager.addAnnotation(
          annotationManager.createTextAnnotation(currentPage - 1, drawStart.x, drawStart.y, text)
        );
      }
    } else if (currentTool === ANNOTATION_TOOLS.DRAW) {
      if (drawPoints.length > 2) {
        annotationManager.addAnnotation(
          annotationManager.createDrawing(currentPage - 1, [...drawPoints, { x, y }], currentColor)
        );
      }
      setDrawPoints([]);
    } else if (currentTool === ANNOTATION_TOOLS.STICKY) {
      const text = prompt('Not metni girin:');
      if (text) {
        annotationManager.addAnnotation(
          annotationManager.createStickyNote(currentPage - 1, drawStart.x, drawStart.y, text, currentColor)
        );
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
      await PdfExportUtilPro.exportAndDownload(pdfData, annotations, fileName);
      alert('PDF başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('Export error:', error);
      alert('PDF dışa aktarma hatası: ' + error.message);
    }
  };

  const handleExportRedacted = async () => {
    if (!pdfData) {
      alert('PDF verisi yüklenmedi');
      return;
    }

    try {
      await redactionManager.exportRedactedPdf(pdfData, `redacted_${fileName}`);
      alert('Redakte edilmiş PDF başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('Redaction export error:', error);
      alert('Redakte edilmiş PDF dışa aktarma hatası: ' + error.message);
    }
  };

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
            <div style={{ width: '20px', height: '20px', backgroundColor: rgbToRgba(currentColor), borderRadius: '4px' }} />
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
                    border: currentColor === color.value ? '3px solid #2196F3' : '2px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
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
            💾 Dışa Aktar
          </button>

          {redactions.length > 0 && (
            <button
              onClick={handleExportRedacted}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              🔒 Redakte Et
            </button>
          )}
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
                    cursor: currentTool !== ANNOTATION_TOOLS.NONE ? 'crosshair' : 'default',
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
