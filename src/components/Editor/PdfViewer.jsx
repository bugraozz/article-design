// src/components/Editor/PdfViewer.jsx
// SimplePdfViewer - PDF.js tabanlı hafif PDF görüntüleyicisi
import SimplePdfViewer from './SimplePdfViewer';

// Eğer htmlContent HTML string ise, eski davranışı koru
// Eğer pdfUrl base64 PDF ise, SimplePdfViewer'ı kullan
export default function PdfViewer({ htmlContent, pdfUrl, fileName = 'document.pdf' }) {
  console.log('📄 PdfViewer rendering');

  // SimplePdfViewer'ı kullan (pdfUrl varsa)
  if (pdfUrl) {
    return <SimplePdfViewer pdfUrl={pdfUrl} fileName={fileName} />;
  }

  // HTML content'i göster (eski davranış)
  if (htmlContent) {
    return (
      <div 
        className="pdf-viewer-container"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'auto',
          background: '#f5f5f5',
          padding: '0',
          margin: '0'
        }}
      >
        <div 
          className="pdf-page-wrapper"
          style={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            margin: '0',
            padding: '0'
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    );
  }

  // Hiçbir içerik yoksa boş ekran
  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
        color: '#999',
        fontSize: '16px'
      }}
    >
      📄 PDF veya içerik yükleyin
    </div>
  );
}
