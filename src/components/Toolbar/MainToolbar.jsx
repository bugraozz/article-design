import {
  Type,
  Image,
  FilePlus,
  Download,
  FileText,
  Grid3x3,
} from "lucide-react";

export default function MainToolbar({
  onAddText,
  onAddImage,
  onAddTable,
  onAddPage,
  onExport,
  onExportPDF,
}) {
  return (
    <div className="w-full bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-3 flex gap-4 items-center shadow-sm">
      {/* Sol Grup - İçerik Ekleme */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-semibold text-gray-600">İçerik:</span>
        
        <button
          onClick={onAddText}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition font-medium text-gray-700"
        >
          <Type size={18} className="text-blue-500" />
          Metin Ekle
        </button>

        <button
          onClick={onAddImage}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition font-medium text-gray-700"
        >
          <Image size={18} className="text-green-500" />
          Resim Ekle
        </button>

        <button
          onClick={onAddTable}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition font-medium text-gray-700"
        >
          <Grid3x3 size={18} className="text-orange-500" />
          Tablo Ekle
        </button>

        <button
          onClick={onAddPage}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition font-medium text-gray-700"
        >
          <FilePlus size={18} className="text-purple-500" />
          Yeni Sayfa
        </button>
      </div>

      <div className="flex-1 border-l border-gray-300"></div>

      {/* Sağ Grup - Dışa Aktarma */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-semibold text-gray-600">Dışa Aktar:</span>
        
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-amber-50 hover:border-amber-400 transition font-medium text-gray-700"
        >
          <Download size={18} className="text-amber-500" />
          PNG
        </button>

        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition font-medium text-gray-700"
        >
          <FileText size={18} className="text-red-500" />
          PDF
        </button>
      </div>
    </div>
  );
}
