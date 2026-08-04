# Deployment Easypanel dengan Docker Compose

Easypanel adalah satu-satunya tempat hosting production. GitHub Actions tidak lagi menjalankan deploy ke VPS atau `docker compose up`; workflow GitHub hanya menjalankan CI. Deployment production dilakukan oleh Easypanel dari repository GitHub menggunakan `docker-compose.prod.yml` sebagai compose base.

## Strategi Port

Jangan publish port host dari compose production. Easypanel sudah memiliki reverse proxy pada host untuk port 80/443, sehingga binding seperti `80:80` atau `3000:3000` dapat bentrok dengan service lain.

Compose production memakai `expose`:

- `frontend` expose port internal `80`.
- `backend` expose port internal `3000`.
- `db` hanya berada di network internal compose.

Domain aplikasi diarahkan di Easypanel ke service `frontend` port `80`. Browser tetap memakai satu origin; request `/api/` diproxy oleh Nginx frontend ke `backend:3000`.

## Service WAHA

WAHA dihosting sebagai service Easypanel terpisah. Backend tidak menjalankan container WAHA di compose aplikasi.

Environment backend:

```env
WHATSAPP_ENABLED=false
WAHA_BASE_URL=https://URL-WAHA-EASYPANEL
WAHA_API_KEY=ISI_API_KEY_WAHA
WAHA_SESSION=sop-staging
WHATSAPP_ALLOWED_RECIPIENTS=
```

Set `WHATSAPP_ENABLED=true` hanya setelah session WAHA berstatus `WORKING` dan allowlist sudah sesuai.

## Data yang Dipertahankan

Compose production memakai named volume stabil:

- `sop-arsip-db-prod-data` untuk MariaDB.
- `sop-arsip-pdf-prod-data` untuk PDF SOP arsip.

Jangan menjalankan `docker compose down -v` atau menghapus named volume kecuali memang ingin reset data production.

## Environment Easypanel

Isi environment service compose di Easypanel mengikuti `.env.example`. Minimal production:

```env
APP_VERSION=manual
DB_ROOT_PASSWORD=...
DB_NAME=sop_biro_organisasi
DB_USER=sop_app
DB_PASSWORD=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
SWAGGER_ENABLED=false
PUBLIC_APP_ORIGIN=
ALLOWED_ORIGINS=
SOP_PDF_STORAGE_DIR=/app/storage/sop-pdf
WHATSAPP_ENABLED=false
WAHA_BASE_URL=https://URL-WAHA-EASYPANEL
WAHA_API_KEY=...
WAHA_SESSION=sop-staging
WHATSAPP_ALLOWED_RECIPIENTS=
PDF_SIGNING_ENABLED=true
PDF_SIGNING_P12_PASSPHRASE=...
PDF_SIGNING_P12_BASE64=...
```

## Alur Deploy

1. Push kode ke branch yang dipakai Easypanel.
2. Easypanel mengambil repository GitHub.
3. Easypanel menjalankan compose dari `docker-compose.prod.yml`.
4. Easypanel mengarahkan domain ke service `frontend` port `80`.
5. Backend menjalankan migrasi Prisma, seed, lalu `pnpm start:prod`.

GitHub Actions tetap berguna sebagai quality gate, tetapi bukan mekanisme deploy production.
