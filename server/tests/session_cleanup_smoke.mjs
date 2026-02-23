import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(serverDir, 'uploads');
const publicUploadsDir = path.join(serverDir, 'public_uploads');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

async function uploadFile(endpoint, localPath, uploadName, mimeType) {
  const data = fs.readFileSync(localPath);
  const form = new FormData();
  form.append('file', new Blob([data], { type: mimeType }), uploadName);

  const response = await fetch(`${backendUrl}${endpoint}`, {
    method: 'POST',
    body: form,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Upload failed (${endpoint}): ${JSON.stringify(json)}`);
  }

  return json;
}

async function run() {
  const tmpPdf = path.join(serverDir, 'tests', 'tmp-smoke.pdf');
  const tmpDocx = path.join(serverDir, 'tests', 'tmp-smoke.docx');

  fs.writeFileSync(tmpPdf, Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'));
  fs.writeFileSync(tmpDocx, Buffer.from('This is a dummy docx payload for cleanup smoke test.'));

  try {
    const healthRes = await fetch(`${backendUrl}/health`);
    assert(healthRes.ok, 'Health endpoint is not reachable');

    console.log('--- PDF flow test ---');
    const pdfResult = await uploadFile('/api/upload-pdf', tmpPdf, 'smoke-test.pdf', 'application/pdf');
    assert(pdfResult.cleanupToken, 'cleanupToken missing in /api/upload-pdf response');
    assert(pdfResult.url, 'url missing in /api/upload-pdf response');

    const pdfUrl = new URL(pdfResult.url);
    const publicName = decodeURIComponent(path.basename(pdfUrl.pathname));
    const uploadedPdfPath = path.join(publicUploadsDir, publicName);
    assert(fileExists(uploadedPdfPath), `Uploaded PDF not found on disk: ${uploadedPdfPath}`);

    const pdfCleanupRes = await fetch(`${backendUrl}/api/pdf/session-end?cleanup_token=${encodeURIComponent(pdfResult.cleanupToken)}`, {
      method: 'POST',
    });
    const pdfCleanupJson = await pdfCleanupRes.json();
    assert(pdfCleanupRes.ok, `PDF session-end failed: ${JSON.stringify(pdfCleanupJson)}`);
    assert(pdfCleanupJson.success === true, 'PDF session-end did not return success=true');
    assert(pdfCleanupJson.deleted === true, 'PDF session-end did not delete file');
    assert(!fileExists(uploadedPdfPath), 'PDF file still exists after session-end cleanup');
    console.log('PDF cleanup passed');

    console.log('--- Collabora flow test ---');
    const collaboraResult = await uploadFile('/api/upload-for-collabora', tmpDocx, 'smoke-test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert(collaboraResult.fileId, 'fileId missing in /api/upload-for-collabora response');
    assert(collaboraResult.accessToken, 'accessToken missing in /api/upload-for-collabora response');

    const collaboraStoredPath = path.join(uploadsDir, `${collaboraResult.fileId}-smoke-test.docx`);
    assert(fileExists(collaboraStoredPath), `Collabora upload not found on disk: ${collaboraStoredPath}`);

    const collaboraCleanupRes = await fetch(`${backendUrl}/api/collabora/session-end?access_token=${encodeURIComponent(collaboraResult.accessToken)}`, {
      method: 'POST',
    });
    const collaboraCleanupJson = await collaboraCleanupRes.json();
    assert(collaboraCleanupRes.ok, `Collabora session-end failed: ${JSON.stringify(collaboraCleanupJson)}`);
    assert(collaboraCleanupJson.success === true, 'Collabora session-end did not return success=true');
    assert(collaboraCleanupJson.deleted === true, 'Collabora session-end did not delete file');
    assert(!fileExists(collaboraStoredPath), 'Collabora file still exists after session-end cleanup');
    console.log('Collabora cleanup passed');

    console.log('✅ ALL SMOKE TESTS PASSED');
  } finally {
    if (fileExists(tmpPdf)) fs.unlinkSync(tmpPdf);
    if (fileExists(tmpDocx)) fs.unlinkSync(tmpDocx);
  }
}

run().catch((err) => {
  console.error('❌ SMOKE TEST FAILED');
  console.error(err);
  process.exit(1);
});
