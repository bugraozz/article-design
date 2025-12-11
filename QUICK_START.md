# 🚀 Quick Start Guide - Profesyonel Matematik Sistemi

## 5 Dakikada Başla!

### Adım 1: Installation ✅
```bash
cd article-design
npm install
```

DOMPurify zaten eklenmiş: `"dompurify": "^3.0.6"`

### Adım 2: Sistem Başlat

**App.jsx'de:**
```jsx
import { initializeMathSystem } from "./utils/advancedMathProcessor";

export default function App() {
  useEffect(() => {
    initializeMathSystem(); // ⭐ Bu satır ekle
  }, []);
  
  return <...>;
}
```

### Adım 3: İlk Math Komponenti

```jsx
import ProfessionalMathRenderer from "./components/ProfessionalMathRenderer";

export default function MyComponent() {
  return (
    <ProfessionalMathRenderer
      content="\frac{a}{b}"
      type="latex"
      mode="display"
    />
  );
}
```

**Sonuç:** Profesyonel görünümlü kesir! ✨

---

## 10 Dakikada Editör

### Düzenlenebilir Math Componenti

```jsx
import { useState } from "react";
import ProfessionalMathRenderer from "./components/ProfessionalMathRenderer";

export default function EditableMath() {
  const [latex, setLatex] = useState("\\frac{a}{b}");

  return (
    <ProfessionalMathRenderer
      content={latex}
      type="latex"
      editable={true}
      onEdit={setLatex}  // ⭐ Düzenlenebilir!
    />
  );
}
```

**Özellikler:**
- Tıkla → Edit mode
- Ctrl+Enter → Kaydet
- Esc → İptal

---

## 15 Dakikada Karakter Editörü

```jsx
import { useState } from "react";
import { CharacterMathEditor } from "./components/ProfessionalMathRenderer";
import { MathElement } from "./utils/mathSystem";

export default function MyEditor() {
  const [element, setElement] = useState(
    new MathElement("fraction", { numerator: "a", denominator: "b" })
  );

  return (
    <>
      <CharacterMathEditor
        mathElement={element}
        onUpdate={(updated) => {
          setElement(updated);
          console.log("LaTeX:", updated.toLatex());
        }}
      />
      
      <div style={{ marginTop: "20px" }}>
        <p>Oluşturulan LaTeX: {element.toLatex()}</p>
      </div>
    </>
  );
}
```

**Özellikler:**
- Pay/Payda editlenmesi
- Live preview
- LaTeX otomatik güncelleme

---

## 20 Dakikada Format Dönüştürme

### Word'ten Formül Yapıştırma

**TextOverlay.jsx'de (zaten yapılmış):**
```jsx
handlePaste: async (view, event) => {
  const html = event.clipboardData.getData("text/html");
  
  if (html.includes("<m:oMath")) {
    // ⭐ OMML (Word) otomatik algılanır
    const result = await AdvancedMathProcessor.handlePasteHTML(html);
    
    // result.latex veya result.mathml kullanılabilir
    const mathml = MathSanitizer.sanitizeMathML(result.mathml);
    
    // Render et
    view.dispatch(...);
  }
}
```

**Nasıl Çalışır:**
1. Word'te formülü kopyala
2. Project'te yapıştır
3. OMML otomatik algılanır
4. LaTeX/MathML'e dönüştürülür
5. Profesyonel render edilir

---

## Pratik Örnekler

### Example 1: Simple Display

```jsx
<ProfessionalMathRenderer
  content="\sqrt{x^2 + y^2}"
  type="latex"
/>
```

### Example 2: Kesir

```jsx
const fraction = new MathElement("fraction", {
  numerator: "x + y",
  denominator: "2"
});

<CharacterMathEditor mathElement={fraction} />
```

### Example 3: Toplam

```jsx
<ProfessionalMathRenderer
  content="\sum_{i=1}^{n} a_i"
  type="latex"
/>
```

### Example 4: İntegral

```jsx
<ProfessionalMathRenderer
  content="\int_{0}^{\pi} \sin(x) dx"
  type="latex"
/>
```

### Example 5: Format Dönüştürme

```jsx
import { LaTeXConverter } from "./utils/mathSystem";

const latex = "\frac{a}{b}";
const mathml = LaTeXConverter.toMathML(latex);

console.log(mathml);
// <math xmlns="..."><mfrac><mrow>...</mrow>...</mfrac></math>
```

---

## Çok Kullanılan Formüller

| Formül | LaTeX |
|--------|-------|
| Kesir | `\frac{a}{b}` |
| Karekök | `\sqrt{x}` |
| Kübik kök | `\sqrt[3]{x}` |
| Üs | `x^{2}` |
| Alt indeks | `x_{n}` |
| Toplam | `\sum_{i=1}^{n}` |
| İntegral | `\int_{a}^{b}` |
| Limit | `\lim_{x \to \infty}` |
| Pi | `\pi` |
| Sonsuz | `\infty` |
| Plus-Eksi | `\pm` |
| Leq | `\leq` |
| Geq | `\geq` |

---

## CSS Customization

### Default Styles (ProfessionalMath.css'de)

```css
.professional-math-renderer {
  font-family: "Segoe UI", Roboto, ...;
  line-height: 1.8;
}

.professional-math-renderer:hover {
  background-color: rgba(59, 130, 246, 0.05);
}
```

### Custom Styling

```jsx
<ProfessionalMathRenderer
  content="\frac{a}{b}"
  style={{
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    fontSize: "18px"
  }}
  className="my-math-class"
/>
```

### CSS Classes

```css
/* Ana renderer */
.professional-math-renderer { }

/* KaTeX rendering */
.professional-math-renderer .katex { }
.professional-math-renderer .katex-display { }

/* MathML elements */
.professional-math-renderer math { }
.professional-math-renderer mi { } /* identifier */
.professional-math-renderer mo { } /* operator */
.professional-math-renderer mn { } /* number */

/* Editör */
.character-math-editor { }
.character-math-editor input { }

/* Error */
.math-error { }

/* Equation marker */
.equation-code { }
```

---

## Debugging Tips

### 1. Console Logging

```javascript
// mathSystem.js'de:
console.log("[MathSystem] Converting:", latex);
console.log("[MathSystem] Result:", mathml);

// Terminalde görebilirsin
```

### 2. Browser DevTools

```javascript
// Console'da:
import { LaTeXConverter } from "./utils/mathSystem";

const result = LaTeXConverter.toMathML("\\frac{a}{b}");
console.log(result);
```

### 3. Test Route

```javascript
// http://localhost:5173/advanced-math-demo
// Tüm özellikleri test edebilirsin
```

---

## Sık Sorular

### S: MathJax'ın CDN'si yavaş yükleniyor?

**C:** KaTeX varsayılan, MathJax fallback olarak çalışır. Hızlı rendering için KaTeX yeterli.

```javascript
// advancedMathProcessor.js'de
// KaTeX ile rendering (:
await renderWithKaTeX(latex);
```

### S: Word'ten paste ettiğim formül show olmuyor?

**C:** OMML format'ını kontrol et:

```javascript
const html = event.clipboardData.getData("text/html");
if (html.includes("<m:oMath")) {
  // OMML var
  const result = await AdvancedMathProcessor.handlePasteHTML(html);
  console.log(result);
}
```

### S: Custom operator/sembol nasıl eklerim?

**C:** `MathElement` extend et:

```javascript
class CustomElement extends MathElement {
  constructor() {
    super("custom");
  }
  
  toLatex() {
    return "\\custom{...}";
  }
  
  toMathML() {
    return "<mo>✓</mo>";
  }
}
```

### S: Performance nasıl optimize ederim?

**C:** Debounce rendering:

```javascript
let timeout;
const handleChange = (content) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    AdvancedMathProcessor.renderLatex(content, container);
  }, 300); // 300ms debounce
};
```

---

## Checklist - Entegrasyon

- [ ] `npm install` tamamlandı
- [ ] `initializeMathSystem()` App.jsx'de çağrılıyor
- [ ] DOMPurify yüklü (package.json'da)
- [ ] `ProfessionalMathRenderer` component import edilebiliyor
- [ ] CSS import edilmiş (`import "../styles/ProfessionalMath.css"`)
- [ ] Test route açılabiliyor (`/advanced-math-demo`)
- [ ] LaTeX rendering çalışıyor
- [ ] Word paste çalışıyor
- [ ] Character editor çalışıyor
- [ ] Düzenlenebilir mod çalışıyor

---

## Hızlı Test

### Terminal'de:

```bash
# 1. Dev server başlat
npm run dev

# 2. Tarayıcıda aç
# http://localhost:5173

# 3. Demo sayfası ziyaret et
# http://localhost:5173/advanced-math-demo

# 4. Örnekleri dene!
```

---

## Sonrası: İleri Seviye

Sistem hakkında daha fazla bilgi için:

1. **API Reference:** `API_REFERENCE.md`
2. **Kullanıcı Kılavuzu:** `MATH_SYSTEM_GUIDE.md`
3. **Implementation Özeti:** `IMPLEMENTATION_SUMMARY.md`
4. **Kaynak Kod:**
   - `src/utils/mathSystem.js` (1000+ lines)
   - `src/utils/advancedMathProcessor.js` (400+ lines)
   - `src/components/ProfessionalMathRenderer.jsx` (500+ lines)

---

## Support

Sorunlar yaşarsan:

1. Console loglarını kontrol et
2. `mathSystem.js`'deki error'ları oku
3. Test route'unda örnekleri dene
4. API Reference'de method'u ara

---

**Başarılar!** 🎉

Demo sayfasında tüm özellikleri deneyebilirsin:  
👉 `/advanced-math-demo`
