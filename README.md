# 📄 Article Design Editor - Profesyonel Makale Tasarım Editörü

Modern, profesyonel makale ve doküman tasarım editörü. Word, InDesign ve LaTeX'in en iyi özelliklerini bir araya getiren güçlü bir araç.

## ✨ Temel Özellikler

### 🎨 Çift Mod Desteği
- **📋 Belge Modu** - Word benzeri akışkan yazı editörü
- **🎯 Serbest Mod** - Drag & drop ile tam kontrol, InDesign tarzı düzenleme

### 📚 21 Profesyonel Sayfa Şablonu
**Temel Şablonlar:**
- 📄 Boş Sayfa - Tam özgürlük
- 📝 Tek Sütun - Klasik makale düzeni
- 📋 Belge Modu - Word benzeri akışkan yazı
- ❓ SSS/FAQ - Soru-cevap formatı
- 🔢 Adım Adım Rehber - Numaralı talimatlar
- 📞 İletişim - İletişim bilgileri sayfası

**Düzen Şablonları:**
- 📰 İki Sütun - Gazete/dergi formatı
- 🖼️ Görsel + Metin - Görsel destekli içerik
- 📑 Üç Sütun - Broşür/bülten formatı
- ⚖️ Karşılaştırma - İki öge yan yana
- 💰 Fiyat Planları - Üç seviye karşılaştırma

**Akademik Şablonlar:**
- 🎓 Akademik Makale - Yazar fotoğrafı, özet, anahtar kelimeler
- 📊 Tablo + Metin - Veri sunumu için ideal
- 📈 Rapor Sayfası - İş raporları için
- 📄 Özgeçmiş/CV - Profesyonel CV formatı

**Yaratıcı Şablonlar:**
- 🎨 Poster/Afiş - Görsel sunum formatı
- 📅 Zaman Çizelgesi - Kronolojik akış
- 💼 Portfolyo - Proje vitrin sayfası
- 📖 Kapak Sayfası - Doküman girişi
- 🖼️ Galeri - Çoklu görsel sunum (4 görsel ızgara)
- 🎁 Ürün Tanıtımı - Ürün özellikleri sayfası

### 🧮 Gelişmiş Matematik Sistemi
- **KaTeX Entegrasyonu** - Hızlı ve profesyonel matematik render
- **LaTeX Desteği** - Inline ve block matematik denklemleri
- **Denklem Şablonları** - Hazır matematik şablonları
- **Sembol Paneli** - 50+ matematik sembolü
- **Live Preview** - Anlık önizleme

### 📝 Zengin Metin Editörü (TipTap)
- **Temel Formatlama** - Bold, italic, underline, strikethrough
- **Başlıklar** - H1, H2, H3 desteği
- **Hizalama** - Sol, orta, sağ, justify
- **Listeler** - Sıralı ve sırasız listeler
- **Renkler** - Metin rengi ve highlight
- **Tablolar** - Dinamik tablo oluşturma ve düzenleme

### 🎯 Serbest Mod Özellikleri
- **Drag & Drop** - Her element sürüklenebilir
- **Yeniden Boyutlandırma** - 8 yönlü resize handle
- **Grid Sistemi** - Snap-to-grid desteği
- **Kılavuz Çizgileri** - Hizalama yardımcıları
- **Zoom** - 50%-200% arası yakınlaştırma
- **Katmanlar** - Z-index yönetimi

### 🖼️ Görsel Yönetimi
- **Drag & Drop Upload** - Sürükle bırak ile yükleme
- **Yuvarlak Görsel Desteği** - Border-radius özelleştirme
- **Boyutlandırma** - Özgür boyutlandırma
- **Placeholder** - Görsel yok iken "Görsel Ekle" göstergesi

### 📊 Tablo Özellikleri
- **Dinamik Tablo** - Satır/sütun ekleme-silme
- **Hücre Düzenleme** - Her hücre ayrı düzenlenebilir
- **Stil Özelleştirme** - Kenarlık, arka plan, padding
- **Right-Click Menü** - Bağlamsal menü

### 🎨 Makale Ayarları
- **Sayfa Kenar Boşlukları** - Top, bottom, left, right margin
- **Başlık Stili** - Font boyutu ve renk
- **Gövde Metni** - Font boyutu, renk, satır yüksekliği
- **Paragraf Girintisi** - İlk satır girintisi

### 📤 Export Özellikleri
- **PNG Export** - Yüksek kaliteli görüntü
- **PDF Export** - Çok sayfalı PDF oluşturma
- **Temiz Görünüm** - Grid ve kontrolleri gizle

## 🚀 Hızlı Başlangıç

### Kurulum

```bash
npm install
```

### Development

```bash
npm run dev
```

Tarayıcıda aç: `http://localhost:5173`

### Build

```bash
npm run build
```

### Production Preview

```bash
npm run preview
```

## 📦 Teknolojiler

### Core
- **React 18.3** - UI framework
- **Vite 6.0** - Build tool
- **Tailwind CSS 3.4** - Styling

### Editör
- **TipTap** - Rich text editor
  - @tiptap/react
  - @tiptap/starter-kit
  - @tiptap/extension-table
  - @tiptap/extension-text-align
  - @tiptap/extension-highlight

### Matematik
- **KaTeX 0.16** - Math rendering
- **MathJS 14.1** - Math computations

### Export
- **html2canvas 1.4** - DOM to canvas
- **jsPDF 2.5** - PDF generation
- **html2pdf.js 0.10** - HTML to PDF

### UI & Icons
- **Lucide React 0.469** - Modern icons

## 🎯 Kullanım Kılavuzu

### 1. Yeni Sayfa Ekleme

Üst menüden **"Sayfa"** butonuna tıklayın:
- **Belge Sayfası** - Word gibi editör
- **Boş Sayfa** - Sıfırdan başla
- **Şablondan Seç** - 21 hazır şablon

### 2. Metin Ekleme

**Serbest Modda:**
- Toolbar'dan "Metin" butonuna tıklayın
- Sayfa üzerine tıklayıp konumlandırın
- Yazmaya başlayın

**Belge Modunda:**
- Direkt yazmaya başlayın
- TipTap toolbar kullanarak formatla

### 3. Görsel Ekleme

**Yöntem 1:** Toolbar'dan "Görsel" butonu
**Yöntem 2:** Sağ tıklayıp "Görsel Ekle"
**Yöntem 3:** Placeholder alana sağ tık

### 4. Matematik Denklem Ekleme

- **Σ** butonuna tıklayın
- LaTeX formatında denklem girin
- Örnek: `\frac{a}{b}`, `\sqrt{x}`, `x^2`
- Şablon veya sembol panelinden seçim yapın

### 5. Tablo Ekleme

- **Grid** butonuna tıklayın
- Satır ve sütun sayısı girin
- Hücrelere çift tıklayarak düzenleyin

### 6. Stil ve Format

**Metin Özellikleri Paneli:**
- Font boyutu, renk
- Hizalama, satır yüksekliği
- Bold, italic, underline

**Makale Ayarları:**
- Sayfa kenar boşlukları
- Başlık ve gövde stilleri
- Paragraf girintisi

### 7. Export

**PNG olarak:**
- "PNG" butonuna tıklayın
- Temiz görünüm otomatik aktif

**PDF olarak:**
- "PDF" butonuna tıklayın
- Tüm sayfalar tek PDF'te

## 🎨 Klavye Kısayolları

### Genel
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline

### TipTap Editör
- `Ctrl/Cmd + Shift + L` - Sola hizala
- `Ctrl/Cmd + Shift + E` - Ortala
- `Ctrl/Cmd + Shift + R` - Sağa hizala
- `Ctrl/Cmd + Shift + J` - İki yana yasla

## 📁 Proje Yapısı

```
article-design/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── DocumentEditor.jsx      # Belge modu editörü
│   │   │   ├── DocumentToolbar.jsx     # Belge modu toolbar
│   │   │   ├── PageCanvas.jsx          # Serbest mod canvas
│   │   │   ├── PagesPanel.jsx          # Sol sayfa paneli
│   │   │   └── RulerOverlay.jsx        # Cetvel overlay
│   │   ├── Modals/
│   │   │   ├── PageTemplateModal.jsx   # Şablon seçim modal
│   │   │   ├── EquationEditorModal.jsx # Denklem editörü
│   │   │   └── TableInputModal.jsx     # Tablo oluşturma
│   │   ├── Panels/
│   │   │   ├── ArticleSettingsPanel.jsx    # Makale ayarları
│   │   │   ├── TextPropertiesPanel.jsx     # Metin özellikleri
│   │   │   ├── MathSymbolPanel.jsx         # Matematik sembolleri
│   │   │   └── EquationTemplatesPanel.jsx  # Denklem şablonları
│   │   ├── Toolbar/
│   │   │   └── MainToolbar.jsx         # Ana toolbar
│   │   └── MathRenderer.jsx            # Matematik render
│   ├── overlays/
│   │   ├── TextOverlay.jsx             # Metin kutusu
│   │   ├── ImageOverlay.jsx            # Görsel overlay
│   │   └── TableOverlay.jsx            # Tablo overlay
│   ├── extensions/
│   │   ├── CustomColor.js              # TipTap renk
│   │   ├── FontSize.js                 # TipTap font boyutu
│   │   ├── MathExtension.js            # TipTap matematik
│   │   └── DraggableTable.js           # Sürüklenebilir tablo
│   ├── types/
│   │   └── article.js                  # Şablonlar ve ayarlar
│   ├── utils/
│   │   ├── mathProcessor.js            # Matematik işleme
│   │   ├── mathRenderer.js             # Render yardımcıları
│   │   └── equationManager.js          # Denklem yönetimi
│   ├── styles/
│   │   ├── DocumentEditor.css
│   │   ├── TiptapEditor.css
│   │   └── ProfessionalMath.css
│   ├── pages/
│   │   ├── HomePage.jsx                # Ana sayfa
│   │   └── EditorPage.jsx              # Editör sayfası
│   └── App.jsx
├── public/
├── vite.config.js                      # Vite yapılandırma
├── tailwind.config.js                  # Tailwind yapılandırma
└── package.json
```

## 🎨 Özelleştirme

### Kendi Şablonunuzu Ekleme

`src/types/article.js` dosyasına yeni şablon ekleyin:

```javascript
export const pageTemplates = {
  // ... mevcut şablonlar
  
  customTemplate: {
    name: "Özel Şablon",
    description: "Açıklama",
    icon: "🎯",
    category: "basic", // basic, layout, academic, creative
    features: ["Özellik 1", "Özellik 2"],
    create: (id, settings) => ({
      id,
      title: `Sayfa ${id}`,
      type: "content",
      mode: "free", // veya "document"
      overlays: [
        // Metin kutuları
      ],
      images: [
        // Görsel alanları
      ],
      tables: [
        // Tablolar
      ],
      documentContent: "",
      pageSettings: {
        marginTop: settings.pageMarginTop,
        marginBottom: settings.pageMarginBottom,
        marginLeft: settings.pageMarginLeft,
        marginRight: settings.pageMarginRight,
      },
    }),
  },
};
```

## 🐛 Bilinen Sorunlar ve Çözümler

### Build Uyarıları
Büyük chunk'lar için `vite.config.js`'de manual chunks yapılandırması eklenmiştir.



## 📝 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın



## 🙏 Teşekkürler

- [TipTap](https://tiptap.dev/) - Harika rich text editör
- [KaTeX](https://katex.org/) - Hızlı matematik render
- [Lucide](https://lucide.dev/) - Modern ikonlar
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

## 📊 İstatistikler

- **Toplam Şablon:** 21
- **Desteklenen Format:** 3 (LaTeX, Inline, Block)
- **Matematik Sembolleri:** 50+
- **Denklem Şablonları:** 15+
- **Kod Satırı:** ~10,000+






## 📱 Responsive

- **Desktop (1920px+):** Full size
- **Tablet (768-1024px):** Scaled
- **Mobile (< 768px):** Optimized





## 📖 Kaynaklar

- [KaTeX Documentation](https://katex.org/)
- [MathJax Documentation](https://www.mathjax.org/)
- [MathML Specification](https://www.w3.org/Math/)

## 🎯 Özellikler Roadmap

- ✅ LaTeX/MathML/OMML support
- ✅ Character-by-character editing
- ✅ Professional rendering
- ⏳ Advanced LaTeX macros
- ⏳ Real-time collaboration
- ⏳ Export to PDF/SVG



**Status:** ✅ Production Ready  
**Version:** 1.0.0  




