// src/components/Modals/AuthorInputModal.jsx
import { useState, useEffect } from "react";

export default function AuthorInputModal({ isOpen, onClose, onSave, initialAuthors = [] }) {
  const [authors, setAuthors] = useState(initialAuthors.length > 0 ? initialAuthors : [{ name: "", affiliation: "" }]);

  useEffect(() => {
    if (initialAuthors.length > 0) {
      setAuthors(initialAuthors);
    }
  }, [initialAuthors]);

  const addAuthor = () => {
    setAuthors([...authors, { name: "", affiliation: "" }]);
  };

  const removeAuthor = (index) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index));
    }
  };

  const updateAuthor = (index, field, value) => {
    const updated = authors.map((author, i) =>
      i === index ? { ...author, [field]: value } : author
    );
    setAuthors(updated);
  };

  const handleSave = () => {
    // Boş olmayan yazarları kaydet
    const validAuthors = authors.filter(a => a.name.trim() !== "");
    if (validAuthors.length > 0) {
      onSave(validAuthors);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">Yazar Bilgileri</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {authors.map((author, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Yazar {index + 1}</h3>
                {authors.length > 1 && (
                  <button
                    onClick={() => removeAuthor(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Sil
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={author.name}
                    onChange={(e) => updateAuthor(index, "name", e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kurum Numarası
                  </label>
                  <input
                    type="text"
                    value={author.affiliation}
                    onChange={(e) => updateAuthor(index, "affiliation", e.target.value)}
                    placeholder="Örn: 1 (birden fazla için: 1,2)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addAuthor}
          className="w-full mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
        >
          + Yeni Yazar Ekle
        </button>

        <div className="flex gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
