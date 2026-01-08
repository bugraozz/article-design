// Adobe PDF Services Backend Server
// Based on official Adobe SDK examples
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mammoth from 'mammoth';

// Adobe PDF Services SDK - Using ES6 imports
import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  HTMLToPDFJob,
  HTMLToPDFParams,
  HTMLToPDFResult,
  PageLayout,
  CreatePDFJob,
  CreatePDFResult,
  ExportPDFJob,
  ExportPDFParams,
  ExportPDFTargetFormat,
  ExportPDFResult,
  ExtractPDFJob,
  ExtractPDFParams,
  ExtractElementType,
  ExtractPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError
} from '@adobe/pdfservices-node-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Adobe PDF Services Backend is running' });
});

// HTML to PDF endpoint - Based on official Adobe example
app.post('/api/html-to-pdf', async (req, res) => {
  let readStream;
  let inputFilePath = null;

  try {
    const { html, filename } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('📄 Converting HTML to PDF using Adobe SDK...');

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save HTML to temporary file
    inputFilePath = path.join(uploadsDir, `input-${Date.now()}.html`);
    fs.writeFileSync(inputFilePath, html, 'utf8');

    // Initial setup, create credentials instance (from official example)
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    // Creates a PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // Creates an asset from source file and upload
    readStream = fs.createReadStream(inputFilePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.HTML
    });

    // Create parameters for the job - A4 page layout (Adobe Extract API standard)
    const pageLayout = new PageLayout({
      pageHeight: 11.69,  // A4: 297mm = 11.69 inches
      pageWidth: 8.27     // A4: 210mm = 8.27 inches
    });

    const params = new HTMLToPDFParams({
      pageLayout,
      includeHeaderFooter: true,
    });

    // Creates a new job instance
    const job = new HTMLToPDFJob({ inputAsset, params });

    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: HTMLToPDFResult
    });

    // Get content from the resulting asset
    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // Read stream to buffer
    const chunks = [];
    for await (const chunk of streamAsset.readStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);
    const base64PDF = pdfBuffer.toString('base64');

    res.json({
      success: true,
      pdf: `data:application/pdf;base64,${base64PDF}`,
      filename: filename || 'document.pdf'
    });

    console.log('✅ PDF created successfully');

  } catch (err) {
    console.error('❌ HTML to PDF error:', err);
    
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.log('Adobe SDK Exception:', err);
    }
    
    res.status(500).json({
      error: 'PDF conversion failed',
      details: err.message
    });
  } finally {
    readStream?.destroy();
    if (inputFilePath && fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
  }
});

// PDF to Word endpoint - Based on official Adobe export example
app.post('/api/pdf-to-word', async (req, res) => {
  let readStream;
  let inputFilePath = null;

  try {
    const { pdf, filename } = req.body;
    
    if (!pdf) {
      return res.status(400).json({ error: 'PDF data is required' });
    }

    console.log('📝 Converting PDF to Word using Adobe SDK...');

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save PDF to temporary file
    const pdfData = pdf.replace(/^data:application\/pdf;base64,/, '');
    inputFilePath = path.join(uploadsDir, `input-${Date.now()}.pdf`);
    fs.writeFileSync(inputFilePath, Buffer.from(pdfData, 'base64'));

    // Initial setup, create credentials instance (from official example)
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    // Creates a PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // Creates an asset from source file and upload
    readStream = fs.createReadStream(inputFilePath);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.PDF
    });

    // Create parameters for the job - export to DOCX
    const params = new ExportPDFParams({
      targetFormat: ExportPDFTargetFormat.DOCX
    });

    // Creates a new job instance
    const job = new ExportPDFJob({ inputAsset, params });

    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExportPDFResult
    });

    // Get content from the resulting asset
    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // Read stream to buffer
    const chunks = [];
    for await (const chunk of streamAsset.readStream) {
      chunks.push(chunk);
    }
    const wordBuffer = Buffer.concat(chunks);
    const base64Word = wordBuffer.toString('base64');

    res.json({
      success: true,
      word: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64Word}`,
      filename: filename || 'document.docx'
    });

    console.log('✅ Word document created successfully');

  } catch (err) {
    console.error('❌ PDF to Word error:', err);
    
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.log('Adobe SDK Exception:', err);
    }
    
    res.status(500).json({
      error: 'Word conversion failed',
      details: err.message
    });
  } finally {
    readStream?.destroy();
    if (inputFilePath && fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
  }
});

// Word to PDF endpoint - Based on official Adobe create-pdf-from-docx example
app.post('/api/word-to-pdf', upload.single('file'), async (req, res) => {
  let readStream;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Word file is required' });
    }

    console.log('📄 Converting Word to PDF using Adobe SDK...');

    // Initial setup, create credentials instance (from official example)
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    // Creates a PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // Creates an asset from source file and upload
    readStream = fs.createReadStream(req.file.path);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.DOCX
    });

    // Creates a new job instance
    const job = new CreatePDFJob({ inputAsset });

    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: CreatePDFResult
    });

    // Get content from the resulting asset
    const resultAsset = pdfServicesResponse.result.asset;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // Read stream to buffer
    const chunks = [];
    for await (const chunk of streamAsset.readStream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);
    const base64PDF = pdfBuffer.toString('base64');

    res.json({
      success: true,
      pdf: `data:application/pdf;base64,${base64PDF}`,
      filename: req.file.originalname.replace(/\.docx$/i, '.pdf')
    });

    console.log('✅ Word to PDF conversion successful');

  } catch (err) {
    console.error('❌ Word to PDF error:', err);
    
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.log('Adobe SDK Exception:', err);
    }
    
    res.status(500).json({
      error: 'Word to PDF conversion failed',
      details: err.message
    });
  } finally {
    readStream?.destroy();
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// Extract document endpoint - Based on official Adobe Extract example
app.post('/api/extract-document', upload.single('file'), async (req, res) => {
  let readStream;
  let outputZipPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    console.log('🔍 Extracting document content using Adobe SDK...');

    // Initial setup, create credentials instance
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    // Creates a PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // Creates an asset from source file and upload
    readStream = fs.createReadStream(req.file.path);
    const inputAsset = await pdfServices.upload({
      readStream,
      mimeType: req.file.mimetype === 'application/pdf' ? MimeType.PDF : MimeType.DOCX
    });

    // Create parameters for the job
    // Not: Görseller otomatik olarak figures/ klasöründe extract edilir
    const params = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT, ExtractElementType.TABLES]
    });

    // Creates a new job instance
    const job = new ExtractPDFJob({ inputAsset, params });

    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExtractPDFResult
    });

    // Get content from the resulting asset (ZIP file)
    const resultAsset = pdfServicesResponse.result.resource;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // Read stream to buffer
    const chunks = [];
    for await (const chunk of streamAsset.readStream) {
      chunks.push(chunk);
    }
    const zipBuffer = Buffer.concat(chunks);

    // Save temporarily to extract
    outputZipPath = path.join(__dirname, 'uploads', `extract-${Date.now()}.zip`);
    fs.writeFileSync(outputZipPath, zipBuffer);

    // Extract ZIP and read JSON + Images
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(outputZipPath);
    const zipEntries = zip.getEntries();
    
    let structuredData = null;
    const imageAssets = {}; // Görsel dosyalarını sakla
    
    zipEntries.forEach(entry => {
      if (entry.entryName === 'structuredData.json') {
        structuredData = JSON.parse(entry.getData().toString('utf8'));
      } 
      // Görsel dosyalarını yakala (figures/ klasöründekiler)
      else if (entry.entryName.startsWith('figures/')) {
        const imageData = entry.getData();
        const base64Image = imageData.toString('base64');
        const extension = entry.entryName.split('.').pop().toLowerCase();
        const mimeType = getMimeType(extension);
        
        // Base64 data URI oluştur
        imageAssets[entry.entryName] = `data:${mimeType};base64,${base64Image}`;
        console.log(`📷 Görsel bulundu: ${entry.entryName} (${(imageData.length / 1024).toFixed(1)} KB)`);
      }
    });
    
    // Görselleri structuredData'ya ekle
    if (structuredData && Object.keys(imageAssets).length > 0) {
      structuredData.imageAssets = imageAssets;
      console.log(`✅ ${Object.keys(imageAssets).length} görsel extract edildi`);
    }

    // Gerçek PDF sayfa boyutunu tespit et
    let pageWidth = 595;  // A4 default
    let pageHeight = 842;
    
    // Extended metadata'dan sayfa boyutunu bul
    if (structuredData?.extended_metadata?.page_count) {
      const pageInfo = structuredData.extended_metadata;
      if (pageInfo.page_info && pageInfo.page_info.length > 0) {
        const firstPage = pageInfo.page_info[0];
        if (firstPage.width && firstPage.height) {
          pageWidth = Math.round(firstPage.width);
          pageHeight = Math.round(firstPage.height);
          console.log(`📐 Extract API'den sayfa boyutu: ${pageWidth}pt x ${pageHeight}pt`);
        }
      }
    }
    
    // Eğer extended_metadata yoksa, elementlerin bounds'larından tahmin et
    if (pageWidth === 595 && structuredData?.elements) {
      let maxX = 0, maxY = 0;
      structuredData.elements.forEach(el => {
        const bounds = el.Bounds || el.Path?.[0]?.Bounds;
        if (bounds && bounds.length >= 4) {
          maxX = Math.max(maxX, bounds[2]);
          maxY = Math.max(maxY, bounds[3]);
        }
      });
      if (maxX > 100) {
        pageWidth = Math.ceil(maxX + 20); // Biraz margin ekle
        pageHeight = Math.ceil(maxY + 20);
        console.log(`📐 Bounds'lardan tahmin edilen boyut: ${pageWidth}pt x ${pageHeight}pt`);
      }
    }

    // Debug: Sayfa boyutunu ve ilk birkaç elementi logla
    if (structuredData) {
      console.log(`📊 Extract API sonucu: ${structuredData.elements?.length || 0} element bulundu`);
      console.log(`📏 Final PDF sayfa boyutu: ${pageWidth}pt x ${pageHeight}pt`);
      
      console.log('\n📄 İlk 10 element detaylı analiz:');
      structuredData.elements?.slice(0, 10).forEach((el, idx) => {
        console.log(`\n[${idx}] Element Detayı:`);
        console.log(`  Page: ${el.Page || 1}`);
        console.log(`  Text: "${el.Text?.substring(0, 50) || 'N/A'}"`);
        console.log(`  Bounds: [${el.Bounds?.join(', ') || 'N/A'}]`);
        console.log(`  Font: ${JSON.stringify(el.Font || {})}`);
        console.log(`  Path: ${el.Path?.length || 0} items`);
        console.log(`  Type: ${el.hasOwnProperty('Text') ? 'Text' : el.hasOwnProperty('Table') ? 'Table' : el.hasOwnProperty('Figure') ? 'Figure' : 'Other'}`);
      });
      
      // Sayfa dağılımını göster
      const pageDistribution = {};
      structuredData.elements?.forEach(el => {
        const page = el.Page || 1;
        pageDistribution[page] = (pageDistribution[page] || 0) + 1;
      });
      console.log('\n📊 Sayfa dağılımı:', pageDistribution);
    }

    res.json({
      success: true,
      message: 'Document extracted successfully',
      data: structuredData,
      pageSize: { width: pageWidth, height: pageHeight }, // Sayfa boyutunu ekle
      filename: req.file.originalname
    });

    console.log('✅ Document extracted successfully via Adobe SDK');

  } catch (err) {
    console.error('❌ Extract document error:', err);
    
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.log('Adobe SDK Exception:', err);
    }
    
    res.status(500).json({
      error: 'Document extraction failed',
      details: err.message
    });
  } finally {
    readStream?.destroy();
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (outputZipPath && fs.existsSync(outputZipPath)) {
      fs.unlinkSync(outputZipPath);
    }
  }
});

// Helper: MIME type belirleme
function getMimeType(extension) {
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  return mimeTypes[extension] || 'image/png';
}

// Word to PDF and Extract endpoint - Preserves page structure
app.post('/api/word-to-pdf-and-extract', upload.single('file'), async (req, res) => {
  let readStream;
  let pdfBuffer = null;
  let outputZipPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Word file is required' });
    }

    console.log('📄 Converting Word to PDF and extracting with page structure...');
    console.log('📄 File:', req.file.originalname);

    // Initial setup, create credentials instance
    const credentials = new ServicePrincipalCredentials({
      clientId: process.env.PDF_SERVICES_CLIENT_ID,
      clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
    });

    // Creates a PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // STEP 1: Convert Word to PDF
    console.log('📄 Step 1: Converting Word to PDF...');
    readStream = fs.createReadStream(req.file.path);
    const wordAsset = await pdfServices.upload({
      readStream,
      mimeType: MimeType.DOCX
    });

    const createPdfJob = new CreatePDFJob({ inputAsset: wordAsset });
    const createPollingURL = await pdfServices.submit({ job: createPdfJob });
    const createResponse = await pdfServices.getJobResult({
      pollingURL: createPollingURL,
      resultType: CreatePDFResult
    });

    // Get PDF content
    const pdfAsset = createResponse.result.asset;
    const pdfStreamAsset = await pdfServices.getContent({ asset: pdfAsset });

    // Read PDF stream to buffer
    const pdfChunks = [];
    for await (const chunk of pdfStreamAsset.readStream) {
      pdfChunks.push(chunk);
    }
    pdfBuffer = Buffer.concat(pdfChunks);
    console.log('✅ Word converted to PDF');

    // STEP 2: Extract content from PDF
    console.log('📄 Step 2: Extracting content from PDF...');
    
    // Save PDF temporarily
    const tempPdfPath = path.join(__dirname, 'uploads', `temp-${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    // Upload PDF for extraction
    const pdfReadStream = fs.createReadStream(tempPdfPath);
    const pdfInputAsset = await pdfServices.upload({
      readStream: pdfReadStream,
      mimeType: MimeType.PDF
    });

    // Create extraction parameters
    // Not: Görseller otomatik olarak figures/ klasöründe extract edilir
    const extractParams = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT, ExtractElementType.TABLES]
    });

    // Create and submit extraction job
    const extractJob = new ExtractPDFJob({ 
      inputAsset: pdfInputAsset, 
      params: extractParams 
    });

    const extractPollingURL = await pdfServices.submit({ job: extractJob });
    const extractResponse = await pdfServices.getJobResult({
      pollingURL: extractPollingURL,
      resultType: ExtractPDFResult
    });

    // Get extraction result (ZIP file)
    const resultAsset = extractResponse.result.resource;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });

    // Read stream to buffer
    const zipChunks = [];
    for await (const chunk of streamAsset.readStream) {
      zipChunks.push(chunk);
    }
    const zipBuffer = Buffer.concat(zipChunks);

    // Save and extract ZIP
    outputZipPath = path.join(__dirname, 'uploads', `extract-${Date.now()}.zip`);
    fs.writeFileSync(outputZipPath, zipBuffer);

    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(outputZipPath);
    const zipEntries = zip.getEntries();
    
    let structuredData = null;
    const imageAssets = {};
    
    zipEntries.forEach(entry => {
      if (entry.entryName === 'structuredData.json') {
        structuredData = JSON.parse(entry.getData().toString('utf8'));
      } else if (entry.entryName.startsWith('figures/')) {
        const imageData = entry.getData();
        const base64Image = imageData.toString('base64');
        const extension = entry.entryName.split('.').pop().toLowerCase();
        const mimeType = getMimeType(extension);
        imageAssets[entry.entryName] = `data:${mimeType};base64,${base64Image}`;
        console.log(`📷 Image found: ${entry.entryName}`);
      }
    });
    
    if (structuredData && Object.keys(imageAssets).length > 0) {
      structuredData.imageAssets = imageAssets;
      console.log(`✅ ${Object.keys(imageAssets).length} images extracted`);
    }

    // Get page size
    let pageWidth = 595;
    let pageHeight = 842;
    
    if (structuredData?.extended_metadata?.page_info?.[0]) {
      const firstPage = structuredData.extended_metadata.page_info[0];
      if (firstPage.width && firstPage.height) {
        pageWidth = Math.round(firstPage.width);
        pageHeight = Math.round(firstPage.height);
      }
    }

    console.log(`✅ Word document converted and extracted with page structure preserved`);
    console.log(`📊 Total elements: ${structuredData?.elements?.length || 0}`);
    console.log(`📏 Page size: ${pageWidth}pt x ${pageHeight}pt`);

    // Clean up temp files
    fs.unlinkSync(tempPdfPath);
    pdfReadStream.destroy();

    res.json({
      success: true,
      message: 'Word document converted and extracted successfully',
      data: structuredData,
      pageSize: { width: pageWidth, height: pageHeight },
      filename: req.file.originalname
    });

  } catch (err) {
    console.error('❌ Word to PDF and extract error:', err);
    
    if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
      console.log('Adobe SDK Exception:', err);
    }
    
    res.status(500).json({
      error: 'Word to PDF and extract failed',
      details: err.message
    });
  } finally {
    readStream?.destroy();
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    if (outputZipPath && fs.existsSync(outputZipPath)) {
      fs.unlinkSync(outputZipPath);
    }
  }
});

// Word Document Import endpoint - Using Mammoth.js for better formatting
app.post('/api/import-word', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Word file is required' });
    }

    console.log('📄 Importing Word document using Mammoth.js...');
    console.log('📄 File:', req.file.originalname);

    // Convert Word to HTML using Mammoth
    const result = await mammoth.convertToHtml(
      { path: req.file.path },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
        ],
        includeDefaultStyleMap: true,
        convertImage: mammoth.images.imgElement(async (image) => {
          // Convert images to base64
          const buffer = await image.read();
          const base64 = buffer.toString('base64');
          const contentType = image.contentType || 'image/png';
          return {
            src: `data:${contentType};base64,${base64}`
          };
        })
      }
    );

    console.log('✅ Word conversion successful');
    if (result.messages.length > 0) {
      console.log('⚠️ Conversion warnings:', result.messages);
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // HTML içeriğini sayfa sonlarına göre böl
    // Word'de sayfa sonları genellikle <br style="page-break-before:always"> veya benzer etiketlerle belirtilir
    const htmlContent = result.value;
    
    // Sayfa sonlarını tespit et ve içeriği böl
    const pageBreakPatterns = [
      /<hr[^>]*style="[^"]*page-break[^"]*"[^>]*>/gi,
      /<br[^>]*style="[^"]*page-break[^"]*"[^>]*>/gi,
      /<div[^>]*style="[^"]*page-break[^"]*"[^>]*><\/div>/gi,
      /<p[^>]*style="[^"]*page-break[^"]*"[^>]*><\/p>/gi
    ];
    
    let splitHtml = htmlContent;
    const pageBreakMarker = '<!--PAGE_BREAK-->';
    
    // Tüm sayfa sonu işaretlerini standart bir işarete çevir
    pageBreakPatterns.forEach(pattern => {
      splitHtml = splitHtml.replace(pattern, pageBreakMarker);
    });
    
    // İçeriği sayfa sonlarına göre böl
    const pages = splitHtml.split(pageBreakMarker).filter(page => page.trim().length > 0);
    
    console.log(`📄 Found ${pages.length} page(s) in Word document`);
    
    // Eğer sayfa sonu işareti yoksa, içerik uzunluğuna göre otomatik böl
    if (pages.length === 1 && htmlContent.length > 5000) {
      console.log('📄 No page breaks found, splitting by content length...');
      const segments = [];
      const tempDiv = htmlContent;
      const elements = tempDiv.match(/<[^>]+>.*?<\/[^>]+>|<[^>]+\/>/g) || [];
      
      let currentPage = '';
      let currentLength = 0;
      const maxPageLength = 5000; // yaklaşık bir sayfa uzunluğu
      
      elements.forEach(element => {
        if (currentLength + element.length > maxPageLength && currentPage.trim()) {
          segments.push(currentPage);
          currentPage = '';
          currentLength = 0;
        }
        currentPage += element;
        currentLength += element.length;
      });
      
      if (currentPage.trim()) {
        segments.push(currentPage);
      }
      
      console.log(`📄 Split into ${segments.length} page(s) by content length`);
      
      res.json({
        success: true,
        pages: segments.map(html => ({ html })),
        messages: result.messages,
        type: 'word',
        totalPages: segments.length
      });
    } else {
      res.json({
        success: true,
        pages: pages.map(html => ({ html })),
        messages: result.messages,
        type: 'word',
        totalPages: pages.length
      });
    }

  } catch (err) {
    console.error('❌ Word import error:', err);
    
    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Word import failed',
      details: err.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   Adobe PDF Services Backend Server                   ║
║   Running on http://localhost:${PORT}                 ║
║                                                        ║
║   Endpoints:                                           ║
║   POST /api/html-to-pdf                                ║
║   POST /api/pdf-to-word                                ║
║   POST /api/word-to-pdf                                ║
║   POST /api/extract-document         (PDF Import)      ║
║   POST /api/word-to-pdf-and-extract  (Word Import)     ║
║   POST /api/import-word              (Word HTML)       ║
║                                                        ║
║   Using Adobe PDF Services SDK & Mammoth.js           ║
╚════════════════════════════════════════════════════════╝
  `);
});
