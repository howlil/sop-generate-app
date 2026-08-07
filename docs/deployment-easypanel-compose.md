# Deployment Easypanel dengan Docker Compose

Easypanel adalah satu-satunya tempat hosting production. GitHub Actions tidak lagi menjalankan deploy ke VPS atau `docker compose up`; workflow GitHub hanya menjalankan CI. Deployment production dilakukan oleh Easypanel dari repository GitHub menggunakan `docker-compose.prod.yml` sebagai compose base.

## Strategi Port

Jangan publish port host dari compose production. Easypanel sudah memiliki reverse proxy pada host untuk port 80/443, sehingga binding seperti `80:80` atau `3000:3000` dapat bentrok dengan service lain.

Compose production memakai `expose`:

- `frontend` expose port internal `3000` sebagai satu-satunya tujuan domain Easypanel.
- `backend` expose port internal `3001` hanya pada network Compose.
- `db` hanya berada di network internal compose.

Cloudflare Tunnel menuju gateway Easypanel pada host `localhost:80`. Domain aplikasi di Easypanel harus memilih Compose service `frontend`, protocol `HTTP`, dan port internal `3000`. Browser tetap memakai satu origin; request `/api/` diproxy oleh Nginx frontend ke `backend:3001`.

Setelah target Compose service pada domain ditambah atau diubah, deploy ulang service Compose agar override Easypanel menghubungkan container frontend ke network proxy `easypanel`. Tanpa pilihan `frontend` tersebut, domain dapat menghasilkan `502 Bad Gateway` walaupun seluruh healthcheck container lulus.

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

Production tetap memakai image resmi `mariadb:11.4` tanpa custom build dan hanya menjalankan tiga service: `db`, `backend`, dan `frontend`. Untuk volume lama, container `db` memberikan MariaDB sebuah init file lokal yang menyelaraskan password serta grant user aplikasi sebelum database dinyatakan healthy. Mekanisme ini tidak membuka login `root` melalui network dan tidak menambah service sementara.

Jangan menghapus volume untuk menyamakan password karena tindakan tersebut menghapus data production. Migrasi Prisma tetap memakai user aplikasi melalui `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, dan `DATABASE_NAME`.

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
4. Cloudflare masuk melalui gateway Easypanel port `80`, lalu Easypanel meneruskan domain ke frontend port internal `3000`.
5. Pada volume lama, MariaDB menyelaraskan user aplikasi secara internal sebelum healthcheck dapat lulus. Pada volume baru, entrypoint resmi melakukan inisialisasi normal dari environment.
6. Backend menunggu MariaDB healthy, menjalankan migrasi Prisma, lalu `pnpm start:prod` tanpa menunggu WAHA.
7. Backend menghubungi `https://waha.howlil.my.id` hanya ketika worker reminder aktif dan mempunyai pekerjaan jatuh tempo.
8. Seed hanya dijalankan jika `RUN_DB_SEED_ON_START=true`; gunakan ini untuk instalasi demo awal, bukan pada setiap restart production.

GitHub Actions tetap berguna sebagai quality gate, tetapi bukan mekanisme deploy production.
