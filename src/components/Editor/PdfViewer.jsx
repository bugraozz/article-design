// src/components/Editor/PdfViewer.jsx
// Import edilen PDF/Word dosyalarını orijinal düzeniyle gösterir

export default function PdfViewer({ htmlContent }) {
  console.log('📄 PdfViewer rendering, HTML length:', htmlContent?.length);
  
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
