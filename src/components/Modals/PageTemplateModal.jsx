import React, { useState } from 'react';
import { pageTemplates } from '../../types/article';

const PageTemplateModal = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  if (!isOpen) return null;

  const templates = Object.entries(pageTemplates);

  // Kategorilere göre şablonları grupla
  const categories = {
    all: 'Tümü',
    basic: 'Temel',
    layout: 'Düzenler',
    academic: 'Akademik',
    creative: 'Yaratıcı'
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(([_, template]) => template.category === selectedCategory);

  const handleTemplateClick = (templateKey) => {
    onSelectTemplate(templateKey);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[200] backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Sayfa Şablonu Seç</h2>
              <p className="text-indigo-100 text-sm">Hazır düzenlerle hızlı başlayın</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-all text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === key
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(([key, template]) => (
              <div
                key={key}
                onClick={() => handleTemplateClick(key)}
                onMouseEnter={() => setHoveredTemplate(key)}
                onMouseLeave={() => setHoveredTemplate(null)}
                className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                  hoveredTemplate === key
                    ? 'border-indigo-500 shadow-xl'
                    : 'border-gray-200 shadow-md'
                }`}
              >
                {/* Template Preview Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3 transform transition-transform duration-300 hover:scale-110">
                      {template.icon}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 transition-colors ${
                      hoveredTemplate === key ? 'text-indigo-600' : 'text-gray-800'
                    }`}>
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  </div>

                  {/* Mini Preview */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="aspect-[7/10] bg-gradient-to-b from-gray-100 to-white rounded flex items-center justify-center">
                      <div className="text-4xl opacity-20">{template.icon}</div>
                    </div>
                  </div>

                  {/* Features */}
                  {template.features && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {template.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                {hoveredTemplate === key && (
                  <div className="absolute inset-0 bg-indigo-600 bg-opacity-10 flex items-center justify-center">
                    <div className="bg-white rounded-full px-6 py-3 shadow-lg font-semibold text-indigo-600">
                      Seç
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">Bu kategoride şablon bulunamadı</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{filteredTemplates.length}</span> şablon mevcut
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            İptal
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PageTemplateModal;
