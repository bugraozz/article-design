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
    name: "Tek Sütun (Premium)",
    description: "Zarif ve okunaklı klasik düzen",
    icon: "📝",
    category: "basic",
    features: ["Üst Kenarlık", "Geniş Kenar Boşluğu", "Gelişmiş Tipografi"],
    create: (id, settings) => ({
      id,
      title: `Sayfa ${id}`,
      type: "content",
      mode: "free",
      overlays: [
        // Üst dekoratif çizgi
        {
          id: crypto.randomUUID(),
          type: "text",
          html: '<div style="width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px;"></div>',
          x: settings.pageMarginLeft,
          y: settings.pageMarginTop - 20,
          width: 794 - settings.pageMarginLeft - settings.pageMarginRight,
          height: 10,
        },
        {
          id: crypto.randomUUID(),
          type: "text",
          html: '<h2 style="margin: 0; font-weight: 800; letter-spacing: -0.5px;">Bölüm Başlığı</h2>',
          x: settings.pageMarginLeft,
          y: settings.pageMarginTop,
          width: 794 - settings.pageMarginLeft - settings.pageMarginRight,
          height: 60,
          fontSize: settings.titleFontSize + 4,
          color: settings.titleColor,
        },
        {
          id: crypto.randomUUID(),
          type: "text",
          html: '<p style="margin: 0; text-align: justify; line-height: 1.8;">Buraya ana metin içeriği gelecek. Premium şablonlarda satır aralıkları ve kenar boşlukları okuma kolaylığı için optimize edilmiştir. Profesyonel bir döküman için metinlerinizi bu alanlara yerleştirebilirsiniz.</p>',
          x: settings.pageMarginLeft,
          y: settings.pageMarginTop + 80,
          width: 794 - settings.pageMarginLeft - settings.pageMarginRight,
          height: 400,
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
    name: "İki Sütun (Magazin)",
    description: "Modern dergi ve bülten formatı",
    icon: "📰",
    category: "layout",
    features: ["Dikey Ayırıcı", "Dengeli Sütunlar", "Vurgulu Başlık"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;
      const columnWidth = (contentWidth - 40) / 2;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="margin: 0; border-bottom: 2px solid #be123c; padding-bottom: 5px; display: inline-block;">ANALİZ VE RAPOR</h2>',
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
            html: '<p style="margin: 0; text-align: justify; font-weight: 500; font-style: italic; color: #6b7280;">Bu sütunda projenin giriş ve metodoloji kısımları yer alır. Okuyucuyu metne hazırlayan önemli vurgular burada sunulur.</p>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: columnWidth,
            height: 150,
            fontSize: settings.bodyFontSize,
          },
          // Sütun Ayırıcı Çizgi
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 1px; height: 100%; background: #f3f4f6;"></div>',
            x: settings.pageMarginLeft + columnWidth + 19,
            y: settings.pageMarginTop + 80,
            width: 10,
            height: 800,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<p style="margin: 0; text-align: justify;">Sağ sütun ise daha detaylı veriler, sonuçlar ve çıkarımların sunulduğu alandır. İki sütunlu yapı, yoğun bilgilerin daha kolay taranmasını sağlar.</p>',
            x: settings.pageMarginLeft + columnWidth + 40,
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
    name: "Görsel + Metin (Executive)",
    description: "Yönetici özetleri ve sunumlar için",
    icon: "🖼️",
    category: "layout",
    features: ["Modern Kart Tasarımı", "Okunaklı Metin", "Görsel Vurgu"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;
      const imageWidth = (contentWidth - 40) / 2;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="margin: 0; font-weight: 800; color: #be123c; border-left: 5px solid #be123c; padding-left: 15px;">STRATEJIK GÖRÜNÜM</h2>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
            fontSize: settings.titleFontSize,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #fdf2f2; padding: 20px; border-radius: 8px; border: 1px solid #fee2e2;"><p style="margin: 0; line-height: 1.7;">Görselin yanındaki bu alan, önemli noktaları vurgulamak veya anahtar mesajları iletmek için tasarlanmıştır. Profesyonel dökümanlarda metin ve görsel dengesi kritik öneme sahiptir.</p></div>',
            x: settings.pageMarginLeft + imageWidth + 40,
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
            height: 350,
            borderRadius: 8,
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
    name: "Tablo + Metin (Analitik)",
    description: "Veri sunumu ve analiz için",
    icon: "📊",
    category: "academic",
    features: ["Stylized Table", "Analiz Notları", "Profesyonel"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="margin: 0; font-weight: 700;">VERİ ANALİZ ŞABLONU</h2>',
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
            html: '<div style="border-top: 1px solid #e5e7eb; padding-top: 15px;"><p style="margin: 0; color: #6b7280; font-size: 13px;"><strong>NOT:</strong> Yukarıdaki tablo verileri, belirtilen dönemdeki performans göstergelerini temsil etmektedir.</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 350,
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
            height: 250,
            rows: 4,
            cols: 3,
            data: [
              ["KRİTİK GÖSTERGE", "BİRİM", "DEĞER"],
              ["Hız", "ms", "250"],
              ["Verimlilik", "%", "98.4"],
              ["Güvenlik", "lvl", "A+"],
            ],
            headerRow: true,
            tableStyle: {
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
            },
            cellStyles: {
              global: {
                padding: "12px",
                fontSize: "13px",
              },
              header: {
                backgroundColor: "#f9fafb",
                fontWeight: "bold",
                color: "#374151",
              }
            }
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
    name: "Poster/Afiş (Modern)",
    description: "Yüksek etkili görsel sunum",
    icon: "🎨",
    category: "creative",
    features: ["Dinamik Başlık", "Gradyan Aksan", "Modern Düzen"],
    create: (id, settings) => {
      const contentWidth = 794;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // Gradyan Arka Plan Bloğu
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);"></div>',
            x: 0,
            y: 0,
            width: contentWidth,
            height: 350,
            locked: true,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h1 style="text-align: left; margin: 0; color: white; line-height: 1.1; letter-spacing: -2px; font-weight: 800;">GELECEĞİN<br/>TASARIMI</h1>',
            x: 60,
            y: 80,
            width: 600,
            height: 150,
            fontSize: 56,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<p style="margin: 0; color: #a5b4fc; letter-spacing: 4px; text-transform: uppercase; font-weight: 500;">INOVASYON ZIRVESİ // 2026</p>',
            x: 60,
            y: 230,
            width: 500,
            height: 40,
            fontSize: 16,
          },
          // İçerik Alanı
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="border-left: 4px solid #be123c; padding-left: 20px;"><h3 style="margin: 0 0 10px 0; font-weight: 700;">VİZYONUMUZ</h3><p style="margin: 0; line-height: 1.6; color: #4b5563;">Bu poster şablonu, dikkat çekici başlıklar ve modern tipografi ile dökümanlarınıza enerji katmak için tasarlanmıştır. Görsel ve metin dengesi optimize edilmiştir.</p></div>',
            x: 60,
            y: 750,
            width: 350,
            height: 250,
            fontSize: 14,
          },
          // Yan Bilgi Çubuğu
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="text-align: right;"><h4 style="margin: 0; color: #be123c;">ETKİNLİK DETAYI</h4><p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Büyük Salon, Saat 14:00<br/>Ücretsiz Katılım</p></div>',
            x: 450,
            y: 750,
            width: 280,
            height: 100,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: 60,
            y: 300,
            width: 674,
            height: 400,
            borderRadius: 12,
          },
        ],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
        },
      };
    },
  },

  // Üç sütun şablonu
  threeColumn: {
    name: "Üç Sütun (Profesyonel)",
    description: "Broşür ve bültenler için kompakt düzen",
    icon: "📑",
    category: "layout",
    features: ["İnce Ayırıcılar", "Modern Başlık Paneli", " optimize edilmiş Alan"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;
      const columnWidth = (contentWidth - 60) / 3;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // Üst Başlık Paneli
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 15px; border-radius: 8px 8px 0 0;"><h2 style="margin: 0; text-align: center; color: #1e293b; letter-spacing: 1px;">HAFTALIK ÖZET VE ANALİZ</h2></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 70,
          },
          // Sütun 1
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h4 style="color: #be123c; border-bottom: 1px solid #fee2e2; padding-bottom: 5px;">GÜNDEM</h4><p style="margin: 10px 0; text-align: justify; font-size: 12px;">Haftalık gelişmelere dair ilk sütun verileri. Önemli başlıklar ve kısa özetler burada yer alır.</p>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 100,
            width: columnWidth,
            height: 400,
          },
          // Ayırıcı 1
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 1px; height: 100%; background: #f1f5f9;"></div>',
            x: settings.pageMarginLeft + columnWidth + 29,
            y: settings.pageMarginTop + 100,
            width: 2,
            height: 800,
          },
          // Sütun 2
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h4 style="color: #be123c; border-bottom: 1px solid #fee2e2; padding-bottom: 5px;">DETAYLAR</h4><p style="margin: 10px 0; text-align: justify; font-size: 12px;">Orta sütunda daha derinlemesine analizler ve teknik detaylar sunulur. Broşür düzeninde en çok dikkat çeken kısımdır.</p>',
            x: settings.pageMarginLeft + columnWidth + 30,
            y: settings.pageMarginTop + 100,
            width: columnWidth,
            height: 400,
          },
          // Ayırıcı 2
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 1px; height: 100%; background: #f1f5f9;"></div>',
            x: settings.pageMarginLeft + (columnWidth * 2) + 59,
            y: settings.pageMarginTop + 100,
            width: 2,
            height: 800,
          },
          // Sütun 3
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h4 style="color: #be123c; border-bottom: 1px solid #fee2e2; padding-bottom: 5px;">SONUÇ</h4><p style="margin: 10px 0; text-align: justify; font-size: 12px;">Sağ sütun ise çıkarımlar, aksiyon planları ve iletişim bilgilerini kapsayan final bölümüdür.</p>',
            x: settings.pageMarginLeft + (columnWidth + 30) * 2,
            y: settings.pageMarginTop + 100,
            width: columnWidth,
            height: 400,
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
    name: "Rapor Sayfası (Business)",
    description: "Profesyonel iş raporları ve analizler",
    icon: "📈",
    category: "academic",
    features: ["Vurgulu Başlık", "Özet Paneli", "Modern Görsel Alanı"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // Başlık Arka Planı
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #1e293b; color: white; padding: 25px; border-radius: 8px;"><h2 style="margin: 0; text-transform: uppercase; letter-spacing: 2px;">YILLIK PERFORMANS RAPORU</h2><p style="margin: 5px 0 0 0; opacity: 0.7; font-size: 12px;">STRATEJİ VE ANALİZ BİRİMİ</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 100,
          },
          // Özet Kutusu (Key Insights)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px;"><h4 style="margin: 0 0 5px 0; color: #0369a1;">KRİTİK BULGULAR</h4><p style="margin: 0; font-size: 13px; line-height: 1.5;">Bu dönemde hedeflenen büyüme oranları %15 seviyesinde gerçekleşmiş olup, verimlilik artışı operasyonel maliyetleri %8 oranında düşürmüştür.</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 120,
            width: contentWidth,
            height: 120,
          },
          // Detaylı Analiz Metni
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">DETAYLI ANALİZ</h3><p style="margin-top: 15px; text-align: justify; line-height: 1.7;">Verilerin derinlemesine incelenmesi sonucunda, pazar payındaki artışın doğrudan dijital dönüşüm yatırımlarıyla ilişkili olduğu gözlemlenmiştir. Aşağıdaki grafik bu ilişkiyi doğrulamaktadır.</p>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 260,
            width: contentWidth,
            height: 200,
            fontSize: 14,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 450,
            width: contentWidth,
            height: 350,
            borderRadius: 8,
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
    name: "Karşılaştırma (Dual)",
    description: "İki seçeneği profesyonelce kıyaslayın",
    icon: "⚖️",
    category: "layout",
    features: ["Renk Kodlu Bölgeler", "VS Göstergesi", "Simetrik Düzen"],
    create: (id, settings) => {
      const contentWidth = 794;
      const halfWidth = contentWidth / 2;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // Sol Bölge Arka Planı (Hafif Mavi)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 100%; height: 100%; background: #f0fdf4; border-right: 2px dashed #bbf7d0;"></div>',
            x: 0,
            y: 0,
            width: halfWidth,
            height: 1123,
            locked: true,
          },
          // Sağ Bölge Arka Planı (Hafif Rose)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 100%; height: 100%; background: #fff1f2;"></div>',
            x: halfWidth,
            y: 0,
            width: halfWidth,
            height: 1123,
            locked: true,
          },
          // VS Göstergesi (Merkezde)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: white; border: 2px solid #e2e8f0; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #64748b; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">VS</div>',
            x: halfWidth - 25,
            y: 300,
            width: 50,
            height: 50,
            locked: true,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="text-align: center; margin: 0; color: #166534;">OPSİYON A</h2><p style="text-align: justify; margin-top: 20px; line-height: 1.6;">Bu bölüm, ilk seçeneğin avantajlarını, teknik özelliklerini ve maliyet analizini sunmak için ayrılmıştır.</p>',
            x: 50,
            y: 150,
            width: halfWidth - 100,
            height: 400,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="text-align: center; margin: 0; color: #9f1239;">OPSİYON B</h2><p style="text-align: justify; margin-top: 20px; line-height: 1.6;">Bu bölüm ise alternatif çözümün kriterlerini ve fark yaratan noktalarını vurgular. Yan yana dizilim karar verme sürecini kolaylaştırır.</p>',
            x: halfWidth + 50,
            y: 150,
            width: halfWidth - 100,
            height: 400,
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
        },
      };
    },
  },

  // Kapak sayfası şablonu
  coverPage: {
    name: "Kapak Sayfası",
    description: "Modern ve iddialı bir doküman girişi",
    icon: "📖",
    category: "creative",
    features: ["Asimetrik Tasarım", "Geometrik Aksan", "Modern Hiyerarşi"],
    create: (id, settings) => {
      const contentWidth = 794; // Tam sayfa genişliği
      const innerWidth = contentWidth - 100; // Kenar boşlukları çıkarılmış

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // 1. Dekoratif Sol Bar (Accent)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 100%; height: 100%; background: linear-gradient(180deg, #f43f5e 0%, #be123c 100%);"></div>',
            x: 0,
            y: 0,
            width: 40,
            height: 1123,
            locked: true,
          },
          // 2. Büyük Başlık (Sol hizalı, kalın)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: `<h1 style="text-align: left; margin: 0; line-height: 1.1; letter-spacing: -1px; text-transform: uppercase;">PROFESYONEL<br/><span style="color: #be123c;">DÖKÜMAN</span><br/>RAPORU</h1>`,
            x: 80,
            y: 220,
            width: 600,
            height: 250,
            fontSize: 48,
            fontWeight: "900",
            color: settings.titleColor,
          },
          // 3. Alt Başlık / Yıl (İnce çizgi ile ayrılmış)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: `<div style="border-top: 2px solid #e5e7eb; padding-top: 20px;"><p style="margin: 0; font-size: 18px; color: #666666; letter-spacing: 2px; text-transform: uppercase;">STRATEJIK ANALIZ VE PLANLAMA // 2026</p></div>`,
            x: 80,
            y: 480,
            width: 500,
            height: 60,
          },
          // 4. Açıklama metni (Küçük kolon)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: `<p style="margin: 0; line-height: 1.6; color: #4b5563;">Bu rapor, projenin tüm teknik detaylarını, gelecek vizyonunu ve akademik temellerini kapsayan profesyonel bir sunumdur. Modern tasarım ilkeleriyle hazırlanmıştır.</p>`,
            x: 80,
            y: 560,
            width: 300,
            height: 150,
            fontSize: 13,
          },
          // 5. Yazar Bilgisi (Sağ alt köşe)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: `<p style="text-align: right; margin: 0; line-height: 1.4;"><strong>HAZIRLAYAN</strong><br/>Sayın Yazar Adı Soyadı<br/><span style="color: #666666; font-size: 11px;">Kıdemli Proje Yöneticisi</span></p>`,
            x: 450,
            y: 950,
            width: 250,
            height: 80,
            fontSize: 14,
            color: "#333333",
          },
        ],
        images: [],
        tables: [],
        documentContent: "",
        pageSettings: {
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
        },
      };
    },
  },

  // Galeri şablonu
  gallery: {
    name: "Galeri (Modern)",
    description: "Daire görseller ve modern ızgara düzeni",
    icon: "🖼️",
    category: "creative",
    features: ["Daire Görseller", "Yüzen Alt Yazılar", "Simetrik Izgara"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;
      const imageSize = (contentWidth - 60) / 2;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="text-align: center; margin: 0; font-weight: 800; letter-spacing: 2px; color: #1e293b;">PORTFOLYO VİTRİNİ</h2>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
          },
          // Kaptanlar (Görsellerin üzerine gelecek şekilde ayarlandı)
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: rgba(30, 41, 59, 0.8); color: white; padding: 5px 10px; border-radius: 20px; font-size: 11px; text-align: center;">PROJE 01</div>',
            x: settings.pageMarginLeft + (imageSize / 2) - 40,
            y: settings.pageMarginTop + 80 + imageSize - 30,
            width: 80,
            height: 30,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: rgba(30, 41, 59, 0.8); color: white; padding: 5px 10px; border-radius: 20px; font-size: 11px; text-align: center;">PROJE 02</div>',
            x: settings.pageMarginLeft + imageSize + 30 + (imageSize / 2) - 40,
            y: settings.pageMarginTop + 80 + imageSize - 30,
            width: 80,
            height: 30,
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
            borderRadius: 50, // Daire
          },
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft + imageSize + 30,
            y: settings.pageMarginTop + 80,
            width: imageSize,
            height: imageSize,
            borderRadius: 50, // Daire
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
    name: "SSS/FAQ (Modern)",
    description: "Profesyonel soru-cevap paneli",
    icon: "❓",
    category: "basic",
    features: ["İkonografik Başlıklar", "Vurgulu Bloklar", "Optimize Dizilim"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="text-align: center; margin-bottom: 30px; font-weight: 800; color: #1e293b;">SIKÇA SORULAN SORULAR</h2>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
          },
          // FAQ Item 1
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;"><h4 style="margin: 0 0 10px 0; color: #be123c;">S: Platformun temel avantajları nelerdir?</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">C: Hızlı içerik oluşturma, modern şablonlar ve esnek düzen yapısı sayesinde profesyonel sonuçlar elde edersiniz.</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: contentWidth,
            height: 120,
          },
          // FAQ Item 2
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0;"><h4 style="margin: 0 0 10px 0; color: #be123c;">S: Akademik formatlara uyumlu mu?</h4><p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">C: Evet, yerleşik akademik şablonumuz özellikle bilimsel makale ve dental journal standartlarına göre optimize edilmiştir.</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 220,
            width: contentWidth,
            height: 120,
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
    name: "Zaman Çizelgesi (Modern)",
    description: "Kronolojik akış ve yol haritası",
    icon: "📅",
    category: "creative",
    features: ["Dikey Akış Hattı", "Renkli Düğümler", "Modern Tipografi"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;
      const trackX = settings.pageMarginLeft + 60;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // Dikey Akış Çizgisi
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 4px; height: 100%; background: #e2e8f0; border-radius: 2px;"></div>',
            x: trackX,
            y: settings.pageMarginTop + 80,
            width: 4,
            height: 800,
            locked: true,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="margin: 0; font-weight: 800; color: #1e293b; border-bottom: 2px solid #be123c; display: inline-block;">PROJE YOL HARİTASI</h2>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
          },
          // Node 1
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 20px; height: 20px; background: #be123c; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 2px #be123c;"></div>',
            x: trackX - 8,
            y: settings.pageMarginTop + 100,
            width: 20,
            height: 20,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="padding-left: 20px;"><h4 style="margin: 0; color: #be123c;">2024 - PLANLAMA</h4><p style="margin: 5px 0 0 0; font-size: 13px; line-height: 1.5;">Stratejik hedeflerin belirlenmesi ve ekip kurulumu süreci tamamlandı.</p></div>',
            x: trackX + 20,
            y: settings.pageMarginTop + 95,
            width: contentWidth - 100,
            height: 80,
          },
          // Node 2
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="width: 20px; height: 20px; background: #334155; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 0 2px #334155;"></div>',
            x: trackX - 8,
            y: settings.pageMarginTop + 220,
            width: 20,
            height: 20,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="padding-left: 20px;"><h4 style="margin: 0; color: #334155;">2025 - GELİŞTİRME</h4><p style="margin: 5px 0 0 0; font-size: 13px; line-height: 1.5;">Altyapı modernizasyonu ve ana modüllerin entegrasyonu devam ediyor.</p></div>',
            x: trackX + 20,
            y: settings.pageMarginTop + 215,
            width: contentWidth - 100,
            height: 80,
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
    name: "Adım Adım Rehber (Modern)",
    description: "Net ve profesyonel talimatlar",
    icon: "🔢",
    category: "basic",
    features: ["Büyük Numaralandırma", "Vurgulu Başlıklar", "Akışkan Görselleşme"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;
      const stepHeaderWidth = 60;
      const textX = settings.pageMarginLeft + stepHeaderWidth + 20;
      const textWidth = contentWidth - stepHeaderWidth - 20;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="text-align: center; margin: 0; font-weight: 800; color: #1e293b;">UYGULAMA REHBERİ</h2>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
          },
          // Adım 1
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #be123c; color: white; width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900;">01</div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: 60,
            height: 60,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h3 style="margin: 0; color: #be123c; border-left: 4px solid #be123c; padding-left: 15px;">HAZIRLIK AŞAMASI</h3><p style="margin-top: 10px; line-height: 1.6; font-size: 13px;">Gerekli tüm materyallerin toplanması ve çalışma alanının düzenlenmesi sürecidir.</p>',
            x: textX,
            y: settings.pageMarginTop + 80,
            width: textWidth,
            height: 100,
          },
          // Adım 2
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #334155; color: white; width: 60px; height: 60px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900;">02</div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 220,
            width: 60,
            height: 60,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h3 style="margin: 0; color: #334155; border-left: 4px solid #334155; padding-left: 15px;">UYGULAMA VE TEST</h3><p style="margin-top: 10px; line-height: 1.6; font-size: 13px;">Projenin hayata geçirilmesi ve standartlara uygunluk testlerinin yapılması adımıdır.</p>',
            x: textX,
            y: settings.pageMarginTop + 220,
            width: textWidth,
            height: 100,
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

  // Portfolyo şablonu
  portfolio: {
    name: "Portfolyo (Vitrin)",
    description: "Modern proje ve çalışma vitrini",
    icon: "💼",
    category: "creative",
    features: ["Kart Tasarımı", "Vurgulu Başlıklar", "Temizlik & Düzen"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<h2 style="text-align: center; margin: 0; font-weight: 800; color: #1e293b; letter-spacing: 3px;">SEÇKİN PROJELER</h2>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 60,
          },
          // Proje Kartı 1
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: rgba(248, 250, 252, 0.8); border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;"><h3 style="margin: 0; color: #be123c;">ENDÜSTRİYEL TASARIM X</h3><p style="margin-top: 10px; line-height: 1.6; font-size: 13px; color: #475569;">Yenilikçi yaklaşımlar ve estetik detaylarla harmanlanmış, kullanıcı odaklı bir ürün geliştirme süreci. Minimalist çizgiler ve sürdürülebilir materyal kullanımı odak noktasıdır.</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 400,
            width: contentWidth,
            height: 150,
          },
        ],
        images: [
          {
            id: crypto.randomUUID(),
            src: null,
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 80,
            width: contentWidth,
            height: 300,
            borderRadius: 12,
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

  // İş/Yönetici Özeti (Business Pitch) şablonu
  businessPitch: {
    name: "Yönetici Özeti (Pitch)",
    description: "Yatırımcı sunumları ve yönetici özetleri",
    icon: "🚀",
    category: "creative",
    features: ["Metrik Paneli", "Vurgulu Vizyon", "Profesyonel Branding"],
    create: (id, settings) => {
      const contentWidth = 794 - settings.pageMarginLeft - settings.pageMarginRight;
      const metricWidth = (contentWidth - 40) / 3;

      return {
        id,
        title: `Sayfa ${id}`,
        type: "content",
        mode: "free",
        overlays: [
          // Header Bar
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: linear-gradient(90deg, #1e1b4b 0%, #be123c 100%); color: white; padding: 30px; border-radius: 8px;"><h1 style="margin: 0; font-weight: 900; letter-spacing: -1px;">STRATEJİK VİZYON 2026</h1><p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 14px;">YATIRIMCI VE YÖNETİCİ ÖZETİ</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop,
            width: contentWidth,
            height: 120,
          },
          // Ana Vizyon
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="border-left: 5px solid #be123c; padding-left: 20px;"><h2 style="margin: 0; color: #1e1b4b;">BÜYÜME STRATEJİSİ</h2><p style="margin-top: 15px; line-height: 1.7; font-size: 15px; color: #334155;">Gelecek 24 ay içinde pazar payımızı %30 artırmayı ve global operasyonlarımızı 5 yeni bölgeye yaymayı hedefliyoruz. Teknolojik altyapımız, ölçeklenebilir bir büyüme için optimize edilmiştir.</p></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 150,
            width: contentWidth,
            height: 180,
          },
          // Metrik Kutuları
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center;"><span style="display: block; font-size: 24px; font-weight: 900; color: #be123c;">%45</span><span style="font-size: 12px; color: #64748b;">ROI ARTIŞI</span></div>',
            x: settings.pageMarginLeft,
            y: settings.pageMarginTop + 350,
            width: metricWidth,
            height: 80,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center;"><span style="display: block; font-size: 24px; font-weight: 900; color: #be123c;">1.2M</span><span style="font-size: 12px; color: #64748b;">AKTİF KULLANICI</span></div>',
            x: settings.pageMarginLeft + metricWidth + 20,
            y: settings.pageMarginTop + 350,
            width: metricWidth,
            height: 80,
          },
          {
            id: crypto.randomUUID(),
            type: "text",
            html: '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center;"><span style="display: block; font-size: 24px; font-weight: 900; color: #be123c;">A+</span><span style="font-size: 12px; color: #64748b;">GÜVENLİK SKORU</span></div>',
            x: settings.pageMarginLeft + (metricWidth + 20) * 2,
            y: settings.pageMarginTop + 350,
            width: metricWidth,
            height: 80,
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
