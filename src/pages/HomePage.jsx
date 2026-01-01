import { useNavigate } from "react-router-dom";
import { useState } from "react";
import adobeService from "../services/adobeService";
import { parseDocumentToPages } from "../utils/documentConverter";

export default function HomePage() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      console.log(`📄 ${fileType} dosyası yükleniyor:`, file.name);
      
      let extractedData;
      
      // Word dosyası için: Word → PDF → Extract pipeline
      if (fileType === 'Word') {
        extractedData = await adobeService.wordToPdfAndExtract(file);
      } 
      // PDF dosyası için: Doğrudan Extract
      else {
        extractedData = await adobeService.extractDocument(file);
      }
      
      console.log("✅ İçerik Adobe SDK ile çıkarıldı:", extractedData);
      
      // Sayfalara dönüştür
      const pages = parseDocumentToPages(extractedData);
      console.log("✅ Sayfalar oluşturuldu:", pages.length);
      
      // Editor'e geç ve sayfaları gönder
      nav("/editor", { state: { pages } });
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
