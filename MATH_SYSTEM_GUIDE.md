# Profesyonel Matematik Sistemi - Kullanıcı Kılavuzu

## 📚 Genel Bakış

Yeni matematik sistemi, **MathML**, **OMML** (Word), **LaTeX** ve **KaTeX**'e tam uyumlu, profesyonel görünümlü ve karakter-karakter düzenlenebilir bir yapı sunmaktadır.

## 🏗️ Sistem Mimarisi

### Ana Bileşenler

1. **mathSystem.js** - Unified Math System
   - `MathMLBuilder` - MathML oluşturma
   - `LaTeXConverter` - LaTeX dönüşümleri
   - `OMMlConverter` - OMML (Word) dönüşümleri
   - `MathElement` - Matematiksel eleman yapısı
   - `MathParser` - Parsing sistemi
   - `MathSanitizer` - XSS koruması

2. **advancedMathProcessor.js** - Gelişmiş İşleyici
   - `AdvancedMathProcessor` - Merkezi işlem sınıfı
   - KaTeX + MathJax entegrasyonu
   - Otomatik format tespiti
   - Clipboard handling

3. **ProfessionalMathRenderer.jsx** - React Bileşenleri
   - `ProfessionalMathRenderer` - Ana render bileşeni
   - `CharacterMathEditor` - Karakter editörü
   - KaTeX rendering
   - Düzenlenebilir mod

4. **ProfessionalMath.css** - Profesyonel Styling
   - KaTeX CSS uyumluluğu
   - MathML öğe stilleri
   - Responsive design
   - Print-friendly

## 🔄 Desteklenen Format Dönüşümleri

```
LaTeX ←→ MathML
LaTeX ←→ OMML
MathML ←→ OMML
```

Örnek:

```javascript
// LaTeX'den MathML'e
const mathml = LaTeXConverter.toMathML("\\frac{a}{b}");

// OMML'den LaTeX'e
const latex = OMMlConverter.toLatex(ommlXml);

// Otomatik dönüşüm
const result = await AdvancedMathProcessor.processMath(content, {
  inputFormat: "auto",
  outputFormat: "mathml"
});
```

## ✏️ Karakter-Karakter Düzenleme

Matematiksel elementin her bileşeni ayrı ayrı düzenlenebilir:

```javascript
// Kesir düzenlemesi
const fraction = new MathElement("fraction", {
  numerator: "a",
  denominator: "b"
});

// Güncelleme
fraction.attributes.numerator = "x + y";

// LaTeX'e dönüştür
const latex = fraction.toLatex(); // \frac{x + y}{b}
```

## 🎨 Supported Math Elements

| Type | LaTeX | Açıklama |
|------|-------|----------|
| fraction | `\frac{a}{b}` | Kesir |
| power | `x^{2}` | Üs |
| subscript | `x_{n}` | Alt İndeks |
| root | `\sqrt{x}` | Kök/Radikal |
| number | `123` | Sayı |
| identifier | `x` | Değişken |
| operator | `+`, `-`, `*` | Operatör |
| text | `\text{hello}` | Metin |

## 💾 Word/Docs'tan Paste Etme

Sistem otomatik olarak OMML (Word Math) formatını algılar ve dönüştürür:

```javascript
// TextOverlay'de otomatik:
handlePaste: (view, event) => {
  const htmlData = event.clipboardData.getData("text/html");
  
  if (htmlData.includes("<m:oMath")) {
    // OMML algılandı, otomatik dönüştür
    const result = await AdvancedMathProcessor.handlePasteHTML(htmlData);
    // result.latex, result.mathml kullanılabilir
  }
}
```

## 🎯 Kullanım Örnekleri

### 1. Basit Rendering

```jsx
import ProfessionalMathRenderer from "./components/ProfessionalMathRenderer";

<ProfessionalMathRenderer
  content="\frac{a}{b}"
  type="latex"
  mode="display"
/>
```

### 2. Düzenlenebilir Renderer

```jsx
<ProfessionalMathRenderer
  content={mathContent}
  type="latex"
  editable={true}
  onEdit={(newLatex) => {
    console.log("Yeni LaTeX:", newLatex);
  }}
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
    const latex = updated.toLatex();
  }}
/>
```

### 4. Format Dönüştürme

```javascript
import { LaTeXConverter, OMMlConverter } from "./utils/mathSystem";

// LaTeX → MathML
const mathml = LaTeXConverter.toMathML("\\frac{x}{2}");

// OMML → LaTeX
const latex = OMMlConverter.toLatex(wordMathXml);

// Otomatik tespitle dönüştür
const result = await AdvancedMathProcessor.processMath(content, {
  inputFormat: "auto",
  outputFormat: "mathml",
  sanitize: true,
  render: true
});
```

## 🛡️ Güvenlik

Sistem XSS koruması için `MathSanitizer` sınıfını kullanır:

```javascript
// Otomatik sanitization
const cleaned = MathSanitizer.sanitizeMathML(userInput);

// LaTeX sanitization (tehlikeli komutlar kaldırılır)
const safeLaTeX = MathSanitizer.sanitizeLatex(userLatex);

// HTML escape
const escaped = MathSanitizer.escapeHtml(text);
```

## ⚡ Performance

- KaTeX için temel rendering
- MathJax fallback olarak kullanılır
- Lazy loading desteği
- Rendering cache
- Otomatik cleanup

## 🎓 Advanced Usage

### Custom Math Elements Oluşturma

```javascript
import { MathElement } from "./utils/mathSystem";

class ComplexFraction extends MathElement {
  constructor() {
    super("fraction");
    this.attributes = {
      numerator: "",
      denominator: ""
    };
  }
  
  toLatex() {
    return `\\cfrac{${this.attributes.numerator}}{${this.attributes.denominator}}`;
  }
}
```

### Custom Rendering

```javascript
import { AdvancedMathProcessor } from "./utils/advancedMathProcessor";

const container = document.getElementById("math-container");
await AdvancedMathProcessor.renderLatex("\\int_{0}^{1} x dx", container);
```

## 📱 Responsive Davranış

Sistem otomatik olarak farklı ekran boyutlarına uyum sağlar:

- **Desktop**: Full-size rendering
- **Tablet**: Scaled rendering
- **Mobile**: Optimized inline display

## 🔧 Konfigürasyon

### MathJax Yapılandırması

```javascript
// advancedMathProcessor.js'de:
window.MathJax = {
  tex: {
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
    processEscapes: true
  },
  chtml: {
    scale: 1.0
  }
};
```

### KaTeX Seçenekleri

```javascript
katex.render(latex, container, {
  displayMode: true,
  throwOnError: false,
  macros: {
    "\\f": "#1f(#2)"
  }
});
```

## 🐛 Troubleshooting

### Problem: Math rendering gösterilmiyor

**Çözüm:**
```javascript
// App.jsx'de initialization kontrol et
import { initializeMathSystem } from "./utils/advancedMathProcessor";

useEffect(() => {
  initializeMathSystem();
}, []);
```

### Problem: OMML dönüşümü başarısız

**Çözüm:**
```javascript
// Manual dönüşüm deneyin
const latex = OMMlConverter.toLatex(ommlXml);
if (!latex) {
  const mathml = OMMlConverter.toMathML(ommlXml);
  // MathML'i doğrudan kullanın
}
```

### Problem: Performance sorunları

**Çözüm:**
```javascript
// Lazy rendering kullanın
const renderMath = useCallback(() => {
  // Debounce ile rendering
  setTimeout(() => {
    AdvancedMathProcessor.renderAllMath(container);
  }, 300);
}, []);
```

## 📖 API Referansı

### MathElement

```typescript
class MathElement {
  type: string; // fraction, power, subscript, root, etc.
  attributes: { [key]: any };
  children: MathElement[];
  
  addChild(child: MathElement): this;
  toMathML(): string;
  toLatex(): string;
}
```

### AdvancedMathProcessor

```typescript
class AdvancedMathProcessor {
  static async processMath(
    content: string,
    options?: {
      inputFormat?: "auto" | "latex" | "mathml" | "omml";
      outputFormat?: "mathml" | "latex" | "html";
      sanitize?: boolean;
      render?: boolean;
    }
  ): Promise<string>;
  
  static async renderLatex(latex: string, element: HTMLElement): Promise<boolean>;
  static async renderMathML(mathml: string, element: HTMLElement): Promise<boolean>;
  static async renderAllMath(container: HTMLElement): Promise<void>;
  static async handlePasteHTML(html: string): Promise<PasteResult>;
}
```

## 🎉 Özetçe

Yeni matematik sistemi şunları sağlar:

✅ **Unified Format Support** - LaTeX, MathML, OMML
✅ **Character-by-Character Editing** - Yaşlı düzenlenebilirlik
✅ **Professional Rendering** - KaTeX + MathJax
✅ **Security** - XSS koruması
✅ **Performance** - Optimized rendering
✅ **Word Integration** - OMML paste desteği
✅ **Responsive Design** - Tüm cihazlarda uyum

---

**Not:** Detaylı sorunlar için `advancedMathProcessor.js` ve `mathSystem.js` dosyalarındaki console loglarını kontrol edin.
