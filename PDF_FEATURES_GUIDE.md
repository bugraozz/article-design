# PDF Görüntüleyici Özellikleri Rehberi

## Genel Bakış

Projenize embed-pdf-viewer reposundan esinlenerek **Export**, **Annotation** ve **Redaction** özellikleri entegre edilmiştir. Bu özellikler PDF.js tabanlı `EnhancedPdfViewer` bileşeninde kullanılabilir.

## Yeni Özellikler

### 1. 📤 Export (Dışa Aktarma)

PDF dosyalarını annotation'larla birlikte dışa aktarabilirsiniz.

**Kullanım:**
- PDF görüntüleyicide "💾 Dışa Aktar" butonuna tıklayın
- Annotation'lar PDF'e gömülü olarak kaydedilir
- Dosya otomatik olarak indirilir

**Teknik Detaylar:**
- `src/utils/pdfExport.js` - Export işlemleri
- `pdf-lib` kütüphanesi kullanılır
- Annotation'lar PDF'e kalıcı olarak eklenir

### 2. 🖍️ Annotation (Not Ekleme)

PDF üzerine çeşitli annotation'lar ekleyebilirsiniz.

#### Annotation Türleri:

**a) Highlight (Vurgulama)**
- "🖍️ Vurgula" butonuna tıklayın
- Fare ile sürükleyerek vurgulamak istediğiniz alanı seçin
- Sarı renkle vurgulanır (opacity: 0.3)

**b) Text (Metin Ekleme)**
- "📝 Metin" butonuna tıklayın
- PDF üzerinde istediğiniz yere tıklayın
- Açılan prompt'a metni girin
- Metin PDF üzerine eklenir

**c) Drawing (Çizim)**
- Gelecek versiyonlarda eklenecek
- Serbest çizim yapabilme özelliği

**Teknik Detaylar:**
- `src/utils/pdfAnnotation.js` - Annotation yönetimi
- `AnnotationManager` sınıfı tüm annotation'ları yönetir
- Her annotation sayfa bazlı saklanır

### 3. ⬛ Redaction (Karartma)

PDF'deki hassas bilgileri kalıcı olarak karartabilirsiniz.

**Kullanım:**
- "⬛ Redakte" butonuna tıklayın
- Fare ile sürükleyerek karartmak istediğiniz alanı seçin
- Kırmızı kenarlıklı siyah alan görünür (geçici)
- "🔒 Redakte Et ve Dışa Aktar" butonuna tıklayarak kalıcı hale getirin

**Önemli:**
- Redaction işlemi **geri alınamaz**
- Karartılan alanlar tamamen siyah blokla kaplanır
- Orijinal içerik kurtarılamaz

**Teknik Detaylar:**
- `src/utils/pdfRedaction.js` - Redaction yönetimi
- `RedactionManager` sınıfı redaction işlemlerini yönetir
- `pdf-lib` ile kalıcı karartma yapılır

## Kullanıcı Arayüzü

### Toolbar Butonları

1. **🖱️ Seç** - Normal mod (annotation/redaction yapmadan görüntüleme)
2. **🖍️ Vurgula** - Highlight modu
3. **📝 Metin** - Text annotation modu
4. **⬛ Redakte** - Redaction modu
5. **💾 Dışa Aktar** - PDF'i annotation'larla birlikte indir
6. **🔒 Redakte Et ve Dışa Aktar** - Redaction'ları uygula ve indir
7. **🗑️ Temizle** - Tüm annotation ve redaction'ları temizle

### Sayfa Navigasyonu

- **← Önceki / Sonraki →** - Sayfalar arası geçiş
- **Sayfa X / Y** - Mevcut sayfa bilgisi
- **− / +** - Zoom out/in
- **Sayfaya Sığdır** - Otomatik zoom ayarı

## Dosya Yapısı

```
src/
├── components/
│   └── Editor/
│       ├── PdfViewer.jsx              # Ana PDF viewer wrapper
│       ├── SimplePdfViewer.jsx        # Basit PDF viewer (eski)
│       └── EnhancedPdfViewer.jsx      # Yeni özelliklerle PDF viewer
└── utils/
    ├── pdfExport.js                   # Export işlemleri
    ├── pdfAnnotation.js               # Annotation yönetimi
    └── pdfRedaction.js                # Redaction yönetimi
```

## Bağımlılıklar

```json
{
  "pdfjs-dist": "^5.4.530",  // PDF rendering
  "pdf-lib": "^1.17.1"        // PDF manipulation (export, redaction)
}
```

## Örnek Kullanım

```jsx
import PdfViewer from './components/Editor/PdfViewer';

function MyComponent() {
  const pdfUrl = 'data:application/pdf;base64,...'; // veya URL
  
  return (
    <PdfViewer 
      pdfUrl={pdfUrl} 
      fileName="mydocument.pdf" 
    />
  );
}
```

## Adobe Entegrasyonu

Projenizde Adobe PDF Embed API de kullanılıyor. Yeni özellikler **sadece PDF görüntüleme alanında** çalışır:

- **PDF Viewer (EnhancedPdfViewer)**: Export, Annotation, Redaction kullanılır
- **Diğer Alanlar**: Adobe PDF Embed API kullanılmaya devam eder

## Gelecek Geliştirmeler

- [ ] Drawing tool (serbest çizim)
- [ ] Annotation renk seçimi
- [ ] Annotation silme/düzenleme
- [ ] Undo/Redo özelliği
- [ ] Annotation listesi ve filtreleme
- [ ] Çoklu sayfa redaction
- [ ] Annotation export/import (JSON)

## Sorun Giderme

### PDF yüklenmiyor
- Tarayıcı konsolunu kontrol edin
- PDF URL'inin geçerli olduğundan emin olun
- CORS hatası varsa server ayarlarını kontrol edin

### Export çalışmıyor
- `pdf-lib` paketinin yüklü olduğundan emin olun
- Tarayıcı popup blocker'ı kontrol edin
- Konsol hatalarını inceleyin

### Annotation görünmüyor
- Overlay canvas'ın doğru render edildiğini kontrol edin
- Sayfa değiştirirken annotation'ların kaybolup kaybolmadığını test edin

## Lisans ve Kaynak

Bu özellikler [embed-pdf-viewer](https://github.com/embedpdf/embed-pdf-viewer) reposundan esinlenilerek geliştirilmiştir.

- **embed-pdf-viewer**: MIT License
- **Bizim implementasyon**: Basitleştirilmiş, PDF.js ve pdf-lib tabanlı

## Destek

Sorularınız için proje dokümantasyonunu inceleyin veya geliştirici ekibiyle iletişime geçin.
