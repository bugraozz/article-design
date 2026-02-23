import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(serverDir, 'uploads');
const publicUploadsDir = path.join(serverDir, 'public_uploads');

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
const rounds = Number(process.env.LOAD_TEST_ROUNDS || 20);
const runId = `load-${Date.now()}`;

const summary = {
  pdf: { ok: 0, fail: 0 },
  collabora: { ok: 0, fail: 0 },
  failures: [],
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listTestArtifacts() {
  ensureDir(uploadsDir);
  ensureDir(publicUploadsDir);

  const uploadHits = fs.readdirSync(uploadsDir).filter((n) => n.includes(runId));
  const publicHits = fs.readdirSync(publicUploadsDir).filter((n) => n.includes(runId));

  return {
    uploadHits,
    publicHits,
    total: uploadHits.length + publicHits.length,
  };
}

async function uploadFile(endpoint, localPath, uploadName, mimeType) {
  const bytes = fs.readFileSync(localPath);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: mimeType }), uploadName);

  const res = await fetch(`${backendUrl}${endpoint}`, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(`${endpoint} failed: ${JSON.stringify(json)}`);
  return json;
}

async function runPdfRound(i) {
  const uploadName = `${runId}-pdf-${i}.pdf`;
  const tmpPath = path.join(serverDir, 'tests', uploadName);

  fs.writeFileSync(tmpPath, Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'));

  try {
    const result = await uploadFile('/api/upload-pdf', tmpPath, uploadName, 'application/pdf');
    if (!result.cleanupToken) throw new Error('cleanupToken missing');

    const cleanupRes = await fetch(`${backendUrl}/api/pdf/session-end?cleanup_token=${encodeURIComponent(result.cleanupToken)}`, {
      method: 'POST',
    });
    const cleanupJson = await cleanupRes.json();
    if (!cleanupRes.ok || cleanupJson.success !== true || cleanupJson.deleted !== true) {
      throw new Error(`pdf cleanup failed: ${JSON.stringify(cleanupJson)}`);
    }

    summary.pdf.ok += 1;
  } catch (err) {
    summary.pdf.fail += 1;
    summary.failures.push({ type: 'pdf', round: i, error: err.message });
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}

async function runCollaboraRound(i) {
  const uploadName = `${runId}-doc-${i}.docx`;
  const tmpPath = path.join(serverDir, 'tests', uploadName);

  fs.writeFileSync(tmpPath, Buffer.from(`Dummy DOCX payload ${runId} round ${i}`));

  try {
    const result = await uploadFile('/api/upload-for-collabora', tmpPath, uploadName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    if (!result.accessToken) throw new Error('accessToken missing');

    const cleanupRes = await fetch(`${backendUrl}/api/collabora/session-end?access_token=${encodeURIComponent(result.accessToken)}`, {
      method: 'POST',
    });
    const cleanupJson = await cleanupRes.json();
    if (!cleanupRes.ok || cleanupJson.success !== true || cleanupJson.deleted !== true) {
      throw new Error(`collabora cleanup failed: ${JSON.stringify(cleanupJson)}`);
    }

    summary.collabora.ok += 1;
  } catch (err) {
    summary.collabora.fail += 1;
    summary.failures.push({ type: 'collabora', round: i, error: err.message });
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}

async function main() {
  const health = await fetch(`${backendUrl}/health`);
  if (!health.ok) throw new Error('backend not healthy');

  console.log(`▶ Load test started: rounds=${rounds}, runId=${runId}`);

  const started = Date.now();
  for (let i = 1; i <= rounds; i += 1) {
    await runPdfRound(i);
    await runCollaboraRound(i);
  }

  const elapsedMs = Date.now() - started;
  const artifacts = listTestArtifacts();

  console.log('--- SUMMARY ---');
  console.log(`PDF: ok=${summary.pdf.ok}, fail=${summary.pdf.fail}`);
  console.log(`Collabora: ok=${summary.collabora.ok}, fail=${summary.collabora.fail}`);
  console.log(`Artifacts remaining for runId: ${artifacts.total}`);
  console.log(`Elapsed: ${elapsedMs} ms`);

  if (summary.failures.length > 0) {
    console.log('--- FAILURES ---');
    for (const f of summary.failures.slice(0, 10)) {
      console.log(`${f.type} round ${f.round}: ${f.error}`);
    }
  }

  if (artifacts.total > 0 || summary.pdf.fail > 0 || summary.collabora.fail > 0) {
    process.exit(1);
  }

  console.log('✅ LOAD TEST PASSED');
}

main().catch((err) => {
  console.error('❌ LOAD TEST FAILED');
  console.error(err);
  process.exit(1);
});
