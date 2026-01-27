// src/types/article.ts
// Makale ayarları - tüm sayfalar için geçerli stil tanımları
export const defaultArticleSettings = {
  titleColor: "#1f2937", // Başlık rengi
  titleFontSize: 24,
  titleFontFamily: "Calibri",
  
  subtitleColor: "#4b5563",
  subtitleFontSize: 18,
  
  bodyFontSize: 14,
  bodyFontFamily: "Calibri",
  bodyLineHeight: 1.6,
  bodyColor: "#374151",
  
  // Paragraf ayarları
  paragraphIndent: 12, // px
  paragraphSpacing: 12, // px
  
  // Sayfa ayarları
  pageMarginTop: 40,
  pageMarginBottom: 40,
  pageMarginLeft: 50,
  pageMarginRight: 50,
  
  // İlk sayfa ayarları
  coverPageBackground: "#ffffff",
  coverPageLogoWidth: 100,
  coverPageLogoHeight: 100,
};

export const defaultPage = (id, mode = "free") => ({
  id,
  title: `Sayfa ${id}`,
  type: id === 1 ? "cover" : "content", // 'cover' veya 'content'
  mode: mode, // 'free' veya 'document'
  overlays: [],
  images: [],
  tables: [],
  documentContent: "", // Belge modu içeriği
  // Sayfa spesifik ayarlar
  pageSettings: {
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 50,
    marginRight: 50,
  },
});

export const defaultCoverPage = (id, mode = "free") => ({
  id,
  title: `Sayfa ${id}`,
  type: "cover",
  mode: mode, // 'free' veya 'document'
  documentContent: "", // Belge modu içeriği
  overlays: [
    // Logo
    {
      id: "logo",
      type: "image",
      x: 350,
      y: 50,
      width: 100,
      height: 100,
      src: null,
    },
    // Başlık
    {
      id: "title",
      type: "text",
      html: "<h1>Makalenin Başlığı</h1>",
      x: 50,
      y: 200,
      width: 700,
      height: 80,
      fontSize: 28,
      color: "#1f2937",
      textAlign: "center",
    },
    // Yazarlar
    {
      id: "authors",
      type: "text",
      html: "<p>Yazar Adı<sup>1*</sup>, Diğer Yazar<sup>2</sup></p>",
      x: 50,
      y: 300,
      width: 700,
      height: 40,
      fontSize: 14,
      color: "#4b5563",
      textAlign: "center",
    },
    // Kurum
    {
      id: "institution",
      type: "text",
      html: "<p><sup>1</sup>Üniversite Adı, Bölüm, Şehir, Ülke<br/><sup>2</sup>Diğer Üniversite, Bölüm, Şehir, Ülke</p>",
      x: 50,
      y: 360,
      width: 700,
      height: 60,
      fontSize: 12,
      color: "#6b7280",
      textAlign: "center",
    },
    // Özet başlığı
    {
      id: "abstract-title",
      type: "text",
      html: "<h2>ÖZET</h2>",
      x: 50,
      y: 480,
      width: 700,
      height: 30,
      fontSize: 14,
      fontWeight: "bold",
      color: "#1f2937",
    },
    // Özet metni
    {
      id: "abstract-text",
      type: "text",
      html: "<p>Makalenin özeti burada yer alacak. En az 150, en fazla 250 kelime olmalıdır.</p>",
      x: 50,
      y: 520,
      width: 700,
      height: 150,
      fontSize: 12,
      color: "#374151",
      lineHeight: 1.6,
    },
    // Anahtar kelimeler
    {
      id: "keywords",
      type: "text",
      html: "<p><strong>Anahtar Kelimeler:</strong> Kelime 1, Kelime 2, Kelime 3, Kelime 4</p>",
      x: 50,
      y: 680,
      width: 700,
      height: 40,
      fontSize: 12,
      color: "#374151",
    },
  ],
  images: [],
  tables: [],
  pageSettings: {
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 50,
    marginRight: 50,
  },
});

// SAYFA ŞABLONLARI
export const pageTemplates = {
  // Boş serbest sayfa
  blank: {
    name: "Boş Sayfa",
    description: "Sıfırdan tasarım yapın",
    icon: "📄",
    category: "basic",
    features: ["Tam Özgürlük", "Serbest Mod"],
    create: (id, settings) => ({
      id,
      title: `Sayfa ${id}`,
      type: "content",
      mode: "free",
      overlays: [],
      images: [],
      tables: [],
      documentContent: "",
      pageSettings: {
        marginTop: settings.pageMarginTop,
        marginBottom: settings.pageMarginBottom,
        marginLeft: settings.pageMarginLeft,
        marginRight: settings.pageMarginRight,
      },
    }),
  },

  // Tek sütun metin
  singleColumn: {
    name: "Tek Sütun",
    description: "Klasik makale düzeni",
    icon: "📝",
    category: "basic",
    features: ["Başlık", "Tek Sütun", "Giriş Metni"],
    create: (id, settings) => ({
      id,
      title: `Sayfa ${id}`,
      type: "content",
      mode: "free",
      overlays: [
        {
          id: crypto.randomUUID(),
          type: "text",
          html: "<h2>Başlık</h2>",
          x: settings.pageMarginLeft,
          y: settings.pageMarginTop,
          width: 694 - settings.pageMarginLeft - settings.pageMarginRight,
          height: 60,
          fontSize: settings.titleFontSize,
          color: settings.titleColor,
        },
        {
          id: crypto.randomUUID(),
          type: "text",
          html: "<p>İçerik buraya yazılacak...</p>",
          x: settings.pageMarginLeft,
          y: settings.pageMarginTop + 80,
          width: 694 - settings.pageMarginLeft - settings.pageMarginRight,
          height: 200,
          fontSize: settings.bodyFontSize,
          color: settings.bodyColor,
          lineHeight: settings.bodyLineHeight,
        },
      ],
      images: [],
      tables: [],
      documentContent: "",
      pageSettings: {
        marginTop: settings.pageMarginTop,
        marginBottom: settings.pageMarginBottom,
        marginLeft: settings.pageMarginLeft,
        marginRight: settings.pageMarginRight,
      },
    }),
  },

  // İki sütun
  twoColumn: {
    name: "İki Sütun",
    description: "Gazete/dergi formatı",
    icon: "📰",
    category: "layout",
    features: ["Başlık", "Çift Sütun", "Profesyonel"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const columnWidth = (contentWidth - 20) / 2;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2>Başlık</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p>Sol sütun içeriği...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 300,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p>Sağ sütun içeriği...</p>",
            x: settings.pageMarginLeft + columnWidth + 20,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 300,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Görsel + metin
  imageText: {
    name: "Görsel + Metin",
    description: "Görsel destekli içerik",
    icon: "🖼️",
    category: "layout",
    features: ["Görsel Alan", "Metin", "Açıklama"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const imageWidth = (contentWidth - 20) / 2;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2>Başlık</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p>Görsel açıklaması ve metin içeriği buraya...</p>",
            x: settings.pageMarginLeft + imageWidth + 20,
            y: settings.pageMarginTop + 80,
            width: imageWidth,
            height: 300,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: imageWidth,
            height: 300,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Tablo + metin
  tableText: {
    name: "Tablo + Metin",
    description: "Veri sunumu için ideal",
    icon: "📊",
    category: "academic",
    features: ["Tablo", "Açıklama", "Analiz"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2>Başlık</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p>Tablo açıklaması ve sonuç yorumu...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 300,
            width: contentWidth,
            height: 150,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [
          {
            id: crypto.randomUUID(),
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: contentWidth,
            height: 200,
            data: [
              ["Başlık 1", "Başlık 2", "Başlık 3"],
              ["Veri 1", "Veri 2", "Veri 3"],
              ["Veri 4", "Veri 5", "Veri 6"],
            ],
            style: {
              borderColor: "#000000",
              headerBg: "#f3f4f6",
              cellPadding: 8,
            },
          },
        ],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Belge modu
  document: {
    name: "Belge Modu",
    description: "Word benzeri akışkan yazı",
    icon: "📋",
    category: "basic",
    features: ["Akışkan", "Kolay", "Word Gibi"],
    create: (id, settings) => ({
      id,
      title: `Sayfa ${id}`,
      type: "content",
      mode: "document",
      overlays: [],
      images: [],
      tables: [],
      documentContent: "",
      pageSettings: {
        marginTop: settings.pageMarginTop,
        marginBottom: settings.pageMarginBottom,
        marginLeft: settings.pageMarginLeft,
        marginRight: settings.pageMarginRight,
      },
    }),
  },

  // Akademik makale şablonu - Cumhuriyet Dental Journal formatı
  academicPaper: {
    name: "Bilimsel Makale",
    description: "Dergi formatında akademik makale",
    icon: "🎓",
    category: "academic",
    features: ["Dergi Başlığı", "DOI/ISSN", "İki Sütun", "Abstract"],
    create: (id, settings) => {
      const margin = 30;
      const contentWidth = 734;
      // Dental Journal görünümünde: solda dar bilgi kolonu + sağda ana içerik kolonu
      const sideColWidth = 165;
      const gap = 16;
      const sideColX = margin;
      const mainColX = sideColX + sideColWidth + gap;
      const mainColWidth = contentWidth - sideColWidth - gap;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // 1. Logo (sol üst)
          {
            id: crypto.randomUUID(),
            type: "image",
            src: null,
            x: sideColX,
            y: 10,
            width: 60,
            height: 60,
            borderRadius: 50,
          },
          
          // 2. Dergi bilgisi (sağ üst)
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="text-align: right; margin: 0; line-height: 1.3;">Cumhuriyet Dental Journal, ?(?): ???-???, ????<br/>DOI: ????????????????????</p>`,
            x: 460,
            y: 12,
            width: 194,
            height: 28,
            fontSize: 7.5,
            color: "#0066cc",
          },
          
          // 3. Dergi başlığı (ortada)
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<h1 style="text-align: center; margin: 0; line-height: 1.2;">Cumhuriyet Dental Journal</h1>`,
            x: 140,
            y: 46,
            width: 414,
            height: 20,
            fontSize: 16,
            fontWeight: "bold",
            color: "#1a1a1a",
          },
          
          // 4. Alt bilgi satırı
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="font-size: 7px; border-top: 0.5px solid #ccc; padding-top: 3px; margin: 0; line-height: 1.2;">e@l: cumhuriyet.edu.tr&nbsp;&nbsp;&nbsp;Founded: 2002&nbsp;&nbsp;&nbsp;Available online, ISSN: ????-????&nbsp;&nbsp;&nbsp;Publisher: Sivas Cumhuriyet Üniversitesi</p>`,
            x: sideColX,
            y: 72,
            width: contentWidth,
            height: 12,
            fontSize: 7,
            color: "#666",
          },
          
          // 5. Makale başlığı (mavi)
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<h2 style="margin: 0; line-height: 1.25;">Farklı Dolum Teknikleri ile Üretilmiş Posterior Kompozit Restorasyonların Marjinal Mikrosızıntılarının Karşılaştırılması</h2>`,
            x: sideColX,
            y: 92,
            width: contentWidth,
            height: 42,
            fontSize: 13.5,
            fontWeight: "bold",
            color: "#0066cc",
          },
          
          // 6. Yazar adı
          {
            id: "authors", // ID ekledik
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="margin: 0;"><strong>Yazar Adı Soyadı</strong><sup>1,*</sup></p>`,
            x: sideColX,
            y: 140,
            width: contentWidth,
            height: 14,
            fontSize: 10,
            color: "#1a1a1a",
          },
          
          // 7. Kurum bilgisi
          {
            id: "institution", // ID ekledik
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="font-size: 8px; font-style: italic; margin: 0; line-height: 1.3;"><sup>1</sup>Üniversite / Fakülte / Bölüm, Şehir, TÜRKİYE<br/><sup>*</sup>Corresponding author</p>`,
            x: sideColX,
            y: 156,
            width: contentWidth,
            height: 22,
            fontSize: 8,
            color: "#555",
          },
          
          // 8. Sol sidebar: Research Article
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<div style="background: #f8f8f8; border-left: 3px solid #0066cc; padding: 4px 7px;"><strong>Research Article</strong></div>`,
            x: sideColX,
            y: 196,
            width: sideColWidth,
            height: 18,
            fontSize: 9,
            fontWeight: "bold",
            color: "#1a1a1a",
          },
          
          // 9. Ana kolon: ABSTRACT başlığı
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<div style="background: #f8f8f8; border-left: 3px solid #0066cc; padding: 4px 7px;"><strong>ABSTRACT</strong></div>`,
            x: mainColX,
            y: 196,
            width: mainColWidth,
            height: 18,
            fontSize: 9,
            fontWeight: "bold",
            color: "#1a1a1a",
          },

          // 10. Sol sidebar: History
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="margin: 0; line-height: 1.4;"><strong>History</strong><br/><em>Received: ??/??/????</em><br/><em>Accepted: ??/??/????</em><br/><em>Published: ??/??/????</em></p>`,
            x: sideColX,
            y: 222,
            width: sideColWidth,
            height: 58,
            fontSize: 7.5,
            color: "#666",
          },
          
          // 11. Ana kolon: Abstract metni
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="text-align: justify; margin: 0; line-height: 1.5;">Bu alanda İngilizce özet (Abstract) metni yer alır. Metin, dergi formatındaki satır aralığına uygun olacak şekilde gerekçeli hizalanır. Örnek amaçlı içerik: Çalışmanın amacı, yöntemleri, bulguları ve sonuçları kısaca özetlenir. Klinik/deneysel çalışma türüne göre temel istatistiksel veya sonuç bilgileri belirtilir.</p>`,
            x: mainColX,
            y: 212,
            width: mainColWidth,
            height: 340,
            fontSize: 8,
            color: "#333",
          },
          
          // 12. Ana kolon: Keywords
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="margin: 0; line-height: 1.4;"><strong>Keywords:</strong> Keyword 1, Keyword 2, Keyword 3, Keyword 4.</p>`,
            x: mainColX,
            y: 560,
            width: mainColWidth,
            height: 24,
            fontSize: 8,
            color: "#333",
          },

          // 13. Ana kolon: Türkçe başlık
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<h3 style="margin: 0; line-height: 1.25;">Farklı Dolum Teknikleri ile Üretilmiş Posterior Kompozit Restorasyonların Marjinal Mikrosızıntılarının Karşılaştırılması</h3>`,
            x: mainColX,
            y: 592,
            width: mainColWidth,
            height: 36,
            fontSize: 9.5,
            fontWeight: "bold",
            color: "#0066cc",
          },
          
          // 14. Ana kolon: Öz başlığı
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<div style="background: #f8f8f8; border-left: 3px solid #0066cc; padding: 4px 7px;"><strong>Öz</strong></div>`,
            x: mainColX,
            y: 634,
            width: mainColWidth,
            height: 18,
            fontSize: 8.5,
            fontWeight: "bold",
            color: "#1a1a1a",
          },
          
          // 15. Ana kolon: Türkçe özet metni
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="text-align: justify; margin: 0; line-height: 1.5;">Bu alanda Türkçe özet metni yer alır. Özet; amaç, yöntem, bulgular ve sonuçlar şeklinde kısa ve anlaşılır olarak yazılır. Dergi şablonunda metin gerekçeli hizalanır ve satır aralığı kompakt tutulur.</p>`,
            x: mainColX,
            y: 658,
            width: mainColWidth,
            height: 260,
            fontSize: 8,
            color: "#333",
          },

          // 16. Sol sidebar: Copyright
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="margin: 0; line-height: 1.4;"><strong>Copyright</strong><br/><em>This work is licensed under<br/>Creative Commons Attribution 4.0<br/>International License</em></p>`,
            x: sideColX,
            y: 648,
            width: sideColWidth,
            height: 64,
            fontSize: 7,
            color: "#555",
          },

          // 17. İletişim / ORCID (tam sayfa genişliği)
          {
            id: "contact", // ID ekledik
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="margin: 0; line-height: 1.4;">ⓐ corresponding@author.com&nbsp;&nbsp;&nbsp;&nbsp;                              ⓞ 0000-0000-0000-0000</p>`,
            x: sideColX,
            y: 1020,
            width: contentWidth,
            height: 20,
            fontSize: 8,
            color: "#666",
          },

          // 18. How to Cite (alt bant)
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="font-style: italic; margin: 0; border-top: 0.5px solid #ddd; padding-top: 5px; line-height: 1.4; text-align: center;"><strong>How to Cite:</strong> Yazar A, (????) Makale Başlığı, Cumhuriyet Dental Journal, ?(?): ???-???</p>`,
            x: sideColX,
            y: 1048,
            width: contentWidth,
            height: 30,
            fontSize: 6.5,
            color: "#666",
          },
          
          // 20. Sayfa numarası
          {
            id: crypto.randomUUID(),
            type: "text",
            autoResize: false,
            locked: true,
            html: `<p style="text-align: center; margin: 0;">523</p>`,
            x: 650,
            y: 1100,
            width: 45,
            height: 16,
            fontSize: 8.5,
            color: "#999",
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          // Free-mode şablonlarda x/y koordinatları zaten margin içerir.
          // PageCanvas ayrıca padding uyguladığı için burada margin vermek
          // "çifte margin" oluşturur ve sayfanın altını boş bırakıp içeriği sıkıştırır.
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
        },
      };
    },
  },

  // Poster şablonu
  poster: {
    name: "Poster/Afiş",
    description: "Görsel sunum formatı",
    icon: "🎨",
    category: "creative",
    features: ["Büyük Başlık", "Görsel Odaklı", "Özet"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h1 style='text-align: center;'>POSTER BAŞLIĞI</h1>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 20,
            width: contentWidth,
            height: 100,
            fontSize: 32,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center;'><em>Alt Başlık - Kısa Açıklama</em></p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 135,
            width: contentWidth,
            height: 50,
            fontSize: 14,
            color: "#666666",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Ana İçerik</h3><p>Önemli bilgiler burada...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 500,
            width: contentWidth,
            height: 200,
            fontSize: settings.bodyFontSize + 2,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft + (contentWidth - 400) / 2,
            y: settings.pageMarginTop + 200,
            width: 400,
            height: 280,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Üç sütun şablonu
  threeColumn: {
    name: "Üç Sütun",
    description: "Broşür/bülten formatı",
    icon: "📑",
    category: "layout",
    features: ["3 Sütun", "Başlık", "Kompakt"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const columnWidth = (contentWidth - 40) / 3;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Başlık</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>Sol Sütun</h4><p>İçerik...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 400,
            fontSize: settings.bodyFontSize - 1,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>Orta Sütun</h4><p>İçerik...</p>",
            x: settings.pageMarginLeft + columnWidth + 20,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 400,
            fontSize: settings.bodyFontSize - 1,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>Sağ Sütun</h4><p>İçerik...</p>",
            x: settings.pageMarginLeft + (columnWidth + 20) * 2,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 400,
            fontSize: settings.bodyFontSize - 1,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Rapor şablonu
  report: {
    name: "Rapor Sayfası",
    description: "İş raporları için",
    icon: "📈",
    category: "academic",
    features: ["Başlık", "Grafik Alanı", "Sonuç"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2>Rapor Başlığı</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p>Rapor özeti ve genel bilgiler...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 75,
            width: contentWidth,
            height: 100,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Sonuçlar ve Öneriler</h3><p>Analiz sonuçları...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 450,
            width: contentWidth,
            height: 200,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 190,
            width: contentWidth,
            height: 240,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Karşılaştırma şablonu
  comparison: {
    name: "Karşılaştırma",
    description: "İki öge yan yana",
    icon: "⚖️",
    category: "layout",
    features: ["Yan Yana", "Karşılaştır", "İkili Düzen"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const halfWidth = (contentWidth - 20) / 2;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Karşılaştırma</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='text-align: center;'>Seçenek A</h3><p>Özellikler ve açıklamalar...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: halfWidth,
            height: 450,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='text-align: center;'>Seçenek B</h3><p>Özellikler ve açıklamalar...</p>",
            x: settings.pageMarginLeft + halfWidth + 20,
            y: settings.pageMarginTop + 80,
            width: halfWidth,
            height: 450,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Kapak sayfası şablonu
  coverPage: {
    name: "Kapak Sayfası",
    description: "Doküman girişi için",
    icon: "📖",
    category: "creative",
    features: ["Büyük Başlık", "Alt Bilgi", "Merkezi"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h1 style='text-align: center;'>DÖKÜMAN BAŞLIĞI</h1>",
            x: settings.pageMarginLeft,
            y: 280,
            width: contentWidth,
            height: 120,
            fontSize: 36,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center;'><em>Alt başlık veya açıklama</em></p>",
            x: settings.pageMarginLeft,
            y: 420,
            width: contentWidth,
            height: 60,
            fontSize: 16,
            color: "#666666",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center;'>Yazar Adı<br/>Tarih<br/>Versiyon</p>",
            x: settings.pageMarginLeft,
            y: 700,
            width: contentWidth,
            height: 100,
            fontSize: 13,
            color: "#888888",
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Galeri şablonu
  gallery: {
    name: "Galeri",
    description: "Çoklu görsel sunum",
    icon: "🖼️",
    category: "creative",
    features: ["4 Görsel", "Alt Yazı", "Izgara"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const imageSize = (contentWidth - 20) / 2;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Galeri</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center;'><em>Açıklama 1</em></p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80 + imageSize + 10,
            width: imageSize,
            height: 40,
            fontSize: 11,
            color: "#666666",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center;'><em>Açıklama 2</em></p>",
            x: settings.pageMarginLeft + imageSize + 20,
            y: settings.pageMarginTop + 80 + imageSize + 10,
            width: imageSize,
            height: 40,
            fontSize: 11,
            color: "#666666",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center;'><em>Açıklama 3</em></p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80 + imageSize * 2 + 50,
            width: imageSize,
            height: 40,
            fontSize: 11,
            color: "#666666",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center;'><em>Açıklama 4</em></p>",
            x: settings.pageMarginLeft + imageSize + 20,
            y: settings.pageMarginTop + 80 + imageSize * 2 + 50,
            width: imageSize,
            height: 40,
            fontSize: 11,
            color: "#666666",
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: imageSize,
            height: imageSize,
          },
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft + imageSize + 20,
            y: settings.pageMarginTop + 80,
            width: imageSize,
            height: imageSize,
          },
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80 + imageSize + 50,
            width: imageSize,
            height: imageSize,
          },
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft + imageSize + 20,
            y: settings.pageMarginTop + 80 + imageSize + 50,
            width: imageSize,
            height: imageSize,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // SSS/FAQ şablonu
  faq: {
    name: "SSS/FAQ",
    description: "Soru-cevap formatı",
    icon: "❓",
    category: "basic",
    features: ["Sorular", "Cevaplar", "Düzenli"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Sıkça Sorulan Sorular</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>S: İlk soru buraya?</h4><p>C: Cevap açıklaması...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: contentWidth,
            height: 100,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>S: İkinci soru buraya?</h4><p>C: Cevap açıklaması...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 200,
            width: contentWidth,
            height: 100,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>S: Üçüncü soru buraya?</h4><p>C: Cevap açıklaması...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 320,
            width: contentWidth,
            height: 100,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>S: Dördüncü soru buraya?</h4><p>C: Cevap açıklaması...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 440,
            width: contentWidth,
            height: 100,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Zaman çizelgesi şablonu
  timeline: {
    name: "Zaman Çizelgesi",
    description: "Kronolojik akış",
    icon: "📅",
    category: "creative",
    features: ["Tarih", "Olay", "Sıralı"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const leftColumnWidth = 120;
      const rightColumnX = settings.pageMarginLeft + leftColumnWidth + 20;
      const rightColumnWidth = contentWidth - leftColumnWidth - 20;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Zaman Çizelgesi</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          // 1. Tarih
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: right; font-weight: bold; color: #6366f1;'>2024</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: leftColumnWidth,
            height: 40,
            fontSize: 16,
            color: "#6366f1",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>Önemli Olay 1</h4><p>Açıklama ve detaylar...</p>",
            x: rightColumnX,
            y: settings.pageMarginTop + 80,
            width: rightColumnWidth,
            height: 80,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // 2. Tarih
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: right; font-weight: bold; color: #6366f1;'>2023</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 180,
            width: leftColumnWidth,
            height: 40,
            fontSize: 16,
            color: "#6366f1",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>Önemli Olay 2</h4><p>Açıklama ve detaylar...</p>",
            x: rightColumnX,
            y: settings.pageMarginTop + 180,
            width: rightColumnWidth,
            height: 80,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // 3. Tarih
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: right; font-weight: bold; color: #6366f1;'>2022</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 280,
            width: leftColumnWidth,
            height: 40,
            fontSize: 16,
            color: "#6366f1",
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h4>Önemli Olay 3</h4><p>Açıklama ve detaylar...</p>",
            x: rightColumnX,
            y: settings.pageMarginTop + 280,
            width: rightColumnWidth,
            height: 80,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Adım adım rehber şablonu
  stepByStep: {
    name: "Adım Adım Rehber",
    description: "Numaralı talimatlar",
    icon: "🔢",
    category: "basic",
    features: ["Adımlar", "Görsel", "Açıklama"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const imageWidth = 150;
      const textX = settings.pageMarginLeft + imageWidth + 20;
      const textWidth = contentWidth - imageWidth - 20;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Adım Adım Rehber</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          // Adım 1
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='color: #10b981;'>① Adım 1</h3><p>İlk adımın açıklaması...</p>",
            x: textX,
            y: settings.pageMarginTop + 80,
            width: textWidth,
            height: 120,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Adım 2
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='color: #10b981;'>② Adım 2</h3><p>İkinci adımın açıklaması...</p>",
            x: textX,
            y: settings.pageMarginTop + 220,
            width: textWidth,
            height: 120,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Adım 3
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='color: #10b981;'>③ Adım 3</h3><p>Üçüncü adımın açıklaması...</p>",
            x: textX,
            y: settings.pageMarginTop + 360,
            width: textWidth,
            height: 120,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: imageWidth,
            height: 120,
          },
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 220,
            width: imageWidth,
            height: 120,
          },
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 360,
            width: imageWidth,
            height: 120,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Portfolyo şablonu
  portfolio: {
    name: "Portfolyo",
    description: "Proje vitrin sayfası",
    icon: "💼",
    category: "creative",
    features: ["Proje", "Görsel", "Açıklama"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const projectHeight = 200;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Portfolyo</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          // Proje 1 açıklama
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Proje Adı 1</h3><p>Kısa proje açıklaması ve kullanılan teknolojiler...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80 + projectHeight + 10,
            width: contentWidth,
            height: 80,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Proje 2 açıklama
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Proje Adı 2</h3><p>Kısa proje açıklaması ve kullanılan teknolojiler...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80 + projectHeight + 100 + projectHeight + 10,
            width: contentWidth,
            height: 80,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: contentWidth,
            height: projectHeight,
          },
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80 + projectHeight + 100,
            width: contentWidth,
            height: projectHeight,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Özgeçmiş/CV şablonu
  resume: {
    name: "Özgeçmiş/CV",
    description: "Profesyonel CV formatı",
    icon: "📄",
    category: "academic",
    features: ["Profil", "Deneyim", "Eğitim"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const photoSize = 100;
      const textStartX = settings.pageMarginLeft + photoSize + 20;
      const textWidth = contentWidth - photoSize - 20;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // İsim ve unvan
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h1>AD SOYAD</h1><p style='color: #6366f1; font-size: 14px;'>Ünvan / Pozisyon</p>",
            x: textStartX,
            y: settings.pageMarginTop,
            width: textWidth,
            height: 80,
            fontSize: 22,
            color: settings.titleColor,
          },
          // İletişim
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p>📧 email@example.com | 📱 +90 555 123 4567<br/>🌐 website.com | 💼 LinkedIn</p>",
            x: textStartX,
            y: settings.pageMarginTop + 85,
            width: textWidth,
            height: 50,
            fontSize: 11,
            color: "#666666",
          },
          // Deneyim
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>İş Deneyimi</h3><p><strong>Pozisyon</strong> - Şirket Adı (2020-2024)<br/>Açıklama ve sorumluluklar...</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 160,
            width: contentWidth,
            height: 120,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Eğitim
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Eğitim</h3><p><strong>Üniversite Adı</strong> - Bölüm (2016-2020)<br/>Mezuniyet notu: 3.5/4.0</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 300,
            width: contentWidth,
            height: 100,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Yetenekler
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Yetenekler</h3><p>• Yetenek 1<br/>• Yetenek 2<br/>• Yetenek 3</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 420,
            width: contentWidth,
            height: 120,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: photoSize,
            height: photoSize,
            borderRadius: '50%',
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Ürün tanıtım şablonu
  productShowcase: {
    name: "Ürün Tanıtımı",
    description: "Ürün özellikleri sayfası",
    icon: "🎁",
    category: "creative",
    features: ["Görsel", "Özellikler", "Fiyat"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const imageWidth = (contentWidth - 20) / 2;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h1 style='text-align: center;'>ÜRÜN ADI</h1>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 70,
            fontSize: 28,
            color: settings.titleColor,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center; font-size: 18px; color: #6366f1;'>Kısa slogan veya açıklama</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: contentWidth,
            height: 50,
            fontSize: 14,
            color: "#6366f1",
          },
          // Özellikler listesi
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Özellikler</h3><p>✓ Özellik 1<br/>✓ Özellik 2<br/>✓ Özellik 3<br/>✓ Özellik 4</p>",
            x: settings.pageMarginLeft + imageWidth + 20,
            y: settings.pageMarginTop + 150,
            width: imageWidth,
            height: 200,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Fiyat
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<p style='text-align: center; font-size: 32px; font-weight: bold; color: #10b981;'>₺999</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 370,
            width: contentWidth,
            height: 80,
            fontSize: 32,
            color: "#10b981",
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 150,
            width: imageWidth,
            height: 200,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // Fiyat karşılaştırma şablonu
  pricing: {
    name: "Fiyat Planları",
    description: "Üç seviye karşılaştırma",
    icon: "💰",
    category: "layout",
    features: ["3 Plan", "Özellikler", "Fiyat"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const columnWidth = (contentWidth - 40) / 3;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Fiyat Planları</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          // Temel Plan
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='text-align: center;'>Temel</h3><p style='text-align: center; font-size: 24px; font-weight: bold;'>₺99</p><p style='font-size: 11px;'>• Özellik 1<br/>• Özellik 2<br/>• Özellik 3</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 300,
            fontSize: 12,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Profesyonel Plan
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='text-align: center; color: #6366f1;'>Profesyonel</h3><p style='text-align: center; font-size: 24px; font-weight: bold; color: #6366f1;'>₺299</p><p style='font-size: 11px;'>• Tüm Temel<br/>• Özellik 4<br/>• Özellik 5<br/>• Özellik 6</p>",
            x: settings.pageMarginLeft + columnWidth + 20,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 300,
            fontSize: 12,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Kurumsal Plan
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3 style='text-align: center;'>Kurumsal</h3><p style='text-align: center; font-size: 24px; font-weight: bold;'>₺999</p><p style='font-size: 11px;'>• Tümü + Premium<br/>• Özellik 7<br/>• Özellik 8<br/>• 7/24 Destek</p>",
            x: settings.pageMarginLeft + (columnWidth + 20) * 2,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 300,
            fontSize: 12,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },

  // İletişim sayfası şablonu
  contact: {
    name: "İletişim",
    description: "İletişim bilgileri sayfası",
    icon: "📞",
    category: "basic",
    features: ["Adres", "Telefon", "Email", "Harita"],
    create: (id, settings) => {
      const contentWidth = 694 - settings.pageMarginLeft - settings.pageMarginRight;
      const halfWidth = (contentWidth - 20) / 2;
      
      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h2 style='text-align: center;'>Bize Ulaşın</h2>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
            color: settings.titleColor,
          },
          // Sol kolon - İletişim bilgileri
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>📍 Adres</h3><p>Örnek Mahallesi, Örnek Sokak No:1<br/>İstanbul, Türkiye</p><br/><h3>📧 E-posta</h3><p>info@example.com<br/>destek@example.com</p><br/><h3>📱 Telefon</h3><p>+90 555 123 4567<br/>+90 555 987 6543</p>",
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: halfWidth,
            height: 350,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
          // Sağ kolon - İletişim formu / Mesaj alanı
          {
            id: crypto.randomUUID(),
            type: "text",
            html: "<h3>Mesaj Gönderin</h3><p>Adınız: _______________</p><p>E-posta: _______________</p><p>Mesajınız:</p><p>_______________________<br/>_______________________<br/>_______________________</p>",
            x: settings.pageMarginLeft + halfWidth + 20,
            y: settings.pageMarginTop + 80,
            width: halfWidth,
            height: 350,
            fontSize: settings.bodyFontSize,
            color: settings.bodyColor,
            lineHeight: settings.bodyLineHeight,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: settings.pageMarginTop,
          marginBottom: settings.pageMarginBottom,
          marginLeft: settings.pageMarginLeft,
          marginRight: settings.pageMarginRight,
        },
      };
    },
  },
};
