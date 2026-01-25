import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AnnotationManager, ANNOTATION_TOOLS } from '../../utils/pdfAnnotation';
import { RedactionManager } from '../../utils/pdfRedaction';
import { PdfExportUtil } from '../../utils/pdfExport';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

export default function EnhancedPdfViewer({ pdfUrl, fileName = 'document.pdf' }) {
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [redactions, setRedactions] = useState([]);

  const annotationManager = useRef(new AnnotationManager()).current;
  const redactionManager = useRef(new RedactionManager()).current;

  useEffect(() => {
    const unsubscribeAnnotations = annotationManager.onChange(setAnnotations);
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

  const renderOverlay = () => {
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
      if (annotation.type === 'highlight') {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
      } else if (annotation.type === 'text') {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.font = `${annotation.fontSize}px Arial`;
        ctx.fillText(annotation.text, annotation.x, annotation.y);
      } else if (annotation.type === 'drawing') {
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = annotation.lineWidth;
        ctx.beginPath();
        annotation.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
    });

    pageRedactions.forEach(redaction => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(redaction.x, redaction.y, redaction.width, redaction.height);
      ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(redaction.x, redaction.y, redaction.width, redaction.height);
    });
  };

  useEffect(() => {
    renderOverlay();
  }, [annotations, redactions, currentPage]);

  const handleCanvasMouseDown = (e) => {
    if (currentTool === ANNOTATION_TOOLS.NONE) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;

    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = overlayCanvasRef.current.getContext('2d');
    renderOverlay();

    if (currentTool === ANNOTATION_TOOLS.HIGHLIGHT || currentTool === ANNOTATION_TOOLS.REDACT) {
      const width = x - drawStart.x;
      const height = y - drawStart.y;

      if (currentTool === ANNOTATION_TOOLS.HIGHLIGHT) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      }
      ctx.fillRect(drawStart.x, drawStart.y, width, height);
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
      annotationManager.addAnnotation(
        annotationManager.createHighlight(currentPage - 1, drawStart.x, drawStart.y, width, height)
      );
    } else if (currentTool === ANNOTATION_TOOLS.REDACT) {
      redactionManager.addRedaction(currentPage - 1, drawStart.x, drawStart.y, width, height);
    } else if (currentTool === ANNOTATION_TOOLS.TEXT) {
      const text = prompt('Metin girin:');
      if (text) {
        annotationManager.addAnnotation(
          annotationManager.createTextAnnotation(currentPage - 1, drawStart.x, drawStart.y, text)
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
      await PdfExportUtil.exportAndDownload(pdfData, annotations, fileName);
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(scale + 0.2);
  };

  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.2);
    }
  };

  const handleFitPage = () => {
    if (containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const pageAspect = 8.5 / 11;
      const fitToWidth = containerWidth / (8.5 * 96);
      const fitToHeight = containerHeight / (11 * 96);
      setScale(Math.min(fitToWidth, fitToHeight, 2));
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
          style={{
            padding: '6px 12px',
            backgroundColor: currentPage <= 1 ? '#e0e0e0' : '#2196F3',
            color: currentPage <= 1 ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          ← Önceki
        </button>

        <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '100px', textAlign: 'center' }}>
          Sayfa {currentPage} / {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          style={{
            padding: '6px 12px',
            backgroundColor: currentPage >= totalPages ? '#e0e0e0' : '#2196F3',
            color: currentPage >= totalPages ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          Sonraki →
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          style={{
            padding: '6px 10px',
            backgroundColor: scale <= 0.5 ? '#e0e0e0' : '#4CAF50',
            color: scale <= 0.5 ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: scale <= 0.5 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          −
        </button>

        <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '50px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 3}
          style={{
            padding: '6px 10px',
            backgroundColor: scale >= 3 ? '#e0e0e0' : '#4CAF50',
            color: scale >= 3 ? '#999' : 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: scale >= 3 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          +
        </button>

        <button
          onClick={handleFitPage}
          style={{
            padding: '6px 12px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          Sayfaya Sığdır
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

        <button
          onClick={() => setCurrentTool(ANNOTATION_TOOLS.NONE)}
          style={{
            padding: '6px 12px',
            backgroundColor: currentTool === ANNOTATION_TOOLS.NONE ? '#9C27B0' : '#e0e0e0',
            color: currentTool === ANNOTATION_TOOLS.NONE ? 'white' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          🖱️ Seç
        </button>

        <button
          onClick={() => setCurrentTool(ANNOTATION_TOOLS.HIGHLIGHT)}
          style={{
            padding: '6px 12px',
            backgroundColor: currentTool === ANNOTATION_TOOLS.HIGHLIGHT ? '#FFEB3B' : '#e0e0e0',
            color: currentTool === ANNOTATION_TOOLS.HIGHLIGHT ? '#000' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          🖍️ Vurgula
        </button>

        <button
          onClick={() => setCurrentTool(ANNOTATION_TOOLS.TEXT)}
          style={{
            padding: '6px 12px',
            backgroundColor: currentTool === ANNOTATION_TOOLS.TEXT ? '#2196F3' : '#e0e0e0',
            color: currentTool === ANNOTATION_TOOLS.TEXT ? 'white' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          📝 Metin
        </button>

        <button
          onClick={() => setCurrentTool(ANNOTATION_TOOLS.REDACT)}
          style={{
            padding: '6px 12px',
            backgroundColor: currentTool === ANNOTATION_TOOLS.REDACT ? '#F44336' : '#e0e0e0',
            color: currentTool === ANNOTATION_TOOLS.REDACT ? 'white' : '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          ⬛ Redakte
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e0e0e0', margin: '0 8px' }} />

        <button
          onClick={handleExport}
          style={{
            padding: '6px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          💾 Dışa Aktar
        </button>

        {redactions.length > 0 && (
          <button
            onClick={handleExportRedacted}
            style={{
              padding: '6px 12px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            🔒 Redakte Et ve Dışa Aktar
          </button>
        )}

        <button
          onClick={() => {
            annotationManager.clearAnnotations();
            redactionManager.clearRedactions();
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: '#9E9E9E',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          🗑️ Temizle
        </button>
      </div>

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
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '2px',
              }}
            />
            <canvas
              ref={overlayCanvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
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
  );
}
