# Backend (WOPI host) README

This backend provides:
- Existing Adobe PDF Services endpoints
- A WOPI-compatible host for Collabora (minimal)

Run locally

```powershell
cd server
npm install
$env:BACKEND_URL='http://localhost:3001'
$env:WOPI_JWT_SECRET='a-strong-secret-here'
$env:COLLABORA_URL='http://localhost:9980'
$env:UPLOAD_CLEANUP_TTL_HOURS='24'
$env:PROJECT_CLEANUP_TTL_HOURS='24'
$env:CLEANUP_INTERVAL_MINUTES='60'
npm run dev
```

Manual test steps are included in `tests/wopi_manual_tests.ps1`.

Notes
- JWT tokens are used as WOPI `access_token` and expire according to `WOPI_TOKEN_EXP`.
- Uploaded files are automatically cleaned up without a database:
	- `POST /api/collabora/session-end` deletes the current Collabora file when session ends.
	- `POST /api/pdf/session-end?cleanup_token=...` deletes uploaded PDF viewer files when viewer session ends.
	- A periodic cleanup removes stale files from `uploads`, `public_uploads`, and `saved_projects` by TTL.
	- Project share codes (`/api/projects/save`) are automatically expired and deleted after 24h (configurable).
	- `UPLOAD_CLEANUP_TTL_HOURS` controls upload stale age, `PROJECT_CLEANUP_TTL_HOURS` controls saved project age, `CLEANUP_INTERVAL_MINUTES` controls scan interval.
