// src/components/Modals/InstitutionInputModal.jsx
import { useState, useEffect } from "react";

export default function InstitutionInputModal({ isOpen, onClose, onSave, initialInstitutions = [] }) {
  const [institutions, setInstitutions] = useState(
    initialInstitutions.length > 0 ? initialInstitutions : [{ 
      number: "1", 
      university: "", 
      faculty: "", 
      department: "", 
      city: "", 
      country: "TÜRKİYE" 
    }]
  );

  useEffect(() => {
    if (initialInstitutions.length > 0) {
      setInstitutions(initialInstitutions);
    }
  }, [initialInstitutions]);

  const addInstitution = () => {
    const nextNumber = String(institutions.length + 1);
    setInstitutions([...institutions, { 
      number: nextNumber, 
      university: "", 
      faculty: "", 
      department: "", 
      city: "", 
      country: "TÜRKİYE" 
    }]);
  };

  const removeInstitution = (index) => {
    if (institutions.length > 1) {
      setInstitutions(institutions.filter((_, i) => i !== index));
    }
  };

  const updateInstitution = (index, field, value) => {
    const updated = institutions.map((inst, i) =>
      i === index ? { ...inst, [field]: value } : inst
    );
    setInstitutions(updated);
  };

  const handleSave = () => {
    // Boş olmayan kurumları kaydet
    const validInstitutions = institutions.filter(
      inst => inst.university.trim() !== "" || inst.faculty.trim() !== "" || inst.department.trim() !== ""
    );
    if (validInstitutions.length > 0) {
      onSave(validInstitutions);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-[700px] max-h-[80vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">Kurum Bilgileri</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {institutions.map((inst, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Kurum {index + 1}</h3>
                {institutions.length > 1 && (
                  <button
                    onClick={() => removeInstitution(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Sil
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numara <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inst.number}
                    onChange={(e) => updateInstitution(index, "number", e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Üniversite
                  </label>
                  <input
                    type="text"
                    value={inst.university}
                    onChange={(e) => updateInstitution(index, "university", e.target.value)}
                    placeholder="Örn: Cumhuriyet Üniversitesi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fakülte
                  </label>
                  <input
                    type="text"
                    value={inst.faculty}
                    onChange={(e) => updateInstitution(index, "faculty", e.target.value)}
                    placeholder="Örn: Diş Hekimliği Fakültesi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bölüm
                  </label>
                  <input
                    type="text"
                    value={inst.department}
                    onChange={(e) => updateInstitution(index, "department", e.target.value)}
                    placeholder="Örn: Restoratif Diş Tedavisi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={inst.city}
                    onChange={(e) => updateInstitution(index, "city", e.target.value)}
                    placeholder="Örn: Sivas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ülke
                  </label>
                  <input
                    type="text"
                    value={inst.country}
                    onChange={(e) => updateInstitution(index, "country", e.target.value)}
                    placeholder="TÜRKİYE"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addInstitution}
          className="w-full mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
        >
          + Yeni Kurum Ekle
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
