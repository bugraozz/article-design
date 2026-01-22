# Deployment guide — Collabora (WOPI) + Backend

This document explains how to deploy the project components required for Collabora (CODE) + WOPI integration in production-like environment using Docker Compose and Nginx.

Prerequisites
- Docker & Docker Compose installed
- DNS entries for `collabora.your-domain.com` and `wopi.your-domain.com`
- TLS certificates (Let's Encrypt recommended)

Quick start (local dev, minimal)

1. Start backend locally

```powershell
cd server
npm install
$env:BACKEND_URL='http://localhost:3001'
$env:WOPI_JWT_SECRET='change_this_to_a_strong_secret'
npm run dev
```

2. Start Collabora (CODE)

```powershell
docker run -t -d -p 9980:9980 --name collabora --restart always collabora/code
```

3. Open frontend and upload a `.docx` from Home page (default frontend dev runs at `http://localhost:5173`)

Production notes
- Use the provided `deploy/docker-compose.wopi.yml` as a reference (adjust domain, cert paths and environment variables).
- Ensure `WOPI_JWT_SECRET` is set to a strong random value and kept secret.
- Use Nginx (or Traefik) to reverse-proxy Collabora and the backend; websocket support and long timeouts must be enabled.
- For secure file access, keep the `uploads/` directory private and only serve file contents through the WOPI endpoints (the example exposes uploads for convenience; change in production).

Security checklist
- Enable HTTPS for both Collabora and backend (TLS termination at Nginx).
- Use strong `WOPI_JWT_SECRET` and short token expiry (`WOPI_TOKEN_EXP`).
- Run periodic cleanup of `uploads/` and database entries.
- Use a proper DB instead of `lowdb` for multi-instance deployments.
