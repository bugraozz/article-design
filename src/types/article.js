// src/types/article.ts
// Makale ayarları - tüm sayfalar için geçerli stil tanımları
export const defaultArticleSettings = {
  titleColor: "#1f2937", // Başlık rengi
  titleFontSize: 24,
  titleFontFamily: "Arial, sans-serif",
  
  subtitleColor: "#4b5563",
  subtitleFontSize: 18,
  
  bodyFontSize: 14,
  bodyFontFamily: "Arial, sans-serif",
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
