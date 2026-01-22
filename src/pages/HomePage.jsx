import { useNavigate } from "react-router-dom";
import { useState } from "react";
import adobeService from "../services/adobeService";
import { parseDocument } from "../utils/documentParser";
import { renderPdfToPages } from "../utils/pdfRenderer";

export default function HomePage() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      console.log(`📄 ${fileType} dosyası yükleniyor:`, file.name);

      let parsedContent;

      // Word dosyası için: Collabora entegrasyonu (dosyayı sunucuya yükle ve Collabora iframe ile aç)
      if (fileType === 'Word') {
        console.log("📄 Word dosyası Collabora için yüklenecek...");

        // Form data oluştur
        const formData = new FormData();
        formData.append('file', file);

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const resp = await fetch(`${backendUrl}/api/upload-for-collabora`, {
          method: 'POST',
          body: formData,
        });

        if (!resp.ok) {
          throw new Error(`Upload failed: ${resp.statusText}`);
        }

        const result = await resp.json();
        console.log('✅ Collabora için yüklendi:', result);

        // Collabora iframe URL, fileId ve access token al
        const collaboraUrl = result.collaboraUrl;
        const fileId = result.fileId;
        const accessToken = result.accessToken;

        // Collabora editör sayfasına yönlendir (WOPI tabanlı)
        nav('/collabora', { state: { collaboraUrl, fileId, accessToken, fileName: file.name } });
      }

      // PDF dosyası için: Dosyayı olduğu gibi kaydet ve Adobe Embed API ile göster
      else {
        console.log("📄 PDF dosyası sunucuya yükleniyor...");

        // Form data oluştur
        const formData = new FormData();
        formData.append('file', file);

        // Backend'e yükle
        // Not: .env dosyasındaki VITE_BACKEND_URL'i kullanıyoruz
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/upload-pdf`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ PDF yüklendi, URL:", result.url);

        // Adobe Embed API ile görüntülemek için PDF URL'ini gönder
        nav("/editor", {
          state: {
            pdfFile: result.url,
            fileName: file.name,
            mode: 'pdf-viewer'
          }
        });
      }

    } catch (error) {
      console.error(`❌ ${fileType} yükleme hatası:`, error);
      alert(`Dosya yüklenirken hata oluştu: ${error.message}\n\nLütfen backend sunucusunun çalıştığından emin olun.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gray-100">

      <h1 className="text-4xl font-bold text-gray-800">
        Dergi / Makale Editör
      </h1>

      {isLoading && (
        <div className="text-lg text-blue-600 font-medium">
          📄 Dosya yükleniyor, lütfen bekleyin...
        </div>
      )}

      <button
        onClick={() => nav("/editor")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        disabled={isLoading}
      >
        Yeni Boş Döküman Oluştur
      </button>

      <button
        onClick={() => nav("/academic-article-setup")}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
        disabled={isLoading}
      >
        Akademik Makale Oluştur
      </button>

      <label className={`px-6 py-3 bg-green-600 text-white rounded-lg shadow cursor-pointer hover:bg-green-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        Word Dosyası Yükle (.docx)
        <input
          type="file"
          className="hidden"
          accept=".docx,.doc"
          onChange={(e) => handleFileUpload(e, 'Word')}
          disabled={isLoading}
        />
      </label>

      <label className={`px-6 py-3 bg-purple-600 text-white rounded-lg shadow cursor-pointer hover:bg-purple-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        PDF Dosyası Yükle (.pdf)
        <input
          type="file"
          className="hidden"
          accept=".pdf"
          onChange={(e) => handleFileUpload(e, 'PDF')}
          disabled={isLoading}
        />
      </label>

      <p className="text-sm text-gray-500 max-w-md text-center mt-4">
        💡 <strong>Adobe PDF Services</strong> kullanılarak yüksek kaliteli belge işleme
      </p>

    </div>
  );
}
