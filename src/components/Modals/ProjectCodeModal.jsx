import { useState } from "react";
import { Copy, Check, X, Save } from "lucide-react";

export default function ProjectCodeModal({ code, onClose }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <Save size={22} />
                        <h2 className="text-lg font-bold">Proje Kaydedildi!</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                    <p className="text-gray-600 text-sm mb-4">
                        Projeniz başarıyla kaydedildi. Aşağıdaki kodu saklayın, bu kod ile
                        projenizi tekrar açabilirsiniz.
                    </p>

                    {/* Code Display */}
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">
                            Proje Kodu
                        </div>
                        <div className="text-4xl font-mono font-bold tracking-[0.3em] text-gray-800 select-all">
                            {code}
                        </div>
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${copied
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {copied ? (
                            <>
                                <Check size={18} />
                                Kopyalandı!
                            </>
                        ) : (
                            <>
                                <Copy size={18} />
                                Kodu Kopyala
                            </>
                        )}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        💡 Bu kodu ana sayfadaki "Proje Kodu ile Aç" bölümüne girerek
                        projenizi geri yükleyebilirsiniz.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
}
