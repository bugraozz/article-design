# Adobe PDF Services API Kurulum Rehberi

Bu belge, Adobe PDF Services API'yi projeye entegre etmek için gerekli adımları açıklar.

## 1. Adobe Hesabı ve API Erişimi

### Adım 1: Adobe Developer Console'a Kaydolun
1. [Adobe Developer Console](https://developer.adobe.com/console) adresine gidin
2. Adobe ID ile giriş yapın (yoksa ücretsiz oluşturun)
3. "Create new project" butonuna tıklayın

### Adım 2: PDF Services API Ekleyin
1. Projede "Add API" butonuna tıklayın
2. "Adobe PDF Services API" seçin
3. "Create new credentials" seçeneğini seçin
4. OAuth Server-to-Server seçin
5. Credentials oluşturun

### Adım 3: Credentials'ları Kopyalayın
Aşağıdaki bilgileri kaydedin:
- **Client ID** (Örn: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
- **Client Secret** (Örn: `p6o5n4m3-l2k1-j0i9-h8g7-f6e5d4c3b2a1`)

## 2. Proje Konfigürasyonu

### Adım 1: .env Dosyası Oluşturun
Proje ana dizininde `.env` dosyası oluşturun:

```bash
# .env
VITE_ADOBE_CLIENT_ID=buraya_client_id_yapistirin
VITE_ADOBE_CLIENT_SECRET=buraya_client_secret_yapistirin
```

⚠️ **ÖNEMLİ**: `.env` dosyası `.gitignore` içinde olmalı (zaten ekli).

### Adım 2: Package Kurulumu
Gerekli paketler zaten `package.json`'da var. Kurulum için:

```bash
npm install
```

## 3. API Kullanımı

### PDF Export (HTML → PDF)
```javascript
import adobeService from './services/adobeService';
import { convertPagesToHTML } from './utils/documentConverter';

// Sayfaları HTML'e çevir
const htmlContent = convertPagesToHTML(pages, articleSettings);

// Adobe ile PDF oluştur
const pdfBlob = await adobeService.htmlToPdf(htmlContent);

// İndir
const url = URL.createObjectURL(pdfBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'makale.pdf';
a.click();
```

### Word Export (PDF → DOCX)
```javascript
// Önce PDF oluştur
const pdfBlob = await adobeService.htmlToPdf(htmlContent);

// PDF'i Word'e çevir
const wordBlob = await adobeService.pdfToWord(pdfBlob);

// İndir
const url = URL.createObjectURL(wordBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'makale.docx';
a.click();
```

### Document Import (Word/PDF → Editor)
```javascript
// Word/PDF dosyası yükle
const file = event.target.files[0];
const blob = await file.arrayBuffer();

// İçeriği çıkar
const extractedData = await adobeService.extractDocument(
  new Blob([blob]), 
  file.type
);

// Sayfalara dönüştür
const pages = parseDocumentToPages(extractedData);
setPages(pages);
```

## 4. Özellikler

✅ **PDF Export**: Yüksek kaliteli, Adobe standartlarında PDF
✅ **Word Export**: Düzenlenebilir .docx formatı
✅ **Document Import**: Word ve PDF belgelerini içe aktarma
✅ **Layout Preservation**: Orijinal düzeni koruma
✅ **Font Embedding**: Fontların gömülmesi
✅ **Image Quality**: Yüksek çözünürlüklü görseller

## 5. API Limitleri ve Fiyatlandırma

### Ücretsiz Tier
- 500 işlem/ay ücretsiz
- Test ve geliştirme için yeterli

### Ücretli Planlar
- Standard: 1000 işlem/ay - $49
- Pro: 10,000 işlem/ay - $349
- Enterprise: Sınırsız - Özel fiyat

Detaylar: [Adobe Pricing](https://www.adobe.com/go/pdftoolsapi_pricing)

## 6. Güvenlik

🔒 **API Keys'leri Güvende Tutun**
- Asla GitHub'a commit etmeyin
- `.env` dosyası `.gitignore`'da olmalı
- Production'da environment variables kullanın

## 7. Sorun Giderme

### "Invalid credentials" Hatası
- Client ID ve Secret'ı kontrol edin
- `.env` dosyasının doğru konumda olduğundan emin olun
- Vite sunucusunu yeniden başlatın

### "Rate limit exceeded" Hatası
- API limit aşımı
- Ücretli plana geçin veya işlem sayısını azaltın

### "Job timeout" Hatası
- Büyük belgeler için timeout süresini artırın
- `pollJobStatus` fonksiyonunda `maxAttempts` değerini yükseltin

## 8. Destek

📧 Adobe Support: [https://www.adobe.com/go/pdftoolsapi_support](https://www.adobe.com/go/pdftoolsapi_support)
📚 Dokümantasyon: [https://developer.adobe.com/document-services/docs/](https://developer.adobe.com/document-services/docs/)
💬 Forum: [https://community.adobe.com/](https://community.adobe.com/)

---

**Hazırlayan**: AI Assistant
**Tarih**: 2026
**Versiyon**: 1.0
