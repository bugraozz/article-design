import {
  Type,
  Image,
  FilePlus,
  Download,
  FileText,
  Grid3x3,
  Sigma,
  PenTool,
} from "lucide-react";

export default function MainToolbar({
  onAddText,
  onAddImage,
  onAddTable,
  onAddPage,
  onExport,
  onExportPDF,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
}) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-3 flex gap-4 items-center shadow-sm">
      {/* Sol Grup - İçerik Ekleme */}
      <div className="flex gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">İçerik</span>
        
        <button
          onClick={onAddText}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <Type size={18} className="text-blue-500" />
          Metin
        </button>

        <button
          onClick={onAddImage}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <Image size={18} className="text-emerald-500" />
          Resim
        </button>

        <button
          onClick={onAddTable}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <Grid3x3 size={18} className="text-orange-500" />
          Tablo
        </button>

        <button
          onClick={onAddPage}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <FilePlus size={18} className="text-purple-500" />
          Sayfa
        </button>
      </div>

      <div className="flex-1 border-l border-gray-300"></div>

      {/* Matematik Grup - Denklem & Sembol */}
      <div className="flex gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Matematik</span>
        
        <button
          onClick={onOpenEquationEditor}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <Sigma size={18} className="text-purple-500" />
          Denklem
        </button>

        <button
          onClick={onOpenMathSymbolPanel}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <PenTool size={18} className="text-indigo-500" />
          Sembol
        </button>
      </div>

      <div className="flex-1 border-l border-gray-300"></div>

      {/* Sağ Grup - Dışa Aktarma */}
      <div className="flex gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Dışa Aktar</span>
        
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <Download size={18} className="text-amber-500" />
          PNG
        </button>

        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-rose-400 hover:bg-rose-50 transition-all duration-150 font-medium text-gray-700 text-sm hover:shadow-md"
        >
          <FileText size={18} className="text-rose-500" />
          PDF
        </button>
      </div>
    </div>
  );
}
