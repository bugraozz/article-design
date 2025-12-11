# 📐 Denklem ve Matematik Sembol Özellikleri - Yeni Geliştirmeler

## ✨ Yeni Özellikler

### 1. **Google Docs Denklemi Yapıştırma Desteği**
- Google Docs'tan kopyalanan matematiksel denklemleri otomatik olarak tespit et
- Unicode matematik karakterlerini (√, ∫, ∑, ∏, ±, vb.) LaTeX formatına çevir
- Yapıştırıldığında denklem otomatik olarak sembol panelinde render edilir

**Nasıl Çalışır:**
1. Google Docs'ta bir denklem kopyala (ör: `E = mc²`, `√(x² + y²)`)
2. Sayfada bir metin alanına yapıştır (Ctrl+V)
3. Denklem otomatik olarak tanınır ve equation-code formatında kaydedilir

### 2. **Matematik Sembolleri Paneli** 
Yeni "Semboller" düğmesi toolbar'a eklendi. Tıklandığında matematik sembollerini kategorilere göre gösteren panel açılır:

**Kategori ve Semboller:**

- **Operatörler**: +, −, ×, ÷, =, ≠, <, >, ≤, ≥, ±, ·
- **Üst/Alt**: x², x³, xⁿ, x₂, x₃, xₙ, ⁿ√x, √x, ∛x
- **Yunanca**: α, β, γ, δ, ε, ζ, θ, λ, μ, π, Σ, Ω
- **Kalkülüs**: ∫, ∑, ∏, ∂, ∇, d/dx, ∞, →
- **Küme Teorisi**: ∈, ∉, ⊂, ⊆, ∪, ∩, ∅, ℝ, ℕ, ℤ

**Nasıl Çalışır:**
1. Toolbar'da "Semboller" düğmesini tıkla
2. Kategori seç (Operatörler, Yunanca, vb.)
3. İstediğin sembolü tıkla
4. Eğer aktif metin yazıyorsan sembol oraya eklenir
5. Yoksa yeni metin alanı oluşturulur ve sembol oraya yerleştirilir

### 3. **Denklem Editörü (Mevcut) - Geliştirmeler**
- LaTeX önizlemesi gerçek zamanda güncellenir
- Blok ve satır içi modlar arasında geçiş yap
- Yaygın denklem şablonları (E=mc², Pisagor, vb.)
- Sembol olarak KaTeX render edilir

---

## 🔧 Teknik Detaylar

### Yeni Dosyalar
- `src/components/Panels/MathSymbolPanel.jsx` - Matematik sembol seçici modal

### Değiştirilen Dosyalar
- `src/pages/EditorPage.jsx` 
  - `handleMathSymbolInsert()` fonksiyonu eklendi
  - `showMathSymbols` state'i eklendi
  - MathSymbolPanel render'ı eklendi
  
- `src/components/Toolbar/MainToolbar.jsx`
  - "Semboller" düğmesi eklendi (Sigma ikonu)
  - `onShowMathSymbols` prop eklendi

- `src/overlays/TextOverlay.jsx`
  - `convertGoogleDocsToLatex()` fonksiyonu eklendi
  - `handlePaste` event handler'ı eklendi
  - Otomatik equation tespit sistemi

---

## 📝 Örnek Kullanım

### Google Docs Yapıştırma
```
Google Docs'ta kopyala: E = mc²
Yapıştır: Otomatik olarak "E = mc^2" formatında kaydedilir
```

### Sembollerle Denklem Oluştur
```
1. "Semboller" tıkla
2. "Kalkülüs" kategorisinden "∫" seç
3. "Operatörler"den "_a" uzantısı tıkla
4. "^b" ekle
5. f(x)dx yazarak tamamla
Sonuç: ∫_a^b f(x)dx
```

---

## ✅ Özellik Uyumluluğu

| Özellik | Durum |
|---------|-------|
| Denklem Editörü | ✅ Çalışıyor |
| Google Docs Yapıştırma | ✅ Çalışıyor |
| Sembol Paneli | ✅ Çalışıyor |
| LaTeX Render | ✅ Çalışıyor |
| PNG/PDF Export | ✅ Çalışıyor |
| Global Ayarlar Uygulanması | ✅ Çalışıyor |

---

## 🎨 Görsel Tutuşu

- Sembol paneli modern, aydınlık tema ile tasarlandı
- Toolbar'a uyumlu mavi/mor renk şeması
- Responsive grid layout (6 sütun)
- Kolay kategori değişimi

