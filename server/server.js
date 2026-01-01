// Adobe PDF Services Backend Server
// Based on official Adobe SDK examples
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

    // Extract ZIP and read JSON
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(outputZipPath);
    const zipEntries = zip.getEntries();
    
    let structuredData = null;
    zipEntries.forEach(entry => {
      if (entry.entryName === 'structuredData.json') {
        structuredData = JSON.parse(entry.getData().toString('utf8'));
      }
    });

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
      
      console.log('📄 İlk 3 element örneği:');
      structuredData.elements?.slice(0, 3).forEach((el, idx) => {
        console.log(`  [${idx}] Page: ${el.Page || 1}, Text: "${el.Text?.substring(0, 40) || 'N/A'}", Bounds: [${el.Bounds?.join(', ') || 'N/A'}]`);
      });
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

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   Adobe PDF Services Backend Server           ║
║   Running on http://localhost:${PORT}         ║
║                                                ║
║   Endpoints:                                   ║
║   POST /api/html-to-pdf                        ║
║   POST /api/pdf-to-word                        ║
║   POST /api/word-to-pdf                        ║
║   POST /api/extract-document                   ║
║                                                ║
║   Using official Adobe PDF Services SDK       ║
╚════════════════════════════════════════════════╝
  `);
});
