import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js Worker'ı ayarla - local public folder üzerinden sunulan worker dosyasını kullan
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

export default function SimplePdfViewer({ pdfUrl, fileName = 'document.pdf' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.5);

  // PDF'i yükle
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let pdfData;

        if (pdfUrl.startsWith('data:application/pdf;base64,')) {
          // Base64 PDF
          const base64Data = pdfUrl.split(',')[1];
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfData = bytes;
        } else {
          // URL PDF
          const response = await fetch(pdfUrl);
          pdfData = await response.arrayBuffer();
        }

        if (!isMounted) return;

        const doc = await pdfjsLib.getDocument({ data: pdfData }).promise;
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

  // Sayfayı render et
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
      
      // Yaklaşık olarak sayfa en-boy oranını hesapla
      const pageAspect = 8.5 / 11; // Standart A4 sayfası
      
      const fitToWidth = containerWidth / (8.5 * 96); // 96 DPI
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
      {/* Araç Çubuğu */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          flexShrink: 0,
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

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        </div>
      </div>

      {/* PDF Yükleme Durumu */}
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

      {/* Hata Gösterimi */}
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

      {/* PDF Canvas */}
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
        </div>
      )}
    </div>
  );
}
