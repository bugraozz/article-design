// src/components/Panels/TextEditorModal.jsx
import TiptapEditor from "../../overlays/TiptapEditor";
import { X } from "lucide-react";

export default function TextEditorModal({
  html,
  onChange,
  onClose,
  onEditorReady,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Metni Düzenle</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <TiptapEditor
            initialContent={html}
            onChange={onChange}
            onEditorReady={onEditorReady}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
