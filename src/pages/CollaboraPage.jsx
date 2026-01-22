import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function CollaboraPage() {
  const location = useLocation();
  const state = location.state || {};
  const providedCollaboraUrl = state.collaboraUrl;
  const fileId = state.fileId;
  const accessToken = state.accessToken;
  const fileName = state.fileName || 'document.docx';

  const [iframeSrc, setIframeSrc] = useState(providedCollaboraUrl || '');

  useEffect(() => {
    async function buildCollaboraUrl() {
      if (!providedCollaboraUrl && fileId && accessToken) {
        const collaboraBase = import.meta.env.VITE_COLLABORA_URL || 'http://localhost:9980';
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const wopiSrc = `${backendUrl.replace(/\/$/, '')}/wopi/files/${fileId}`;

        // Try to get the correct editor URL from discovery
        let editorPath = '/browser/dist/cool.html'; // Default for newer Collabora
        try {
          const discoveryRes = await fetch(`${collaboraBase.replace(/\/$/, '')}/hosting/discovery`);
          if (discoveryRes.ok) {
            const xml = await discoveryRes.text();
            const match = xml.match(/urlsrc="([^"]+)"/);
            if (match && match[1]) {
              // Extract just the path from the full URL
              const url = new URL(match[1]);
              editorPath = url.pathname;
              console.log('✅ Got Collabora editor path from discovery:', editorPath);
            }
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch Collabora discovery, using fallback path');
        }

        const built = `${collaboraBase.replace(/\/$/, '')}${editorPath}?WOPISrc=${encodeURIComponent(wopiSrc)}&access_token=${encodeURIComponent(accessToken)}`;
        setIframeSrc(built);
      }
    }
    buildCollaboraUrl();
  }, [providedCollaboraUrl, fileId, accessToken]);

  if (!iframeSrc) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-semibold">Collabora editor başlatılamıyor</h2>
        <p className="mt-4">Dosya URL'i veya Collabora ayarı eksik.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-2 bg-gray-50 border-b flex items-center justify-between">
        <div className="ml-2">
          <strong>Collabora Online</strong>
          <span className="ml-3 text-sm text-gray-600">{fileName}</span>
        </div>
        <div className="mr-2 flex gap-2">
          <a href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/wopi/files/${fileId}/contents?access_token=${accessToken}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white border rounded text-sm">Dosyayı Yeni Sekmede Aç</a>
          <button onClick={() => window.open(iframeSrc, '_blank')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Collabora'yu Ayrı Pencerede Aç</button>
        </div>
      </div>

      <iframe
        title="Collabora Editor"
        src={iframeSrc}
        style={{ flex: 1, width: '100%', border: '0' }}
      />
    </div>
  );
}
