import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FilePlus,
  GraduationCap,
  FileText,
  FileUp,
  ArrowRight,
  Loader2,
  Sparkles,
  Command,
  Flame,
  Zap,
  Globe,
  ShieldCheck,
  HelpCircle
} from "lucide-react";

export default function HomePage() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Proje kodu ile açma
  const [projectCodeInput, setProjectCodeInput] = useState("");
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectError, setProjectError] = useState("");

  const loadProject = async () => {
    const code = projectCodeInput.trim().toUpperCase();
    if (!code) {
      setProjectError("Lütfen bir proje kodu girin");
      return;
    }
    if (code.length !== 8) {
      setProjectError("Proje kodu 8 haneli olmalıdır");
      return;
    }

    setIsLoadingProject(true);
    setProjectError("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/projects/${code}`);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Proje bulunamadı');
      }

      const result = await response.json();
      console.log(`📂 Proje yüklendi: ${code}`);

      nav("/editor", {
        state: {
          projectData: result.data
        }
      });
    } catch (error) {
      console.error('❌ Proje yükleme hatası:', error);
      setProjectError(error.message);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleFileUpload = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      console.log(`📄 ${fileType} dosyası yükleniyor:`, file.name);

      if (fileType === 'Word') {
        const formData = new FormData();
        formData.append('file', file);

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const resp = await fetch(`${backendUrl}/api/upload-for-collabora`, {
          method: 'POST',
          body: formData,
        });

        if (!resp.ok) throw new Error(`Upload failed: ${resp.statusText}`);

        const result = await resp.json();
        nav('/collabora', { state: { collaboraUrl: result.collaboraUrl, fileId: result.fileId, accessToken: result.accessToken, fileName: file.name } });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/upload-pdf`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

        const result = await response.json();
        nav("/editor", {
          state: {
            pdfFile: result.url,
            fileName: file.name,
            mode: 'pdf-viewer',
            pdfCleanupToken: result.cleanupToken,
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
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden font-sans text-neutral-900 bg-neutral-50 selection:bg-rose-100 selection:text-rose-900">

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-rose-600 animate-spin relative z-10" />
          </div>
          <div className="text-2xl font-bold text-neutral-800 mt-6 tracking-tight">Belgeniz Hazırlanıyor</div>
        </div>
      )}

      {/* LEFT PANEL (BRANDING & HERO) - 40% Width on Desktop */}
      <div className="w-full lg:w-5/12 h-2/5 lg:h-full relative bg-neutral-900 flex flex-col justify-between p-8 lg:p-12 overflow-hidden shrink-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-rose-950 to-neutral-950"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

        {/* Animated Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] mix-blend-screen -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[100px] mix-blend-screen -ml-20 -mb-20 animate-blob"></div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center lg:justify-center">

          {/* Logo area */}
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-900/50">
              <Flame size={24} className="text-orange-500 animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]" fill="currentColor" fillOpacity={0.7} />
            </div>
            <span className="text-xl lg:text-2xl font-bold text-white tracking-wide">
              Article<span className="text-rose-400">Editor</span>
            </span>
          </div>

          {/* Hero Text */}
          <div className="mb-6 lg:mb-10">

            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tight">
              Profesyonel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
                İçerik Üretimi.
              </span>
            </h1>
            <p className="text-sm lg:text-lg text-rose-100/80 leading-relaxed max-w-md hidden lg:block">
              Akademik makalelerden kurumsal raporlara kadar her türlü dokümanı tek bir platformda hazırlayın, düzenleyin ve paylaşın.
            </p>
          </div>

          {/* Footer Links (Left Side) */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-rose-200/60 mt-auto pt-10">
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><Globe size={12} /> TR / EN</span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><ShieldCheck size={12} /> Gizlilik</span>
            <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"><HelpCircle size={12} /> Yardım</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (ACTIONS) - 60% Width on Desktop */}
      <div className="w-full lg:w-7/12 h-3/5 lg:h-full bg-neutral-50 flex flex-col justify-center items-center p-6 lg:p-12 relative overflow-y-auto lg:overflow-visible">

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

          {/* Create New Project */}
          <button
            onClick={() => nav("/editor")}
            className="group p-6 bg-white rounded-2xl shadow-sm border border-neutral-200 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-900/10 hover:-translate-y-1 transition-all duration-300 md:col-span-1"
          >
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
              <FilePlus size={24} />
            </div>
            <h3 className="text-lg font-bold text-black mb-1 group-hover:text-rose-700">Yeni Proje</h3>
            <p className="text-xs text-black leading-relaxed mb-3">Boş bir sayfa ile başlayın.</p>
            <div className="flex items-center text-xs font-bold text-rose-600 group-hover:gap-2 transition-all">
              Oluştur <ArrowRight size={14} className="ml-1" />
            </div>
          </button>

          {/* Academic Article */}
          <button
            onClick={() => nav("/academic-article-setup")}
            className="group p-6 bg-white rounded-2xl shadow-sm border border-neutral-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/10 hover:-translate-y-1 transition-all duration-300 md:col-span-1"
          >
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-lg font-bold text-black mb-1 group-hover:text-orange-700">Akademik</h3>
            <p className="text-xs text-black leading-relaxed mb-3">APA, MLA şablonları.</p>
            <div className="flex items-center text-xs font-bold text-orange-600 group-hover:gap-2 transition-all">
              Şablon Seç <ArrowRight size={14} className="ml-1" />
            </div>
          </button>

          {/* Import Row */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-neutral-200 border-dashed hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all">
              <input type="file" className="hidden" accept=".docx,.doc" onChange={(e) => handleFileUpload(e, 'Word')} disabled={isLoading} />
              <FileText size={20} className="text-blue-500" />
              <span className="text-xs font-bold text-black">Word Yükle</span>
            </label>

            <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl border border-neutral-200 border-dashed hover:border-red-400 hover:bg-red-50/50 cursor-pointer transition-all">
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'PDF')} disabled={isLoading} />
              <FileUp size={20} className="text-red-500" />
              <span className="text-xs font-bold text-black">PDF Yükle</span>
            </label>
          </div>

          {/* Resume Project Card (Full width at bottom of grid) */}
          <div className="md:col-span-2 bg-neutral-900 text-white rounded-2xl p-6 shadow-2xl shadow-neutral-900/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/30 rounded-full blur-2xl -mr-10 -mt-10"></div>

            <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-rose-300">
                <Command size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Projeye Devam Et</span>
              </div>
              <p className="text-xs text-neutral-400">8 haneli proje kodunuzu girin.</p>
            </div>

            <div className="relative z-10 w-full md:w-auto flex gap-2">
              <input
                type="text"
                value={projectCodeInput}
                onChange={(e) => setProjectCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && loadProject()}
                maxLength={8}
                placeholder="KOD"
                className="w-24 h-10 bg-white/10 border border-green-400 rounded-lg px-2 text-center text-sm font-mono font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500 transition-all uppercase"
              />
              <button
                onClick={loadProject}
                disabled={isLoadingProject || !projectCodeInput.trim()}
                className={`h-10 px-4 rounded-lg font-bold text-xs shadow-lg transition-all flex items-center gap-2 ${isLoadingProject || !projectCodeInput.trim()
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
              >
                {isLoadingProject ? <Loader2 size={14} className="animate-spin" /> : "Yükle"}
              </button>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="md:col-span-2 lg:hidden mt-6 text-center text-[10px] text-neutral-400">
            © {new Date().getFullYear()} Article Editor • Powered by Adobe
          </div>

        </div>
      </div>
    </div>
  );
}
