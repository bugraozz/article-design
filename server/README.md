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
npm run dev
```

Manual test steps are included in `tests/wopi_manual_tests.ps1`.

Notes
- `lowdb` is used for metadata persistence for quick setup. For production, replace with Postgres / MySQL / Redis.
- JWT tokens are used as WOPI `access_token` and expire according to `WOPI_TOKEN_EXP`.
