# Profesyonel PDF Görüntüleyici - Kullanım Kılavuzu

## 🎨 Yeni Profesyonel Özellikler

Embed-pdf-viewer sitesinden esinlenerek, tamamen yenilenmiş ve profesyonel bir PDF görüntüleyici oluşturuldu.

## ✨ Gelişmiş Özellikler

### 1. 🎯 Gelişmiş Annotation Araçları

#### 🖍️ Vurgulama (Highlight)
- **Kullanım:** "Vurgula" butonuna tıklayın, fare ile sürükleyin
- **Renk seçimi:** 8 farklı renk seçeneği
- **Özelleştirilebilir opacity:** %40 şeffaflık
- **Seçilebilir:** Annotation'a tıklayarak seçebilirsiniz

#### 📝 Metin Ekleme
- **Kullanım:** "Metin" butonuna tıklayın, istediğiniz yere tıklayın
- **Prompt ile metin girişi**
- **Font boyutu:** 14px (özelleştirilebilir)
- **Siyah renk** (varsayılan)

#### ✏️ Serbest Çizim
- **Yeni özellik!** Artık PDF üzerine serbest çizim yapabilirsiniz
- **Smooth curves:** Pürüzsüz çizim deneyimi
- **Renk seçimi:** Tüm renklerle çizim
- **Kalınlık:** 2px (özelleştirilebilir)

#### 📌 Yapışkan Not (Sticky Note)
- **Yeni özellik!** Post-it tarzı notlar
- **200x150px** boyutunda sarı notlar
- **Metin girişi:** Prompt ile not metni
- **Görsel:** Sarı arka plan, kahverengi kenarlık

#### ⬛ Redaction (Karartma)
- **Geliştirilmiş görsel:** Kırmızı kenarlıklı siyah blok
- **%80 opacity** ile önizleme
- **Kalıcı karartma:** Export ile uygulanır

#### 🗑️ Silgi (Eraser)
- **Yeni özellik!** Annotation'ları tek tıkla silin
- **Kullanım:** "Sil" butonuna tıklayın, silinecek annotation'a tıklayın
- **Hızlı ve kolay**

### 2. 🎨 Renk Seçici

**8 Preset Renk:**
- 🟡 Sarı (Yellow) - Varsayılan
- 🟢 Yeşil (Green)
- 🔵 Mavi (Blue)
- 🔴 Kırmızı (Red)
- 🟠 Turuncu (Orange)
- 🩷 Pembe (Pink)
- 🟣 Mor (Purple)
- 🩵 Cyan

**Kullanım:**
- "Renk" butonuna tıklayın
- Açılan palette'ten renk seçin
- Seçilen renk border'da görünür

### 3. ↶↷ Undo/Redo

**Geri Al (Undo):**
- Son işlemi geri alır
- Kısayol: "↶ Geri Al" butonu
- 50 adıma kadar geri alabilirsiniz

**İleri Al (Redo):**
- Geri alınan işlemi tekrar yapar
- Kısayol: "↷ İleri Al" butonu

**Özellikler:**
- Otomatik history yönetimi
- Buton durumu (enabled/disabled)
- 50 işlem limiti

### 4. 📋 Annotation Listesi

**Sidebar:**
- Sağ tarafta açılır panel
- Tüm annotation'ları listeler
- Sayfa numarası gösterir
- Metin önizlemesi (ilk 50 karakter)

**İşlemler:**
- **Tıklayarak seçim:** Annotation'a tıklayarak seçin ve sayfaya gidin
- **Silme:** Her annotation'ın yanında "Sil" butonu
- **Vurgulama:** Seçili annotation mavi kenarlıkla vurgulanır

**Görünüm:**
- "📋 Notlar (X)" butonu ile aç/kapa
- X = toplam annotation sayısı
- Scroll edilebilir liste

### 5. 🖱️ Seçim ve Düzenleme

**Seçim Modu:**
- "🖱️ Seç" butonuna tıklayın
- Annotation'lara tıklayarak seçin
- Seçili annotation mavi kesikli çizgiyle vurgulanır

**Görsel Feedback:**
- Highlight: Dikdörtgen çerçeve
- Text: Metin etrafında çerçeve
- Drawing: Çizim sınırlarında çerçeve
- Sticky: Not etrafında çerçeve

### 6. 💾 Gelişmiş Export

**Annotation Export:**
- Tüm annotation'lar PDF'e gömülür
- Yüksek kalite
- Koordinat dönüşümü (PDF koordinat sistemi)
- Smooth çizimler

**Redaction Export:**
- Kalıcı karartma
- Geri alınamaz
- Siyah blok ile kaplama

**Özellikler:**
- pdf-lib ile profesyonel export
- Tüm annotation türleri desteklenir
- Sticky note'lar text wrapping ile

## 🎯 Modern UI/UX

### Toolbar Tasarımı

**Profesyonel Görünüm:**
- Modern, flat design
- Smooth transitions
- Hover efektleri
- Active state vurgulaması

**Renk Şeması:**
- Aktif tool: Mavi (#2196F3)
- Hover: Hafif gölge
- Disabled: Gri (#e0e0e0)
- Shadows: Subtle box-shadow

**İkonlar:**
- Emoji ikonlar (evrensel)
- Açıklayıcı etiketler
- Görsel feedback

### Responsive Tasarım

- Flexbox layout
- Wrap edilebilir toolbar
- Scroll edilebilir canvas
- Sidebar toggle

## 🔧 Teknik Detaylar

### Dosya Yapısı

```
src/
├── components/
│   └── Editor/
│       ├── PdfViewer.jsx                    ✅ Güncellendi
│       └── ProfessionalPdfViewer.jsx        ✅ YENİ
└── utils/
    ├── pdfAnnotationPro.js                  ✅ YENİ
    ├── pdfExportPro.js                      ✅ YENİ
    └── pdfRedaction.js                      (Mevcut)
```

### Yeni Sınıflar

**AnnotationManagerPro:**
- Gelişmiş annotation yönetimi
- History/undo/redo
- Renk yönetimi
- Seçim yönetimi
- Event listener sistemi

**PdfExportUtilPro:**
- Gelişmiş PDF export
- Koordinat dönüşümü
- Text wrapping
- Smooth drawing export

### State Yönetimi

```javascript
// Annotation state
annotations: []           // Tüm annotation'lar
selectedAnnotation: null  // Seçili annotation
currentTool: 'none'       // Aktif araç
currentColor: {...}       // Seçili renk

// History
history: []               // İşlem geçmişi
historyIndex: -1          // Mevcut pozisyon
canUndo: false           // Geri alınabilir mi?
canRedo: false           // İleri alınabilir mi?
```

## 📊 Karşılaştırma

| Özellik | Eski Viewer | Profesyonel Viewer |
|---------|-------------|-------------------|
| Highlight | ✅ Basit | ✅ Gelişmiş + Renk |
| Text | ✅ Basit | ✅ Gelişmiş |
| Drawing | ❌ | ✅ Smooth curves |
| Sticky Notes | ❌ | ✅ Yeni |
| Eraser | ❌ | ✅ Yeni |
| Renk Seçici | ❌ | ✅ 8 renk |
| Undo/Redo | ❌ | ✅ 50 adım |
| Annotation List | ❌ | ✅ Sidebar |
| Seçim/Düzenleme | ❌ | ✅ Tam destek |
| UI/UX | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 Kullanım Örnekleri

### Örnek 1: Vurgulama + Renk Değiştirme

1. "Renk" butonuna tıklayın
2. Yeşil rengi seçin
3. "Vurgula" butonuna tıklayın
4. PDF üzerinde sürükleyin
5. Yeşil vurgulama oluşur

### Örnek 2: Serbest Çizim

1. "Renk" butonuna tıklayın
2. Kırmızı rengi seçin
3. "Çiz" butonuna tıklayın
4. PDF üzerinde fare ile çizin
5. Smooth kırmızı çizgi oluşur

### Örnek 3: Yapışkan Not

1. "Not" butonuna tıklayın
2. PDF üzerinde istediğiniz yere tıklayın
3. Açılan prompt'a not metni girin
4. Sarı post-it tarzı not oluşur

### Örnek 4: Annotation Düzenleme

1. "Seç" butonuna tıklayın
2. Bir annotation'a tıklayın
3. Mavi çerçeve ile vurgulanır
4. Sidebar'da görünür
5. "Sil" butonu ile silebilirsiniz

### Örnek 5: Undo/Redo

1. Birkaç annotation ekleyin
2. "↶ Geri Al" ile son işlemi iptal edin
3. "↷ İleri Al" ile tekrar yapın
4. 50 adıma kadar geri/ileri gidebilirsiniz

## 🎨 Renk Kullanım Önerileri

- **Sarı:** Genel vurgulama, önemli noktalar
- **Yeşil:** Onay, doğru bilgiler
- **Kırmızı:** Hata, dikkat gerektiren yerler
- **Mavi:** Bilgi, notlar
- **Turuncu:** Uyarı, orta öncelik
- **Pembe:** Kişisel notlar
- **Mor:** Özel işaretlemeler
- **Cyan:** Referanslar, linkler

## ⚡ Performans

- **Canvas rendering:** Optimize edilmiş
- **Overlay system:** Ayrı canvas katmanı
- **Event handling:** Debounced
- **Memory:** Efficient state management
- **History:** 50 işlem limiti ile optimize

## 🔒 Güvenlik

- **Redaction:** Geri alınamaz karartma
- **Export:** Güvenli PDF oluşturma
- **Data:** Local processing (no server)

## 📱 Tarayıcı Desteği

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Modern tarayıcılar

## 🎓 İpuçları

1. **Renk seçimini önceden yapın** - Annotation eklemeden önce renk seçin
2. **Undo/Redo kullanın** - Hata yaptığınızda geri alın
3. **Annotation listesini kullanın** - Tüm notlarınızı görmek için
4. **Seçim modu** - Annotation'ları düzenlemek için
5. **Export öncesi kontrol** - Tüm annotation'ları kontrol edin

## 🆘 Sorun Giderme

**Annotation görünmüyor:**
- Overlay canvas'ın render edildiğini kontrol edin
- Sayfa değiştirip tekrar deneyin

**Renk değişmiyor:**
- Renk seçtikten sonra tool'u tekrar seçin
- Renk picker'ın kapandığından emin olun

**Undo çalışmıyor:**
- History'de işlem olup olmadığını kontrol edin
- Butonun enabled olduğunu kontrol edin

**Export hatası:**
- pdf-lib yüklü mü kontrol edin
- Console'da hata mesajını inceleyin

---

**Geliştirme Tarihi:** 23 Ocak 2025  
**Versiyon:** 2.0 Professional  
**Durum:** ✅ Production Ready
