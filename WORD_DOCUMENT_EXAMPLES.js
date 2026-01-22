/**
 * Word Document Upload - Quick Start Guide
 * 
 * Bu dosya Word belge yükleme özelliğini hızlı başlamak için kullanılabilir.
 */

// ============================================================================
// 1. IMPORT'LAR
// ============================================================================

import { useState } from 'react';

// Component'ler
import WordDocumentModal from '@/components/Modals/WordDocumentModal';
import WordDocumentEditor from '@/components/Editor/WordDocumentEditor';

// Services
import {
  processWordDocumentLocally,
  getWordDocumentStats,
  extractWordDocumentElements,
  convertWordToPdf
} from '@/services/wordService';

// Utilities
import {
  processDocxFile,
  convertHtmlToMarkdown,
  prepareHtmlForPdf
} from '@/utils/docxConverter';

// ============================================================================
// 2. TEMEL KULLANIM - MODAL VE EDITOR
// ============================================================================

export function WordDocumentExample() {
  const [showModal, setShowModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [content, setContent] = useState('');

  const handleDocumentLoaded = (result) => {
    console.log('✅ Belge yüklendi:');
    console.log('   - Dosya:', result.fileName);
    console.log('   - Boyut:', result.fileSize, 'bytes');
    console.log('   - İçerik:', result.html.substring(0, 100), '...');
    
    setContent(result.html);
    setShowEditor(true);
    setShowModal(false);
  };

  return (
    <div>
      {/* Word Modal'ı Aç Buton */}
      <button 
        onClick={() => setShowModal(true)}
        style={{
          padding: '10px 20px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500'
        }}
      >
        📄 Word Dosyası Yükle
      </button>

      {/* Modal */}
      <WordDocumentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onDocumentLoaded={handleDocumentLoaded}
        title="Word Dosyası Yükle"
        showStats={true}
        showElements={true}
      />

      {/* Editor */}
      {showEditor && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <WordDocumentEditor
            initialContent={content}
            onContentChange={(html) => {
              setContent(html);
              console.log('📝 İçerik güncellendi');
            }}
            readOnly={false}
            autoSave={true}
            onError={(error) => {
              alert('Hata: ' + error.message);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. DOSYA İŞLEME ÖRNEKLERİ
// ============================================================================

// Örnek 1: Basit DOCX İşleme
export async function basicDocxProcessing(file) {
  try {
    const result = await processDocxFile(file);

    if (result.success) {
      console.log('✅ Başarılı!');
      console.log('HTML:', result.html);
      console.log('Metin:', result.text);
      return result;
    } else {
      console.error('❌ Hata:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Beklenmeyen hata:', error);
  }
}

// Örnek 2: DOCX'i İstatistikleri ile İşle
export async function processWithStats(file) {
  try {
    // Dosyayı işle
    const processResult = await processWordDocumentLocally(file, {
      extractMetadata: true,
      convertToMarkdown: true,
      preparePdf: true
    });

    if (!processResult.success) {
      throw new Error(processResult.error);
    }

    // İstatistikleri al
    const statsResult = await getWordDocumentStats(file);

    if (statsResult.success) {
      console.log('📊 İstatistikler:');
      console.log(statsResult.stats);
      return {
        ...processResult,
        stats: statsResult.stats
      };
    }

    return processResult;
  } catch (error) {
    console.error('İşleme hatası:', error);
  }
}

// Örnek 3: Belge Öğelerini Çıkar
export async function analyzeDocumentStructure(file) {
  try {
    const elementsResult = await extractWordDocumentElements(file);

    if (elementsResult.success) {
      const { elements } = elementsResult;
      
      console.log('📋 Belge Yapısı:');
      console.log(`   - Başlıklar: ${elements.headings.length}`);
      console.log(`   - Tablolar: ${elements.tables}`);
      console.log(`   - Resimler: ${elements.images}`);
      console.log(`   - Bağlantılar: ${elements.links.length}`);
      console.log(`   - Sıralı Listeler: ${elements.lists.ordered}`);
      console.log(`   - Sırasız Listeler: ${elements.lists.unordered}`);
      
      return elements;
    }
  } catch (error) {
    console.error('Analiz hatası:', error);
  }
}

// ============================================================================
// 4. İLERİ KULLANIMLARI
// ============================================================================

// Örnek 4: Markdown'a Dönüştür
export async function convertToMarkdown(file) {
  try {
    const htmlResult = await processDocxFile(file);
    
    if (htmlResult.success) {
      const markdown = convertHtmlToMarkdown(htmlResult.html);
      console.log('📄 Markdown:', markdown);
      return markdown;
    }
  } catch (error) {
    console.error('Markdown dönüştürme hatası:', error);
  }
}

// Örnek 5: PDF İçin Hazırla
export async function preparePdfExport(file) {
  try {
    const htmlResult = await processDocxFile(file);
    
    if (htmlResult.success) {
      const pdfHtml = prepareHtmlForPdf(htmlResult.html);
      console.log('✅ PDF için hazırlandı');
      return pdfHtml;
    }
  } catch (error) {
    console.error('PDF hazırlama hatası:', error);
  }
}

// ============================================================================
// 5. FORM İTEGRASYONU ÖRNEĞİ
// ============================================================================

export function WordDocumentFormExample() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    wordCount: 0,
    characterCount: 0
  });

  const handleFileSelect = async (file) => {
    try {
      // Dosyayı işle
      const result = await processWordDocumentLocally(file, {
        extractMetadata: true
      });

      if (result.success) {
        // İstatistikleri al
        const stats = await getWordDocumentStats(file);

        // Form'u güncelle
        setFormData({
          title: file.name.replace(/\.[^.]+$/, ''),
          content: result.html,
          author: 'Bilinmiyor',
          wordCount: stats.success ? stats.stats.words : 0,
          characterCount: stats.success ? stats.stats.characters : 0
        });

        console.log('✅ Form güncellendi');
      }
    } catch (error) {
      console.error('Form güncelleme hatası:', error);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Word Belge Form Örneği</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Başlık:</label>
        <input 
          type="text" 
          value={formData.title}
          readOnly
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Kelime Sayısı:</label>
        <input 
          type="number" 
          value={formData.wordCount}
          readOnly
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Karakter Sayısı:</label>
        <input 
          type="number" 
          value={formData.characterCount}
          readOnly
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <input
        type="file"
        accept=".docx,.doc"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
        style={{ padding: '8px' }}
      />
    </div>
  );
}

// ============================================================================
// 6. BATCH İŞLEME ÖRNEĞİ
// ============================================================================

export async function batchProcessFiles(files) {
  const results = [];

  for (const file of files) {
    try {
      console.log(`Processing: ${file.name}`);
      
      const result = await processWordDocumentLocally(file, {
        extractMetadata: true
      });

      if (result.success) {
        results.push({
          fileName: file.name,
          status: 'success',
          html: result.html,
          text: result.text
        });
      } else {
        results.push({
          fileName: file.name,
          status: 'error',
          error: result.error
        });
      }
    } catch (error) {
      results.push({
        fileName: file.name,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}

// ============================================================================
// 7. EVENT HANDLING ÖRNEĞİ
// ============================================================================

export function WordDocumentEventExample() {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Dosya üzerine sürükleniyor...');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        console.log('📥 Dosya bırakıldı:', file.name);
        
        const result = await basicDocxProcessing(file);
        if (result) {
          console.log('✅ Işlem başarılı');
        }
      } else {
        console.error('❌ Geçersiz dosya türü');
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        border: '2px dashed #667eea',
        padding: '40px',
        textAlign: 'center',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      <p>Dosyayı buraya sürükleyin ve bırakın</p>
    </div>
  );
}

// ============================================================================
// 8. HATAPAYLARINDEMESİ ÖRNEĞİ
// ============================================================================

export async function errorHandlingExample(file) {
  try {
    // Dosya validasyonu
    if (!file) {
      throw new Error('Dosya seçilmedi');
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      throw new Error('Lütfen .docx veya .doc dosyası seçiniz');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Dosya çok büyük (Maksimum: 10MB)');
    }

    // Dosyayı işle
    const result = await processDocxFile(file);

    if (!result.success) {
      throw new Error('Dosya işleme başarısız: ' + result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Hata:', error.message);
    // Kullanıcıya bildir
    alert('Hata: ' + error.message);
    return null;
  }
}

// ============================================================================
// QUICK START CHECKLIST
// ============================================================================

/*
✅ QUICK START ADIMLAR:

1. Bileşenleri İçe Aktar:
   - WordDocumentModal
   - WordDocumentEditor

2. State Oluştur:
   - showModal
   - showEditor
   - content

3. Button Ekle:
   - Modal'ı açmak için onClick handler

4. Modal Render Et:
   - onDocumentLoaded callback
   - showStats ve showElements props

5. Editor Render Et:
   - initialContent prop
   - onContentChange callback

6. Testi Yapın:
   - .docx dosyası yükleyin
   - İstatistikleri kontrol edin
   - İçeriği düzenleyin

7. Özelleştir:
   - CSS dosyalarını düzenle
   - Callback fonksiyonları ekle
   - Server entegrasyonu yapılandır
*/

export default WordDocumentExample;
