/**
 * WordDocumentEditor.jsx
 * CKEditor 5 tabanlı profesyonel Word belge editörü
 * DOCX dosyaları yükleme, görüntüleme ve düzenleme
 */

import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import {
  processDocxFile,
  sanitizeHtmlForEditor,
  isValidDocxFile
} from '../../utils/docxConverter';
import './WordDocumentEditor.css';

export default function WordDocumentEditor({
  onContentChange,
  initialContent,
  readOnly = false,
  autoSave = true,
  onFileLoaded,
  onError
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [content, setContent] = useState(initialContent || '');
  const [currentFile, setCurrentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [editMode, setEditMode] = useState(!readOnly);

  /**
   * Word sayı ve karakter sayısını hesapla
   */
  const updateStats = (html) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    setWordCount(words);
    setCharCount(chars);
  };

  /**
   * İçerik değişimini işle
   */
  const handleContentChange = (e) => {
    // Direct innerHTML erişim
    if (!editorRef.current) return;
    
    const newContent = editorRef.current.innerHTML;
    
    // Gereksiz güncellemeler'i önle
    if (newContent === content) return;
    
    setContent(newContent);
    updateStats(newContent);

    if (onContentChange) {
      onContentChange(newContent);
    }

    // Auto-save (debounced) - her 1000ms'de bir
    if (autoSave) {
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        saveToLocalStorage(newContent);
      }, 1000);
    }
  };

  /**
   * DOCX dosyası yükle
   */
  const handleDocxUpload = async (file) => {
    if (!isValidDocxFile(file)) {
      showNotification('Geçersiz dosya türü. Lütfen .docx dosyası seçiniz.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Simüle edilmiş yükleme ilerlemesi
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await processDocxFile(file);

      clearInterval(progressInterval);

      if (!result.success) {
        showNotification(result.error, 'error');
        setIsLoading(false);
        return;
      }

      setUploadProgress(100);

      // İçeriği sanitize et
      const sanitizedHtml = sanitizeHtmlForEditor(result.html);
      setContent(sanitizedHtml);
      setCurrentFile({
        name: result.fileName,
        size: result.fileSize,
        uploadedAt: new Date()
      });

      updateStats(sanitizedHtml);

      // Callback'i çağır
      if (onFileLoaded) {
        onFileLoaded({
          html: sanitizedHtml,
          text: result.text,
          fileName: result.fileName,
          fileSize: result.fileSize
        });
      }

      showNotification(
        `✅ "${result.fileName}" başarıyla yüklendi!`,
        'success'
      );

      // İlerlemeyi sıfırla
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      showNotification(`Yükleme hatası: ${error.message}`, 'error');
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Dosya input değişimi
   */
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocxUpload(file);
    }
    e.target.value = '';
  };

  /**
   * Drag ve drop işlemi
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleDocxUpload(files[0]);
    }
  };

  /**
   * Bildirim göster
   */
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // 5 saniye sonra kaldır
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  /**
   * LocalStorage'a kaydet
   */
  const saveToLocalStorage = (html) => {
    try {
      localStorage.setItem('wordDocumentContent', html);
      localStorage.setItem('wordDocumentSaved', new Date().toISOString());
    } catch (error) {
      console.warn('LocalStorage kayıt hatası:', error);
    }
  };

  /**
   * Yazı alanını temizle
   */
  const clearContent = () => {
    if (confirm('İçeriği silmek istediğinizden emin misiniz?')) {
      setContent('');
      setCurrentFile(null);
      setWordCount(0);
      setCharCount(0);
      if (onContentChange) {
        onContentChange('');
      }
    }
  };

  /**
   * İçeriği indir (HTML)
   */
  const downloadAsHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `document-${Date.now()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotification('Belge HTML olarak indirildi', 'success');
  };

  /**
   * Edit mode toggle
   */
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Content ve HTML'i güncelle
  useEffect(() => {
    if (editorRef.current && content) {
      const currentHtml = editorRef.current.innerHTML;
      // Sadece içerik farklı ise update yap
      if (currentHtml !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  // Initial content yüklemesi
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      updateStats(initialContent);
    } else {
      // LocalStorage'dan yükle
      const saved = localStorage.getItem('wordDocumentContent');
      if (saved) {
        setContent(saved);
        updateStats(saved);
      }
    }
  }, [initialContent]);

  return (
    <div className="word-document-editor">
      {/* Header */}
      <div className="word-editor-header">
        <div className="header-left">
          <FileText size={24} className="header-icon" />
          <h2>Word Belge Editörü</h2>
        </div>
        <div className="header-right">
          {currentFile?.name && (
            <span className="current-file-info">
              ✅ Hazır
            </span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="word-editor-toolbar">
        <div className="toolbar-left">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="btn btn-primary"
            title="DOCX dosyası seç"
          >
            <Upload size={18} />
            {isLoading ? 'Yükleniyor...' : 'DOCX Yükle'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          <button
            onClick={downloadAsHtml}
            className="btn btn-secondary"
            disabled={!content}
            title="Belgeyi HTML olarak indir"
          >
            ⬇️ HTML'ye Dönüştür
          </button>

          <button
            onClick={toggleEditMode}
            className={`btn ${editMode ? 'btn-success' : 'btn-warning'}`}
            title={editMode ? 'Düzenleme Modu' : 'Görüntüleme Modu'}
          >
            {editMode ? '✏️ Düzenleme' : '👁️ Görüntüleme'}
          </button>

          <button
            onClick={clearContent}
            disabled={!content}
            className="btn btn-danger"
            title="İçeriği temizle"
          >
            🗑️ Temizle
          </button>
        </div>

        <div className="toolbar-right">
          <div className="stats">
            <span className="stat-item">📝 {wordCount} kelime</span>
            <span className="stat-item">🔤 {charCount} karakter</span>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification notification-${notif.type}`}>
            <div className="notification-content">
              {notif.type === 'success' && <CheckCircle size={18} />}
              {notif.type === 'error' && <AlertCircle size={18} />}
              <span>{notif.message}</span>
            </div>
            <button
              onClick={() =>
                setNotifications((prev) =>
                  prev.filter((n) => n.id !== notif.id)
                )
              }
              className="notification-close"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Drop Zone + Editor */}
      <div
        className={`editor-container ${isDragging ? 'dragging' : ''} ${
          !editMode ? 'read-only-mode' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="drop-overlay">
            <div className="drop-content">
              <Upload size={48} />
              <p>DOCX dosyasını buraya bırakın</p>
            </div>
          </div>
        )}

        {content ? (
          <div
            ref={editorRef}
            className={`editor-content ${!editMode ? 'read-only' : ''}`}
            contentEditable={editMode}
            onInput={handleContentChange}
            onBlur={() => {
              if (autoSave) {
                saveToLocalStorage(content);
              }
            }}
            suppressContentEditableWarning={true}
            style={{
              minHeight: '400px',
              padding: '20px',
              outline: 'none',
              fontSize: '16px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
          />
        ) : (
          <div className="empty-state">
            <FileText size={64} className="empty-icon" />
            <h3>Henüz Belge Yüklenmedi</h3>
            <p>
              DOCX dosyasını yüklemek için:
              <br />
              • "DOCX Yükle" butonunu tıklayın veya
              <br />
              • Dosyayı bu alana sürükleyip bırakın
            </p>
            <div className="empty-hint">
              📄 Desteklenen formatlar: .docx, .doc
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      {currentFile && (
        <div className="editor-footer">
          <p>
            ✅ Son yükleme: {currentFile.uploadedAt.toLocaleTimeString('tr-TR')} |
            📊 Dosya boyutu: {(currentFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}
    </div>
  );
}
