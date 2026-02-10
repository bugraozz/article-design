import { useState } from "react";
import {
  Type,
  Image,
  FilePlus,
  Download,
  FileText,
  Grid3x3,
  Sigma,
  PenTool,
  Layout,
  FileEdit,
  Eye,
  EyeOff,
  Upload,
  Save,
  Loader2,
  ChevronDown,
  Sparkles
} from "lucide-react";

export default function MainToolbar({
  onAddText,
  onAddImage,
  onAddTable,
  onAddPage,
  onShowTemplateModal,
  onExport,
  onExportPDF,
  onExportAdobePDF,
  onExportAdobeWord,
  onOpenEquationEditor,
  onOpenMathSymbolPanel,
  onOpenWordDocumentModal,
  cleanView = false,
  onToggleCleanView,
  onSaveProject,
  isSavingProject = false,
}) {
  const [showPageModeMenu, setShowPageModeMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="w-[calc(100%-32px)] mx-auto mt-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/20 px-6 py-3 flex gap-4 items-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] sticky top-4 z-40 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(244,63,94,0.1)]">

      {/* Sol Grup - İçerik Ekleme */}
      <div className="flex gap-2 items-center">
        <div className="flex flex-col mr-1 hidden xl:flex">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-0.5">Editör</span>

        </div>

        <button
          onClick={onAddText}
          className="group flex items-center gap-2 px-3 py-2 bg-white/50 border border-neutral-200/60 rounded-xl hover:border-rose-200 hover:bg-gradient-to-br hover:from-white hover:to-rose-50 transition-all duration-300 font-medium text-neutral-600 text-sm shadow-sm hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5"
        >
          <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-red-600 transition-all duration-300 shadow-inner group-hover:shadow-rose-500/20">
            <Type size={16} />
          </div>
          <span className="group-hover:text-neutral-900 transition-colors font-semibold">Metin</span>
        </button>

        <button
          onClick={onAddImage}
          className="group flex items-center gap-2 px-3 py-2 bg-white/50 border border-neutral-200/60 rounded-xl hover:border-rose-200 hover:bg-gradient-to-br hover:from-white hover:to-rose-50 transition-all duration-300 font-medium text-neutral-600 text-sm shadow-sm hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5"
        >
          <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-red-600 transition-all duration-300 shadow-inner group-hover:shadow-rose-500/20">
            <Image size={16} />
          </div>
          <span className="group-hover:text-neutral-900 transition-colors font-semibold">Resim</span>
        </button>

        <button
          onClick={onAddTable}
          className="group flex items-center gap-2 px-3 py-2 bg-white/50 border border-neutral-200/60 rounded-xl hover:border-rose-200 hover:bg-gradient-to-br hover:from-white hover:to-rose-50 transition-all duration-300 font-medium text-neutral-600 text-sm shadow-sm hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5"
        >
          <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-red-600 transition-all duration-300 shadow-inner group-hover:shadow-rose-500/20">
            <Grid3x3 size={16} />
          </div>
          <span className="group-hover:text-neutral-900 transition-colors font-semibold">Tablo</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowPageModeMenu(!showPageModeMenu)}
            className="group flex items-center gap-2 px-3 py-2 bg-white/50 border border-neutral-200/60 rounded-xl hover:border-rose-200 hover:bg-gradient-to-br hover:from-white hover:to-rose-50 transition-all duration-300 font-medium text-neutral-600 text-sm shadow-sm hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-0.5"
          >
            <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-red-600 transition-all duration-300 shadow-inner group-hover:shadow-rose-500/20">
              <FilePlus size={16} />
            </div>
            <span className="group-hover:text-neutral-900 transition-colors font-semibold">Sayfa</span>
            <ChevronDown size={12} className="text-neutral-400 group-hover:text-rose-500 transition-colors" />
          </button>

          {showPageModeMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-rose-100 rounded-xl shadow-xl shadow-rose-900/10 z-[100] min-w-[200px] p-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  onAddPage("document");
                  setShowPageModeMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 rounded-lg text-left text-sm transition-colors group"
              >
                <div className="p-1.5 bg-white border border-rose-100 rounded-lg text-rose-500 shadow-sm group-hover:border-rose-200">
                  <FileEdit size={16} />
                </div>
                <div>
                  <div className="font-bold text-neutral-700 group-hover:text-neutral-900">Belge Sayfası</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Standart editör</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onAddPage("blank");
                  setShowPageModeMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 rounded-lg text-left text-sm transition-colors group"
              >
                <div className="p-1.5 bg-white border border-rose-100 rounded-lg text-rose-500 shadow-sm group-hover:border-rose-200">
                  <Layout size={16} />
                </div>
                <div>
                  <div className="font-bold text-neutral-700 group-hover:text-neutral-900">Boş Sayfa</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Serbest çalışma alanı</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onShowTemplateModal();
                  setShowPageModeMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-50 rounded-lg text-left text-sm transition-colors group"
              >
                <div className="p-1.5 bg-white border border-rose-100 rounded-lg text-rose-500 shadow-sm group-hover:border-rose-200">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="font-bold text-neutral-700 group-hover:text-neutral-900">Şablon Galerisi</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Hazır tasarımlar</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Matematik Grup - Denklem & Sembol */}
      <div className="flex gap-2 items-center pl-4 border-l border-slate-200/60">
        <div className="flex flex-col mr-1 hidden xl:flex">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-0.5">Araçlar</span>

        </div>

        <button
          onClick={onOpenEquationEditor}
          className="group flex items-center gap-2 px-3 py-2 bg-white/50 border border-neutral-200/60 rounded-xl hover:border-violet-200 hover:bg-gradient-to-br hover:from-white hover:to-violet-50 transition-all duration-300 font-medium text-neutral-600 text-sm shadow-sm hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
        >
          <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-purple-600 transition-all duration-300 shadow-inner group-hover:shadow-violet-500/20">
            <Sigma size={16} />
          </div>
          <span className="group-hover:text-neutral-900 transition-colors font-semibold">Denklem</span>
        </button>

        <button
          onClick={onOpenMathSymbolPanel}
          className="group flex items-center gap-2 px-3 py-2 bg-white/50 border border-neutral-200/60 rounded-xl hover:border-orange-200 hover:bg-gradient-to-br hover:from-white hover:to-orange-50 transition-all duration-300 font-medium text-neutral-600 text-sm shadow-sm hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5"
        >
          <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-600 transition-all duration-300 shadow-inner group-hover:shadow-orange-500/20">
            <PenTool size={16} />
          </div>
          <span className="group-hover:text-neutral-900 transition-colors font-semibold">Sembol</span>
        </button>
      </div>

      <div className="flex-1"></div>

      {/* Görünüm Toggle */}
      <button
        onClick={onToggleCleanView}
        className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-wider hover:shadow-md ${cleanView
          ? "bg-gradient-to-r from-neutral-800 to-neutral-700 border-transparent text-white shadow-lg shadow-neutral-900/20 ring-2 ring-neutral-200 ring-offset-2 scale-105"
          : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-900 hover:bg-neutral-50"
          }`}
        title={cleanView ? "Düzenleme moduna geç" : "Temiz görünüm (grid/kontroller gizli)"}
      >
        {cleanView ? <EyeOff size={16} /> : <Eye size={16} />}
        {cleanView ? "Düzenleme" : "Önizleme"}
      </button>

      {/* Projeyi Kaydet */}
      <button
        onClick={onSaveProject}
        disabled={isSavingProject}
        className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 ${isSavingProject
          ? "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed"
          : "bg-gradient-to-r from-emerald-500 to-green-600 border-transparent text-white shadow-green-900/20"
          }`}
      >
        {isSavingProject ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {isSavingProject ? "Kaydediliyor..." : "Projeyi Kaydet"}
      </button>

      {/* Sağ Grup - Dışa Aktarma */}
      <div className="flex gap-2 items-center relative pl-4 border-l border-neutral-200">

        <button
          onClick={onExportPDF}
          className="group flex items-center justify-center w-10 h-10 bg-white border border-neutral-600 rounded-xl hover:border-neutral-600 hover:bg-neutral-50 transition-all duration-200 text-neutral-800 hover:text-neutral-900 shadow-sm"
          title="Hızlı PDF İndir"
        >
          <Download size={18} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all duration-200 font-bold text-xs uppercase tracking-wider shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="text-rose-300"><FileText size={16} /></span>
            Dışa Aktar
            <ChevronDown size={12} className="opacity-50" />
          </button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-3 bg-white border border-rose-100 rounded-xl shadow-2xl shadow-rose-900/10 z-[100] min-w-[240px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100">
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Premium Export
                </div>
              </div>

              <button
                onClick={() => {
                  onExportAdobePDF?.();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 text-left transition-colors group border-b border-neutral-50"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-bold text-neutral-800 text-sm group-hover:text-red-600 transition-colors">Adobe PDF</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Yüksek kalite vektörel çıktı</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onExportAdobeWord?.();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 text-left transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-bold text-neutral-800 text-sm group-hover:text-blue-600 transition-colors">Microsoft Word</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Düzenlenebilir .docx belgesi</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
