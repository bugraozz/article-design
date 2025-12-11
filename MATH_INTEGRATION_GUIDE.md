# Matematik Editörü Entegrasyonu Kılavuzu

## 🎯 Genel Bakış

MainToolbar'a denklem ve sembol ekleme özellikleri başarıyla entegre edildi. Sistem, aşağıdaki matematik formatlarını destekler:

- **LaTeX**: `$x^2$` (inline), `$$E=mc^2$$` (display)
- **MathML**: XML tabanlı matematik markup dili
- **OMML**: Office Math Markup Language (Word matematik)
- **Unicode**: ∑, ∫, π, α, β vb. matematik sembolleri
- **KaTeX**: Hızlı ve modern matematik render

## 🚀 Özellikler

### 1. **Denklem Editörü** 📐

MainToolbar'daki "Denklem Ekle" butonu:
- LaTeX formatında denklem oluşturma
- Inline ve Display mod seçimi
- Canlı önizleme
- Yaygın denklem şablonları
- KaTeX desteği

### 2. **Sembol Paneli** 📝

MainToolbar'daki "Sembol Ekle" butonu:
- Kategorize edilmiş matematik sembolleri
- Hızlı erişim için kategori filtreleme
- Tek tıkla sembol ekleme
- LaTeX komutları gösterimi

### 3. **Format Desteği** 🔄

#### LaTeX
```latex
$x^2 + y^2 = z^2$          // Inline
$$\frac{a}{b}$$             // Display
\(\alpha + \beta\)          // Alternatif inline
\[\int_0^\infty f(x)dx\]   // Alternatif display
```

#### MathML
```xml
<math>
  <mfrac>
    <mrow><mi>a</mi></mrow>
    <mrow><mi>b</mi></mrow>
  </mfrac>
</math>
```

#### OMML (Office Math)
```xml
<m:oMath>
  <m:f>
    <m:num><m:r>a</m:r></m:num>
    <m:den><m:r>b</m:r></m:den>
  </m:f>
</m:oMath>
```

#### Unicode
```
∑∫∏√∞≤≥≠≈×÷±αβγδπΔΣΩ
```

## 📦 Eklenen Dosyalar

### 1. **Yeni Utility Dosyaları**
- `src/utils/mathRenderer.js` - Matematik render ve dönüştürme fonksiyonları
- `src/components/MathRenderer.jsx` - Matematik render bileşeni

### 2. **Güncellenmiş Dosyalar**
- `src/components/Toolbar/MainToolbar.jsx` - Yeni matematik butonları
- `src/pages/EditorPage.jsx` - Modal ve panel entegrasyonu
- `src/overlays/TextOverlay.jsx` - Matematik içeriği render desteği
- `src/index.css` - Matematik stiller ve KaTeX import

## 🎨 Kullanım

### Toolbar'dan Denklem Ekleme

1. **Denklem Ekle** butonuna tıklayın
2. LaTeX formatında denklem yazın
3. Inline veya Display mod seçin
4. Önizlemeyi kontrol edin
5. "Denklem Ekle" ile ekleyin

```jsx
// Örnek kullanım - EditorPage.jsx
<MainToolbar
  onOpenEquationEditor={handleOpenEquationEditor}
  onOpenMathSymbolPanel={handleOpenMathSymbolPanel}
  // ... diğer props
/>
```

### Sembol Ekleme

1. **Sembol Ekle** butonuna tıklayın
2. Kategori seçin (Basic, Greek Letters, Operators, vb.)
3. İstediğiniz sembole tıklayın
4. Sembol otomatik olarak metne eklenir

### Yapıştırma Desteği

Farklı kaynaklardan matematik içeriği yapıştırabilirsiniz:

```javascript
// Word'den kopyalanan OMML
<m:oMath>...</m:oMath>
// Otomatik LaTeX'e dönüşür

// Wikipedia'dan kopyalanan MathML
<math>...</math>
// Otomatik LaTeX'e dönüşür

// LaTeX editor'den
$E = mc^2$
// Doğrudan render edilir
```

## 🎯 API Referansı

### processMathInHTML(htmlString)
HTML içeriğindeki matematik formatlarını işler ve KaTeX ile render eder.

```javascript
import { processMathInHTML } from '../utils/mathRenderer';

const rendered = processMathInHTML('<p>Formula: $x^2 + y^2$</p>');
```

### convertMathMLToLaTeX(mathml)
MathML formatını LaTeX'e dönüştürür.

```javascript
import { convertMathMLToLaTeX } from '../utils/mathRenderer';

const latex = convertMathMLToLaTeX('<mfrac>...');
```

### convertOMMLToLaTeX(omml)
Office Math Markup'ı LaTeX'e dönüştürür.

```javascript
import { convertOMMLToLaTeX } from '../utils/mathRenderer';

const latex = convertOMMLToLaTeX('<m:oMath>...');
```

### convertUnicodeToLaTeX(text)
Unicode matematik sembollerini LaTeX komutlarına dönüştürür.

```javascript
import { convertUnicodeToLaTeX } from '../utils/mathRenderer';

const latex = convertUnicodeToLaTeX('∑∫π'); // '\\sum\\int\\pi'
```

## 🎨 Stiller

Matematik içeriği için özel CSS sınıfları:

```css
.math-inline      /* Inline matematik */
.math-block       /* Display matematik */
.katex-rendered   /* KaTeX ile render edilmiş */
.math-editable    /* Düzenlenebilir matematik */
```

## 🔧 Yapılandırma

KaTeX ayarları `mathRenderer.js` içinde:

```javascript
katex.render(latex, element, {
  throwOnError: false,    // Hata durumunda crash etme
  displayMode: true,      // Display veya inline
  output: 'html',         // 'html' veya 'mathml'
  trust: true,            // Özel komutlara izin ver
  strict: false,          // Esnek parse
  macros: {               // Özel makrolar
    "\\RR": "\\mathbb{R}",
    // ...
  },
});
```

## 📋 Desteklenen LaTeX Komutları

### Temel Operatörler
- Üstel: `x^2`, `x^{n+1}`
- Alt indeks: `x_i`, `x_{n-1}`
- Kesir: `\frac{a}{b}`
- Karekök: `\sqrt{x}`, `\sqrt[n]{x}`

### Operatörler
- Toplam: `\sum_{i=1}^{n}`
- İntegral: `\int_a^b f(x)dx`
- Çarpım: `\prod_{i=1}^{n}`
- Limit: `\lim_{x \to \infty}`

### Yunanca Harfler
- Küçük: `\alpha`, `\beta`, `\gamma`, `\delta`, `\pi`
- Büyük: `\Delta`, `\Sigma`, `\Pi`, `\Omega`

### İlişkiler
- `\leq`, `\geq`, `\neq`, `\approx`, `\equiv`

### Fonksiyonlar
- Trigonometrik: `\sin`, `\cos`, `\tan`
- Logaritma: `\log`, `\ln`
- Matris: `\begin{matrix}...\end{matrix}`

## 🐛 Sorun Giderme

### Matematik içeriği görünmüyor
1. KaTeX CSS'inin import edildiğini kontrol edin (`index.css`)
2. Console'da hata var mı kontrol edin
3. LaTeX sözdiziminin doğru olduğundan emin olun

### Yapıştırma çalışmıyor
1. Format desteğini kontrol edin (MathML/OMML/LaTeX)
2. `sanitizePastedContent` fonksiyonu çağrılıyor mu?
3. Browser console'da hata var mı?

### Render performansı
- KaTeX cache kullanır, ilk render yavaş olabilir
- Büyük denklemler için `displayMode: true` kullanın
- Çok sayıda denklem varsa lazy loading düşünün

## 🚀 Gelecek Geliştirmeler

- [ ] Denklem düzenleme (çift tıklama ile)
- [ ] Daha fazla denklem şablonu
- [ ] Matematik symbol autocomplete
- [ ] Denklem numaralandırma
- [ ] Cross-reference desteği
- [ ] Export to LaTeX document
- [ ] Collaborative editing

## 📚 Kaynaklar

- [KaTeX Documentation](https://katex.org/)
- [LaTeX Math Symbols](https://www.cmor-faculty.rice.edu/~heinken/latex/symbols.pdf)
- [MathML Specification](https://www.w3.org/TR/MathML/)
- [Office Math Markup](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-oe376/)

## ✅ Test Senaryoları

1. **Temel LaTeX**
   - `$x^2 + y^2 = z^2$` ekleyin
   - Doğru render edildiğini kontrol edin

2. **Display Matematik**
   - `$$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$` ekleyin
   - Merkezde görüntülendiğini kontrol edin

3. **Sembol Ekleme**
   - Sembol panelinden `π` ekleyin
   - Doğru LaTeX'e dönüştüğünü kontrol edin

4. **Yapıştırma**
   - Word'den matematik içeriği yapıştırın
   - Yapının bozulmadığını kontrol edin

5. **Düzenleme**
   - Mevcut denklemi düzenleyin
   - Değişikliklerin kaydedildiğini kontrol edin

---

**Son Güncelleme**: 11 Aralık 2025
**Geliştirici**: GitHub Copilot
**Durum**: ✅ Tamamlandı ve Test Edildi
