/**
 * WordDocumentModal.jsx
 * Profesyonel DOCX yükleme modal komponenti
 * Drag&drop, file input, ve yükleme ilerlemesi desteği
 */

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  BarChart3
} from 'lucide-react';
import {
  processWordDocumentLocally,
  getWordDocumentStats,
  extractWordDocumentElements
} from '../../services/wordService';
import './WordDocumentModal.css';

export default function WordDocumentModal({
  isOpen,
  onClose,
  onDocumentLoaded,
  title = 'Word Dosyası Yükle',
  showStats = true,
  showElements = true,
  allowMultiple = false
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [elements, setElements] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  /**
   * Dosya işlemeyi başlat
   */
  const processFile = async (file) => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(false);
      setUploadProgress(0);

      // Simüle edilmiş ilerleme
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      // Dosyayı işle
      const result = await processWordDocumentLocally(file, {
        extractMetadata: true,
        convertToMarkdown: true,
        preparePdf: true
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!result.success) {
        throw new Error(result.error);
      }

      // İstatistikleri al
      if (showStats) {
        const statsResult = await getWordDocumentStats(file);
        if (statsResult.success) {
          setStats(statsResult.stats);
        }
      }

      // Öğeleri çıkar
      if (showElements) {
        const elementsResult = await extractWordDocumentElements(file);
        if (elementsResult.success) {
          setElements(elementsResult.elements);
        }
      }

      // Önizleme
      const previewText = result.text?.substring(0, 300) || '';
      setPreviewHtml(previewText);

      setSelectedFiles([
        {
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          data: result
        }
      ]);

      setSuccess(true);

      // Callback - Editor açılması için
      setTimeout(() => {
        if (onDocumentLoaded) {
          onDocumentLoaded({
            file: file,
            html: result.html,
            text: result.text,
            fileName: result.fileName,
            stats: stats,
            elements: elements
          });
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
      console.error('Dosya işleme hatası:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * File input değişimi
   */
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = allowMultiple ? files[0] : files[0];
      processFile(file);
    }
  };

  /**
   * Drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  /**
   * Modal'ı kapat
   */
  const handleClose = () => {
    setSelectedFiles([]);
    setStats(null);
    setElements(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    setPreviewHtml('');
    onClose();
  };

  /**
   * Dosya silme
   */
  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="word-document-modal-overlay" onClick={handleClose}>
      <div
        className="word-document-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <FileText size={24} className="header-icon" />
            <h2>{title}</h2>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {!success ? (
            <>
              {/* Drop Zone */}
              <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="drop-content">
                  <Upload size={48} className="drop-icon" />
                  <h3>DOCX Dosyası Yükle</h3>
                  <p>Dosyayı buraya sürükleyin veya tıklayın</p>
                  <span className="file-hint">
                    Desteklenen formatlar: .docx, .doc (Maksimum 10MB)
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.doc"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  disabled={isProcessing}
                />
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="processing-container">
                  <div className="progress-info">
                    <Loader className="spinner" size={20} />
                    <span>Dosya işleniyor...</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="progress-text">{uploadProgress}%</div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <div className="error-content">
                    <h4>Hata</h4>
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="success-container">
                <div className="success-icon">
                  <CheckCircle size={48} />
                </div>
                <h3>Dosya Başarıyla Yüklendi!</h3>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="file-info">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-details">
                          <div className="file-name">
                            <FileText size={18} />
                            {file.name}
                          </div>
                          <div className="file-meta">
                            📊 {(file.size / 1024).toFixed(2)} KB
                            {file.uploadedAt && (
                              <>
                                {' '}
                                | 🕐{' '}
                                {file.uploadedAt.toLocaleTimeString('tr-TR')}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview */}
                {previewHtml && (
                  <div className="preview-section">
                    <h4>Dosya Önizlemesi</h4>
                    <div className="preview-text">{previewHtml}</div>
                  </div>
                )}

                {/* Stats */}
                {stats && (
                  <div className="stats-section">
                    <h4>
                      <BarChart3 size={18} /> İstatistikler
                    </h4>
                    <div className="stats-grid">
                      <div className="stat">
                        <span className="stat-label">Karakterler</span>
                        <span className="stat-value">{stats.characters}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Kelimeler</span>
                        <span className="stat-value">{stats.words}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Cümleler</span>
                        <span className="stat-value">{stats.sentences}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Paragraflar</span>
                        <span className="stat-value">{stats.paragraphs}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Okuma Süresi</span>
                        <span className="stat-value">
                          {stats.readingTimeMinutes} dk
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Ort. Kelime Uzunluğu</span>
                        <span className="stat-value">
                          {stats.averageWordLength} hrf
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Elements */}
                {elements && (
                  <div className="elements-section">
                    <h4>Belge Öğeleri</h4>
                    <div className="elements-grid">
                      <div className="element">
                        <span className="element-label">Başlıklar</span>
                        <span className="element-value">
                          {elements.headings.length}
                        </span>
                      </div>
                      <div className="element">
                        <span className="element-label">Tablolar</span>
                        <span className="element-value">{elements.tables}</span>
                      </div>
                      <div className="element">
                        <span className="element-label">Resimler</span>
                        <span className="element-value">{elements.images}</span>
                      </div>
                      <div className="element">
                        <span className="element-label">Bağlantılar</span>
                        <span className="element-value">
                          {elements.links.length}
                        </span>
                      </div>
                      <div className="element">
                        <span className="element-label">Sıralı Listeler</span>
                        <span className="element-value">
                          {elements.lists.ordered}
                        </span>
                      </div>
                      <div className="element">
                        <span className="element-label">Sırasız Listeler</span>
                        <span className="element-value">
                          {elements.lists.unordered}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={handleClose}>
            Kapat
          </button>
          {!success && (
            <button
              className="btn-browse"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload size={16} /> Dosya Seç
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
