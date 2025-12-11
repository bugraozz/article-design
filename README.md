# 🎨 Article Design Editor - Profesyonel Matematik Sistemi

Modern, profesyonel matematiksel denklem ve sembol düzenleme sistemi.

## ✨ Özellikler

- 🧮 **Professional Math Rendering** - KaTeX + MathJax entegrasyon
- ✏️ **Character-by-Character Editing** - Her matematiksel eleman ayrı düzenlenebilir
- 🔄 **Multi-Format Support** - LaTeX, MathML, OMML (Word) formatları
- 📄 **Word Integration** - Word'den formül direkt yapıştırabilme
- 🛡️ **Security** - XSS koruması ve input sanitization
- 📱 **Responsive Design** - Desktop, tablet, mobile uyumlu
- ⚡ **Performance** - Optimized rendering, lazy loading
- 🎨 **Beautiful UI** - Professional CSS styling

## 🚀 Hızlı Başlangıç

### Installation

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

## 📚 Dokümantasyon

Detaylı kılavuzlar mevcuttur:

| Dokuman | Amaç |
|---------|------|
| [QUICK_START.md](./QUICK_START.md) | 5-20 dakikada başla |
| [API_REFERENCE.md](./API_REFERENCE.md) | Detaylı API docu |
| [MATH_SYSTEM_GUIDE.md](./MATH_SYSTEM_GUIDE.md) | Sistem kılavuzu |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Teknik özet |
| [PROJECT_COMPLETION_REPORT.md](./PROJECT_COMPLETION_REPORT.md) | Tamamlanma raporu |

## 🎓 Kullanım Örnekleri

### 1. Basit Math Rendering

```jsx
import ProfessionalMathRenderer from "./components/ProfessionalMathRenderer";

<ProfessionalMathRenderer
  content="\frac{a}{b}"
  type="latex"
/>
```

### 2. Düzenlenebilir Math

```jsx
const [latex, setLatex] = useState("\\frac{a}{b}");

<ProfessionalMathRenderer
  content={latex}
  editable={true}
  onEdit={setLatex}
/>
```

### 3. Character Editor

```jsx
import { CharacterMathEditor } from "./components/ProfessionalMathRenderer";
import { MathElement } from "./utils/mathSystem";

const element = new MathElement("fraction", { 
  numerator: "a", 
  denominator: "b" 
});

<CharacterMathEditor
  mathElement={element}
  onUpdate={(updated) => {
    console.log(updated.toLatex());
  }}
/>
```

## 🔄 Desteklenen Formatlar

```
Giriş: LaTeX, MathML, OMML (Word)
Çıkış: LaTeX, MathML, HTML
Dönüşüm: Tüm kombinasyonlar ↔
```

### Örnekler

```javascript
// LaTeX
\frac{a}{b}                  // Kesir
\sqrt{x}                     // Karekök
x^{2}                        // Üs
x_{n}                        // Alt indeks
\sum_{i=1}^{n} a_i          // Toplam
\int_{0}^{1} f(x) dx        // İntegral
```

## 🧪 Test

Demo sayfasını ziyaret et:

```
http://localhost:5173/advanced-math-demo
```

**Demo'da test edebilirsin:**
- ✅ LaTeX rendering
- ✅ Professional renderer
- ✅ Character editor
- ✅ Format converter
- ✅ 8 örnek formül

## 🏗️ Sistem Mimarisi

```
src/
├── utils/
│   ├── mathSystem.js                (Unified math system)
│   ├── advancedMathProcessor.js      (Render engine)
│   └── ... (existing)
│
├── components/
│   ├── ProfessionalMathRenderer.jsx  (React components)
│   └── ... (existing)
│
├── styles/
│   ├── ProfessionalMath.css         (Professional styling)
│   └── ... (existing)
│
└── pages/
    ├── AdvancedMathEditorDemo.jsx    (Demo page)
    └── ... (existing)
```

## 🛡️ Güvenlik

- ✅ XSS Koruması (XSS attacks blocked)
- ✅ Input Sanitization (HTML temizleme)
- ✅ Safe LaTeX Processing (Tehlikeli komutlar kaldırılıyor)

```javascript
import { MathSanitizer } from "./utils/mathSystem";

const safe = MathSanitizer.sanitizeMathML(userInput);
```

## ⚡ Performance

- **KaTeX Rendering:** < 100ms
- **MathJax Fallback:** < 500ms
- **Debounce:** 300ms (updates)
- **Memory:** Optimized & cached

## 📦 Dependencies

```json
{
  "react": "^19.2.0",
  "katex": "^0.16.27",
  "mathjax": "^3.2.2",
  "@tiptap/react": "^3.11.0",
  "dompurify": "^3.0.6"
}
```

## 🎨 CSS

Professional CSS styling mevcuttur:

```css
.professional-math-renderer { }
.character-math-editor { }
.equation-code { }
.math-error { }
```

Özelleştirme:

```jsx
<ProfessionalMathRenderer
  content={latex}
  style={{
    padding: "20px",
    fontSize: "18px",
    backgroundColor: "#f9fafb"
  }}
  className="custom-class"
/>
```

## 📱 Responsive

- **Desktop (1920px+):** Full size
- **Tablet (768-1024px):** Scaled
- **Mobile (< 768px):** Optimized

## 🔧 Configuration

### MathJax (Optional)

```javascript
// advancedMathProcessor.js'de
window.MathJax = {
  tex: {
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]]
  }
};
```

## 🐛 Troubleshooting

### Math render gösterilmiyor?

```javascript
// App.jsx'de initialization kontrol et
import { initializeMathSystem } from "./utils/advancedMathProcessor";

useEffect(() => {
  initializeMathSystem();
}, []);
```

### Word paste çalışmıyor?

```javascript
// TextOverlay'de OMML detection kontrol et
if (htmlData.includes("<m:oMath")) {
  // OMML başarıyla algılandı
}
```

Daha fazla bilgi: [MATH_SYSTEM_GUIDE.md](./MATH_SYSTEM_GUIDE.md)

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

## 📄 Lisans

MIT License - Özgürce kullanabilirsin

## 🤝 Katkı

Geliştirmelere ve bug report'larına açığız!

## 📞 Support

- 📚 Dokümantasyon: [QUICK_START.md](./QUICK_START.md)
- 🔍 API Reference: [API_REFERENCE.md](./API_REFERENCE.md)
- 🧪 Test Page: `/advanced-math-demo`

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 11 Dec 2025

🚀 **Başlamaya hazır mısın?** → [QUICK_START.md](./QUICK_START.md)

