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
      
      // Word dosyası için: Adobe Extract API kullan (Word → PDF → Extract)
      // Bu sayede orijinal sayfa yapısı korunur
      if (fileType === 'Word') {
        console.log("📄 Word dosyası Adobe Extract API ile işleniyor...");
        const extractedData = await adobeService.wordToPdfAndExtract(file);
        console.log("✅ Word içeriği Adobe Extract API ile çıkarıldı:", extractedData);
        
        // Adobe Extract → HTML sayfalarına dönüştür (PDF okuyucu gibi)
        const pages = renderPdfToPages(extractedData);
        console.log("✅ Word sayfaları oluşturuldu:", pages.length);
        
        nav("/editor", { state: { pages } });
      } 
      // PDF dosyası için: Dosyayı olduğu gibi kaydet ve Adobe Embed API ile göster
      else {
        // PDF'i base64'e çevir
        const reader = new FileReader();
        reader.onload = (e) => {
          const pdfBase64 = e.target.result; // data:application/pdf;base64,...
          
          // Adobe Embed API ile görüntülemek için PDF'i direkt kaydet
          nav("/editor", { 
            state: { 
              pdfFile: pdfBase64,
              fileName: file.name,
              mode: 'pdf-viewer' 
            } 
          });
        };
        reader.readAsDataURL(file);
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
