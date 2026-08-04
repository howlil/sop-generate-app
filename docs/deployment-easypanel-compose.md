# Deployment Easypanel dengan Docker Compose

Easypanel adalah satu-satunya tempat hosting production. GitHub Actions tidak lagi menjalankan deploy ke VPS atau `docker compose up`; workflow GitHub hanya menjalankan CI. Deployment production dilakukan oleh Easypanel dari repository GitHub menggunakan `docker-compose.prod.yml` sebagai compose base.

## Strategi Port

Jangan publish port host dari compose production. Easypanel sudah memiliki reverse proxy pada host untuk port 80/443, sehingga binding seperti `80:80` atau `3000:3000` dapat bentrok dengan service lain.

Compose production memakai `expose`:

- `frontend` expose port internal `80`.
- `backend` expose port internal `3000`.
- `db` hanya berada di network internal compose.

Domain aplikasi diarahkan di Easypanel ke service `frontend` port `80`. Browser tetap memakai satu origin; request `/api/` diproxy oleh Nginx frontend ke `backend:3000`.

## WAHA Hosted Eksternal

WAHA tidak menjadi bagian dari compose aplikasi. Instance, session, dashboard, update image, dan storage WAHA dikelola terpisah di `https://waha.howlil.my.id`. Backend mengakses API WAHA melalui HTTPS; frontend/browser tidak pernah menerima base URL atau API key WAHA.

Backend tidak memiliki `depends_on` ke WAHA. Gangguan jaringan atau downtime WAHA tidak menggagalkan startup, healthcheck, atau transaksi workflow aplikasi. Reminder yang belum terkirim tetap berada pada tabel antrean aktif `PengingatWhatsApp` dan dicoba kembali oleh worker.

Environment backend:

```env
WHATSAPP_ENABLED=false
WAHA_BASE_URL=https://waha.howlil.my.id
WAHA_API_KEY=ISI_API_KEY_WAHA
WAHA_SESSION=sop-staging
WHATSAPP_ALLOWED_RECIPIENTS=
```

Set `WHATSAPP_ENABLED=true` hanya setelah session WAHA berstatus `WORKING` dan allowlist sudah sesuai.

## Data yang Dipertahankan

Compose production memakai named volume stabil:

- `sop-arsip-db-prod-data` untuk MariaDB.
- `sop-arsip-pdf-prod-data` untuk PDF SOP arsip.

Session dan data WAHA bukan bagian dari volume aplikasi. Jangan menjalankan `docker compose down -v` atau menghapus named volume aplikasi kecuali memang ingin reset data production/PDF.

## Kredensial Database

MariaDB hanya membaca `MARIADB_USER` dan `MARIADB_PASSWORD` saat volume database pertama kali dibuat. Jika `DB_PASSWORD` diganti di Easypanel setelah volume `sop-arsip-db-prod-data` sudah ada, password user lama di database tidak otomatis berubah dan Prisma akan gagal dengan `P1000 Authentication failed`.

Production memakai image resmi `mariadb:11.4` langsung tanpa custom build atau script sinkronisasi setiap startup. Karena itu, pertahankan `DB_NAME`, `DB_USER`, `DB_PASSWORD`, dan `DB_ROOT_PASSWORD` yang sesuai dengan volume production yang sudah ada.

Jika rotasi password memang diperlukan, lakukan `ALTER USER` sebagai operasi maintenance terencana sebelum mengganti environment. Jangan menghapus volume untuk menyamakan password karena tindakan tersebut menghapus data production.

Migrasi Prisma menyusun URL koneksi langsung dari `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, dan `DATABASE_NAME`. Tidak ada script atau container sinkronisasi tambahan saat startup.

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
WAHA_BASE_URL=https://waha.howlil.my.id
WAHA_API_KEY=...
WAHA_SESSION=sop-staging
WHATSAPP_ALLOWED_RECIPIENTS=
RUN_DB_SEED_ON_START=false
PDF_SIGNING_ENABLED=true
PDF_SIGNING_P12_PASSPHRASE=...
PDF_SIGNING_P12_BASE64=...
```

Compose tidak memakai `env_file` untuk memasukkan seluruh environment ke semua container. Setiap service hanya menerima variabel yang dibutuhkan: root database tidak tersedia di backend, JWT/PDF/WAHA tidak tersedia di database, dan konfigurasi WAHA hanya tersedia di backend.

## Alur Deploy

1. Push kode ke branch yang dipakai Easypanel.
2. Easypanel mengambil repository GitHub.
3. Easypanel menjalankan compose dari `docker-compose.prod.yml`.
4. Easypanel mengarahkan domain aplikasi ke service `frontend` port `80`.
5. MariaDB menjadi healthy dengan kredensial user aplikasi yang tersimpan pada volume production.
6. Backend menjalankan migrasi Prisma lalu `pnpm start:prod` tanpa menunggu WAHA.
7. Backend menghubungi `https://waha.howlil.my.id` hanya ketika worker reminder aktif dan mempunyai pekerjaan jatuh tempo.
8. Seed hanya dijalankan jika `RUN_DB_SEED_ON_START=true`; gunakan ini untuk instalasi demo awal, bukan pada setiap restart production.

GitHub Actions tetap berguna sebagai quality gate, tetapi bukan mekanisme deploy production.
