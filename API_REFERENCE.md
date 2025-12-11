# API Reference - Profesyonel Matematik Sistemi

## Table of Contents
1. [mathSystem.js](#mathsystemjs)
2. [advancedMathProcessor.js](#advancedmathprocessorjs)
3. [ProfessionalMathRenderer.jsx](#professionalmathrendererjs)
4. [Türkçe İsimler Harita](#türkçe-isimler-harita)

---

## mathSystem.js

### MathMLBuilder

Statik sınıf - MathML oluşturma ve yapılandırma

#### Methods

```javascript
// Kesir oluştur
MathMLBuilder.createFraction(numerator, denominator)
// Örnek: MathMLBuilder.createFraction("<mi>a</mi>", "<mi>b</mi>")
// Çıkış: <mfrac><mrow><mi>a</mi></mrow><mrow><mi>b</mi></mrow></mfrac>

// Üs oluştur
MathMLBuilder.createSuperscript(base, exponent)
// Örnek: MathMLBuilder.createSuperscript("<mi>x</mi>", "<mn>2</mn>")

// Alt indeks oluştur
MathMLBuilder.createSubscript(base, subscript)

// Kök oluştur (varsayılan degree=2 için karekök)
MathMLBuilder.createRoot(radicand, degree = 2)

// Toplam oluştur
MathMLBuilder.createSum(start, end, expression)

// İntegral oluştur
MathMLBuilder.createIntegral(start, end, expression)

// Kimlik oluştur (değişken)
MathMLBuilder.createIdentifier(text)

// Operatör oluştur
MathMLBuilder.createOperator(op)

// Sayı oluştur
MathMLBuilder.createNumber(num)

// Metin oluştur
MathMLBuilder.createText(text)

// Block mode MathML wrap et
MathMLBuilder.wrap(content)
// Çıkış: <math xmlns="..."><content></math>

// Inline mode MathML wrap et
MathMLBuilder.wrapInline(content)
```

### LaTeXConverter

Statik sınıf - LaTeX ↔ MathML dönüşümleri

#### Methods

```javascript
// LaTeX'i MathML'e dönüştür
LaTeXConverter.toMathML(latex)
// Örnek: LaTeXConverter.toMathML("\\frac{a}{b}")
// Çıkış: <math>...<mfrac>...</mfrac>...</math>

// LaTeX'i MathML yapısına dönüştür (raw, wrap edilmemiş)
LaTeXConverter.latexToMathMLStructure(latex)

// LaTeX elemanını işle
LaTeXConverter.processElement(el)

// Unicode'u MathML'e çevir
LaTeXConverter.convertUnicodeToMathML(text)

// Karakterleri MathML'e wrap et
LaTeXConverter.wrapCharacters(text)
```

### OMMlConverter

Statik sınıf - OMML (Word) ↔ LaTeX/MathML dönüşümleri

#### Methods

```javascript
// OMML'i MathML'e dönüştür
OMMlConverter.toMathML(ommlXml)
// Örnek: OMMlConverter.toMathML("<m:oMath><m:f>...</m:f></m:oMath>")

// OMML'i LaTeX'e dönüştür
OMMlConverter.toLatex(ommlXml)

// MathML'i LaTeX'e dönüştür
OMMlConverter.mathmlToLatex(mathml)
```

### MathElement

Matematiksel elemanları temsil eden sınıf

#### Constructor
```javascript
new MathElement(type, attributes = {})
// type: "fraction", "power", "subscript", "root", "number", "identifier", "operator", "text"
// attributes: Her tip için farklı

// Örnekler:
new MathElement("fraction", { numerator: "a", denominator: "b" })
new MathElement("power", { base: "x", exponent: "2" })
new MathElement("subscript", { base: "x", subscript: "n" })
new MathElement("root", { degree: "3", base: "x" })
new MathElement("number", { value: "42" })
```

#### Properties
```javascript
mathElement.type          // Eleman tipi
mathElement.attributes    // Özellikleri
mathElement.id           // Unique ID
mathElement.children     // Alt elemanlar
```

#### Methods
```javascript
// Alt eleman ekle
mathElement.addChild(child: MathElement)

// MathML'e dönüştür
mathElement.toMathML()

// LaTeX'e dönüştür
mathElement.toLatex()
```

### MathParser

Statik sınıf - LaTeX ve MathML parsing

#### Methods

```javascript
// LaTeX'i parse et ve MathElement oluştur
MathParser.parseLatex(latex)
// Örnek: MathParser.parseLatex("\\frac{a}{b}")
// Çıkış: MathElement { type: "fraction", ... }

// MathML'i parse et
MathParser.parseMathML(mathml)

// MathML elemanını parse et (recursively)
MathParser.parseMathMLElement(node)
```

### MathSanitizer

Statik sınıf - Güvenlik ve sanitization

#### Methods

```javascript
// MathML sanitize et (XSS koruması)
MathSanitizer.sanitizeMathML(html)
// - İzin verilmeyen tagları kaldırır
// - İzin verilmeyen attribute'ları kaldırır
// - Script tags'ı engeller

// LaTeX sanitize et (tehlikeli komutları kaldır)
MathSanitizer.sanitizeLatex(latex)
// - \immediate\write18 kaldırır
// - \input, \include kaldırır

// HTML escape et
MathSanitizer.escapeHtml(text)
// Örnek: "<script>" → "&lt;script&gt;"
```

---

## advancedMathProcessor.js

### AdvancedMathProcessor

Merkezi processing sınıfı - render engine ve dönüşümleri

#### Methods

```javascript
// Umumi math işleme
async AdvancedMathProcessor.processMath(
  htmlString,
  options = {
    inputFormat: "auto",      // "auto", "latex", "mathml", "omml"
    outputFormat: "mathml",   // "mathml", "latex", "html"
    sanitize: true,
    render: false
  }
)
// Örnek:
const result = await AdvancedMathProcessor.processMath(
  "\\frac{a}{b}",
  { inputFormat: "latex", outputFormat: "mathml", sanitize: true }
);

// LaTeX'i render et
async AdvancedMathProcessor.renderLatex(latex, element)
// KaTeX ile render eder, MathJax fallback
// Çıkış: true/false (başarı)

// MathML'i render et
async AdvancedMathProcessor.renderMathML(mathml, element)

// Container içindeki tüm math'ları render et
async AdvancedMathProcessor.renderAllMath(container)

// HTML paste handling
async AdvancedMathProcessor.handlePasteHTML(htmlData)
// Çıkış: {
//   format: "omml|mathml|latex|unknown",
//   content: string,
//   latex: string,
//   mathml: string
// }

// OMML'i LaTeX'e çevir (yardımcı method)
AdvancedMathProcessor.convertOmmlToLatex(ommlXml)

// LaTeX'i MathML'e çevir (yardımcı method)
AdvancedMathProcessor.convertLatexToMathML(latex)

// MathJax ile render et
async AdvancedMathProcessor.renderWithMathJax(element)
```

### Initialization Functions

```javascript
// MathJax'ı yükle ve başlat
async initAdvancedMathJax()
// Promise döner, MathJax ready olunca resolve

// Tüm math sistemini başlat
async initializeMathSystem()
// App.jsx'de çağrılmalı (useEffect içinde)
```

### useMathRender Hook

React hook'u - rendering için

```javascript
const { renderMath } = useMathRender()

// Kullanım
await renderMath(content, "latex", containerElement)
await renderMath(content, "mathml", containerElement)
```

---

## ProfessionalMathRenderer.jsx

### ProfessionalMathRenderer Component

Ana render bileşeni

#### Props

```typescript
<ProfessionalMathRenderer
  content: string              // Math içeriği
  type: "latex" | "mathml"     // Giriş formatı (default: "latex")
  mode: "display" | "inline"   // Render modu (default: "display")
  editable: boolean            // Düzenlenebilir mi? (default: false)
  onEdit: (newContent) => void // Edit callback
  className: string            // CSS class
  style: object               // Inline CSS
/>
```

#### Örnekler

```jsx
// Basit rendering
<ProfessionalMathRenderer
  content="\frac{a}{b}"
  type="latex"
/>

// Düzenlenebilir
<ProfessionalMathRenderer
  content={latex}
  editable={true}
  onEdit={(newLatex) => {
    setLatex(newLatex);
  }}
  style={{ padding: "20px" }}
/>

// MathML rendering
<ProfessionalMathRenderer
  content={mathmlString}
  type="mathml"
  mode="inline"
/>
```

#### Ref Usage

```jsx
const ref = useRef();

<ProfessionalMathRenderer
  ref={ref}
  content="\sqrt{x}"
/>

// Erişim (gelecek versiyonlar için)
// ref.current.container // DOM element
```

### CharacterMathEditor Component

Karakter-karakter editör

#### Props

```typescript
<CharacterMathEditor
  mathElement: MathElement    // Düzenlenecek element
  onUpdate: (updated) => void // Güncelleme callback
  className: string           // CSS class
/>
```

#### Örnekler

```jsx
import { CharacterMathEditor } from "./components/ProfessionalMathRenderer";
import { MathElement } from "./utils/mathSystem";

const [element, setElement] = useState(
  new MathElement("fraction", { numerator: "a", denominator: "b" })
);

<CharacterMathEditor
  mathElement={element}
  onUpdate={(updated) => {
    setElement(updated);
    console.log("LaTeX:", updated.toLatex());
  }}
/>
```

#### Desteklenen Element Tipleri

- `fraction` - Kesir (numerator, denominator)
- `power` - Üs (base, exponent)
- `subscript` - Alt İndeks (base, subscript)
- `root` - Kök (degree, base)
- `identifier` - Değişken (value)
- `number` - Sayı (value)
- `operator` - Operatör (value)

---

## Integration Examples

### 1. TextOverlay'de Kullanım

```jsx
import ProfessionalMathRenderer from "./components/ProfessionalMathRenderer";
import { AdvancedMathProcessor } from "./utils/advancedMathProcessor";

// Paste handler'da
handlePaste: (view, event) => {
  const html = event.clipboardData.getData("text/html");
  
  if (html.includes("<m:oMath")) {
    const result = await AdvancedMathProcessor.handlePasteHTML(html);
    // result.latex veya result.mathml kullan
  }
}

// Display'de
<ProfessionalMathRenderer
  content={html}
  type="mathml"
  editable={true}
  onEdit={(newContent) => onInlineChange?.(newContent)}
/>
```

### 2. Formül Builder'da Kullanım

```jsx
import { CharacterMathEditor } from "./components/ProfessionalMathRenderer";
import { MathParser } from "./utils/mathSystem";

const element = MathParser.parseLatex("\\frac{a}{b}");

<CharacterMathEditor
  mathElement={element}
  onUpdate={(updated) => {
    const latex = updated.toLatex();
    onInsert(latex);
  }}
/>
```

### 3. Format Dönüşüm Utility'si

```javascript
import {
  LaTeXConverter,
  OMMlConverter,
  MathParser
} from "./utils/mathSystem";

// LaTeX'i tüm formatlara dönüştür
function convertLatex(latex) {
  return {
    latex,
    mathml: LaTeXConverter.toMathML(latex),
    element: MathParser.parseLatex(latex)
  };
}

// Kullanım
const formats = convertLatex("\\frac{x}{2}");
console.log(formats.mathml);    // MathML
console.log(formats.element.toLatex()); // LaTeX
```

---

## Türkçe İsimler Harita

| İngilizce | Türkçe |
|-----------|--------|
| fraction | kesir |
| numerator | pay |
| denominator | payda |
| power | üs |
| superscript | üst indeks |
| subscript | alt indeks |
| root | kök |
| radicand | kök içi |
| degree | derece |
| integral | integral |
| summation | toplam |
| base | taban |
| exponent | kuvvet |
| identifier | tanımlayıcı |
| operator | operatör |
| render | göster |
| sanitize | temizle |
| convert | çevir |
| parse | analiz et |

---

## Error Handling

### Try-Catch Örnekleri

```javascript
try {
  const result = await AdvancedMathProcessor.processMath(userInput);
} catch (error) {
  console.error("Math processing error:", error.message);
  // Fallback: orijinal içeriği göster
  setContent(userInput);
}

try {
  const latex = OMMlConverter.toLatex(ommlXml);
  if (!latex) {
    // Fallback MathML'e dönüştür
    const mathml = OMMlConverter.toMathML(ommlXml);
  }
} catch (error) {
  console.warn("OMML conversion failed:", error);
}
```

---

## Performance Tips

### 1. Debounce Rendering

```javascript
let renderTimeout;

const handleUpdate = (content) => {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    AdvancedMathProcessor.renderLatex(content, container);
  }, 300);
};
```

### 2. Lazy Render

```javascript
// Sadece gerekli elemanları render et
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      AdvancedMathProcessor.renderLatex(latex, entry.target);
    }
  });
});

mathElements.forEach(el => observer.observe(el));
```

### 3. Cache Results

```javascript
const renderCache = new Map();

function cachedRender(latex, container) {
  if (renderCache.has(latex)) {
    container.innerHTML = renderCache.get(latex);
    return;
  }
  
  AdvancedMathProcessor.renderLatex(latex, container);
  renderCache.set(latex, container.innerHTML);
}
```

---

## Debugging

### Enable Logging

```javascript
// mathSystem.js'de console.log'ları bırakabilirsiz
console.log("[MathSystem] Parsing:", latex);
console.log("[MathSystem] Result:", result);

// advancedMathProcessor.js'de
console.log("[AdvancedMathProcessor] Rendering...");
console.log("[AdvancedMathProcessor] Format detected:", format);
```

### Test Format Detection

```javascript
import { AdvancedMathProcessor } from "./utils/advancedMathProcessor";

const html = "..."; // Test HTML
const result = await AdvancedMathProcessor.handlePasteHTML(html);

console.log("Detected format:", result.format);
console.log("LaTeX output:", result.latex);
console.log("MathML output:", result.mathml);
```

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-11  
**Status:** ✅ Production Ready
