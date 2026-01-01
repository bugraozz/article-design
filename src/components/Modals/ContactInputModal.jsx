// src/components/Modals/ContactInputModal.jsx
import { useState, useEffect } from "react";

export default function ContactInputModal({ isOpen, onClose, onSave, initialContacts = [] }) {
  const [contacts, setContacts] = useState(
    initialContacts.length > 0 ? initialContacts : [{ 
      email: "", 
      orcid: "",
      phone: ""
    }]
  );

  useEffect(() => {
    if (initialContacts.length > 0) {
      setContacts(initialContacts);
    }
  }, [initialContacts]);

  const addContact = () => {
    setContacts([...contacts, { email: "", orcid: "", phone: "" }]);
  };

  const removeContact = (index) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index, field, value) => {
    const updated = contacts.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    );
    setContacts(updated);
  };

  const handleSave = () => {
    // Boş olmayan iletişim bilgilerini kaydet
    const validContacts = contacts.filter(
      c => c.email.trim() !== "" || c.orcid.trim() !== "" || c.phone.trim() !== ""
    );
    if (validContacts.length > 0) {
      onSave(validContacts);
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
          <h2 className="text-xl font-bold text-gray-800">İletişim Bilgileri</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {contacts.map((contact, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">İletişim {index + 1}</h3>
                {contacts.length > 1 && (
                  <button
                    onClick={() => removeContact(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Sil
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, "email", e.target.value)}
                    placeholder="Örn: author@university.edu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ORCID ID
                  </label>
                  <input
                    type="text"
                    value={contact.orcid}
                    onChange={(e) => updateContact(index, "orcid", e.target.value)}
                    placeholder="Örn: 0000-0002-1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, "phone", e.target.value)}
                    placeholder="Örn: +90 555 123 4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addContact}
          className="w-full mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
        >
          + Yeni İletişim Ekle
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
