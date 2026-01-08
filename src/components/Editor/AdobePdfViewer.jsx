// src/components/Editor/AdobePdfViewer.jsx
// Adobe PDF Embed API ile PDF'leri birebir görüntüleme

import { useEffect, useRef } from 'react';

export default function AdobePdfViewer({ pdfUrl, fileName = 'document.pdf' }) {
  const viewerRef = useRef(null);
  const adobeViewRef = useRef(null);

  useEffect(() => {
    // Adobe DC View SDK hazır mı kontrol et
    if (window.AdobeDC && viewerRef.current && pdfUrl) {
      initializeAdobeViewer();
    }

    return () => {
      // Cleanup
      if (adobeViewRef.current) {
        try {
          adobeViewRef.current = null;
        } catch (error) {
          console.error('Adobe viewer cleanup error:', error);
        }
      }
    };
  }, [pdfUrl]);

  const initializeAdobeViewer = () => {
    try {
      console.log('📄 Initializing Adobe PDF Embed API...');

      // Adobe DC View instance oluştur
      const adobeDCView = new window.AdobeDC.View({
        clientId: import.meta.env.VITE_ADOBE_CLIENT_ID || "YOUR_CLIENT_ID", // Adobe Embed API Client ID
        divId: "adobe-dc-view",
      });

      adobeViewRef.current = adobeDCView;

      // PDF'i base64'ten blob'a çevir
      let filePromise;
      
      if (pdfUrl.startsWith('data:application/pdf;base64,')) {
        // Base64 PDF
        const base64Data = pdfUrl.split(',')[1];
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        filePromise = Promise.resolve(blob.arrayBuffer());
      } else {
        // URL PDF
        filePromise = fetch(pdfUrl).then(response => response.arrayBuffer());
      }

      // PDF'i render et
      filePromise.then(arrayBuffer => {
        adobeDCView.previewFile(
          {
            content: { promise: Promise.resolve(arrayBuffer) },
            metaData: { fileName: fileName }
          },
          {
            embedMode: "SIZED_CONTAINER", // Sabit boyutlu container
            showDownloadPDF: true,
            showPrintPDF: true,
            showLeftHandPanel: true,
            showAnnotationTools: false, // Düzenleme yok
            showPageControls: true,
            showZoomControl: true,
          }
        );

        console.log('✅ Adobe PDF Embed API initialized successfully');
      });

    } catch (error) {
      console.error('❌ Adobe PDF Embed API error:', error);
    }
  };

  return (
    <div 
      ref={viewerRef}
      id="adobe-dc-view" 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '800px'
      }}
    />
  );
}
