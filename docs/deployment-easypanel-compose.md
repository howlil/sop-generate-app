# Deployment Easypanel dengan Docker Compose

Easypanel adalah satu-satunya tempat hosting production. GitHub Actions tidak lagi menjalankan deploy ke VPS atau `docker compose up`; workflow GitHub hanya menjalankan CI. Deployment production dilakukan oleh Easypanel dari repository GitHub menggunakan `docker-compose.prod.yml` sebagai compose base.

## Strategi Port

Jangan publish port host dari compose production. Easypanel sudah memiliki reverse proxy pada host untuk port 80/443, sehingga binding seperti `80:80` atau `3000:3000` dapat bentrok dengan service lain.

Compose production memakai `expose`:

- `frontend` expose port internal `80`.
- `backend` expose port internal `3000`.
- `waha` expose port internal `3000`.
- `db` hanya berada di network internal compose.

Domain aplikasi diarahkan di Easypanel ke service `frontend` port `80`. Browser tetap memakai satu origin; request `/api/` diproxy oleh Nginx frontend ke `backend:3000`.

## Service WAHA

WAHA berjalan langsung di compose production sebagai service `waha`. Backend berkomunikasi melalui network internal compose memakai `http://waha:3000`, sehingga tidak bergantung pada domain publik WAHA.

Tambahkan domain Easypanel terpisah ke service `waha` port internal `3000` hanya untuk dashboard, Swagger, dan pairing QR. Jangan arahkan domain aplikasi utama ke service `waha`.

Environment backend:

```env
WHATSAPP_ENABLED=false
WAHA_BASE_URL=http://waha:3000
WAHA_IMAGE=devlikeapro/waha:latest-2026.4.3
WAHA_API_KEY=ISI_API_KEY_WAHA
WAHA_SESSION=sop-staging
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=ISI_PASSWORD_DASHBOARD_WAHA
WAHA_PUBLIC_URL=https://URL-WAHA-EASYPANEL
WHATSAPP_ALLOWED_RECIPIENTS=
```

Set `WHATSAPP_ENABLED=true` hanya setelah session WAHA berstatus `WORKING` dan allowlist sudah sesuai.

## Data yang Dipertahankan

Compose production memakai named volume stabil:

- `sop-arsip-db-prod-data` untuk MariaDB.
- `sop-arsip-pdf-prod-data` untuk PDF SOP arsip.
- `sop-arsip-waha-session-prod-data` untuk session WAHA.

Jangan menjalankan `docker compose down -v` atau menghapus named volume kecuali memang ingin reset data production.

## Sinkronisasi User Database

MariaDB hanya membaca `MARIADB_USER` dan `MARIADB_PASSWORD` saat volume database pertama kali dibuat. Jika `DB_PASSWORD` diganti di Easypanel setelah volume `sop-arsip-db-prod-data` sudah ada, password user lama di database tidak otomatis berubah dan Prisma akan gagal dengan `P1000 Authentication failed`.

Compose production menyediakan service sekali jalan `db-user-sync` untuk mencegah kondisi itu. Saat deploy, service ini:

- menunggu MariaDB healthy;
- login sebagai root memakai `DB_ROOT_PASSWORD`;
- memastikan database `DB_NAME` ada;
- membuat atau mengubah password user `DB_USER`;
- memberi grant ke database `DB_NAME`;
- baru setelah itu backend menjalankan migrasi Prisma.

Jika `db-user-sync` gagal, cek lebih dulu `DB_ROOT_PASSWORD`. Nilai root harus sama dengan root password yang dipakai ketika volume MariaDB production pertama kali dibuat. Mengubah `DB_ROOT_PASSWORD` di env tidak otomatis mengubah root password yang sudah tersimpan di volume lama.

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
WAHA_BASE_URL=http://waha:3000
WAHA_IMAGE=devlikeapro/waha:latest-2026.4.3
WAHA_API_KEY=...
WAHA_SESSION=sop-staging
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=...
WAHA_PUBLIC_URL=https://URL-WAHA-EASYPANEL
WHATSAPP_ALLOWED_RECIPIENTS=
PDF_SIGNING_ENABLED=true
PDF_SIGNING_P12_PASSPHRASE=...
PDF_SIGNING_P12_BASE64=...
```

## Alur Deploy

1. Push kode ke branch yang dipakai Easypanel.
2. Easypanel mengambil repository GitHub.
3. Easypanel menjalankan compose dari `docker-compose.prod.yml`.
4. Easypanel mengarahkan domain aplikasi ke service `frontend` port `80`.
5. Easypanel mengarahkan domain WAHA ke service `waha` port `3000` untuk pairing QR.
6. Backend menjalankan migrasi Prisma, seed, lalu `pnpm start:prod`.

GitHub Actions tetap berguna sebagai quality gate, tetapi bukan mekanisme deploy production.
