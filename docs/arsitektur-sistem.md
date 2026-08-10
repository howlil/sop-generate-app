# Arsitektur Sistem SOPFlow

Dokumen ini menggambarkan arsitektur implementasi yang sesuai dengan codebase dan deployment Docker saat ini.

## Gambaran umum

SOPFlow adalah aplikasi berbasis web dengan tiga service utama:

```text
Browser
  |
  | HTTPS / public ingress
  v
Reverse proxy / platform ingress
  |
  v
Frontend Nginx :8080
  |
  | /api -> Backend
  v
NestJS Backend :3001
  |
  v
MariaDB :3306

Backend
  |
  +--> persistent PDF storage /app/storage/sop-pdf
  |      (Docker volume: sop_pdf_data)
  |
  +--> WhaAPI (opsional, outbound)
```

Port di atas adalah port internal container/service. Pengguna publik tidak perlu membuka port 8080 atau 3001 secara langsung; public ingress/reverse proxy menangani HTTP/HTTPS dan meneruskan traffic ke service frontend.

## Frontend

Frontend menggunakan React + Vite dan disajikan oleh Nginx pada production image.

- internal production port: `8080`;
- Nginx berjalan sebagai user non-root;
- frontend tidak membutuhkan Linux capability `NET_BIND_SERVICE` karena tidak lagi bind ke port privileged 80;
- request API diteruskan ke backend sesuai konfigurasi Nginx/aplikasi;
- browser berinteraksi dengan aplikasi melalui hostname publik yang ditangani reverse proxy/platform deployment.

## Backend

Backend menggunakan NestJS/TypeScript dan berjalan pada port internal `3001` pada Compose production.

Tanggung jawab utama backend:

- autentikasi dan otorisasi;
- pengelolaan OPD/pengguna;
- penyusunan dan versioning SOP;
- pengajuan, verifikasi, evaluasi dan revisi;
- berita acara dan workflow TTE;
- pengesahan Kepala OPD;
- arsip dan verifikasi dokumen;
- notification reminder in-app dan WhatsApp opsional;
- akses persistence melalui Prisma.

Backend menjalankan Prisma migration sebelum start production melalui `pnpm prisma migrate deploy` pada Compose.

## Database

Database menggunakan MariaDB 11.4 pada Compose, port internal `3306`.

Volume `db_data` menyimpan data database secara persisten. Database tidak perlu dipublikasikan ke internet pada deployment normal.

Prisma menjadi lapisan akses database aplikasi. Constraint/invariant yang ada pada migration harus dianggap bagian dari kontrak persistence production.

## PDF dan TTE storage

PDF hasil proses signing tidak disimpan di MinIO/S3 pada implementasi sekarang. Backend menggunakan filesystem persistent:

```text
/app/storage/sop-pdf
```

Compose memasang Docker volume:

```text
sop_pdf_data -> /app/storage/sop-pdf
```

Database menyimpan data domain, credential/metadata TTE yang diperlukan, serta informasi untuk menghubungkan signature dengan workflow. Artefak PDF tetap berada pada persistent storage backend.

Detail TTE dijelaskan pada:

- `docs/detail_workflow_dan_teknis_tte.md`
- `docs/tanda_tangan_elektronik_dan_ca.md`

## Notifikasi

### In-app

Reminder in-app dijalankan oleh scheduler backend dan tidak memerlukan provider eksternal.

### WhatsApp

Provider aktif adalah `WhaApiProvider`. Tidak ada lagi feature flag `WHATSAPP_ENABLED`.

- `WHAAPI_TOKEN` kosong + `WHAAPI_CHANNEL_ID` kosong: WhatsApp nonaktif.
- keduanya terisi: WhatsApp aktif.
- hanya salah satu terisi: konfigurasi dianggap invalid dan backend menolak startup.

Base URL dan parameter tuning lain mempunyai default aplikasi/Compose dan dapat dioverride bila memang diperlukan.

Suite integration Evolution API lama telah dihapus karena tidak sesuai dengan source module notifikasi aktif.

## Deployment Docker Compose

Service pada `compose.yml`:

### `db`

- image: MariaDB 11.4;
- volume: `db_data`;
- healthcheck database;
- hanya dibutuhkan oleh backend.

### `backend`

- build dari `server/Dockerfile`;
- internal port/expose `3001`;
- menunggu database healthy;
- menjalankan Prisma migration lalu NestJS;
- volume `sop_pdf_data` untuk artefak PDF;
- `cap_drop: ALL` dan `no-new-privileges`.

### `frontend`

- build dari `client/Dockerfile`;
- Nginx internal `8080`;
- menunggu backend healthy;
- `cap_drop: ALL`;
- tidak membutuhkan `cap_add`.

## Reverse proxy dan MyPaas

Pada deployment melalui platform seperti MyPaas, reverse proxy/public ingress menerima request publik pada HTTP/HTTPS dan mengarahkan hostname aplikasi ke internal frontend port `8080`.

Dengan demikian:

- port publik tetap mengikuti ingress/reverse proxy (umumnya 80/443);
- target aplikasi frontend di dalam deployment adalah `8080`;
- backend `3001` dan database `3306` tidak perlu diekspos sebagai public application port.

## Security boundary

Secret berikut tidak boleh di-hardcode atau dicommit:

- password database;
- JWT secret dan refresh secret;
- `TTE_ENCRYPTION_SECRET`;
- WhaAPI token/channel bila WhatsApp digunakan.

Auth menggunakan cookie/JWT sesuai implementasi backend. CORS production harus menggunakan origin eksplisit karena request authenticated memakai credentials.

Private key TTE berada di dalam P12 personal pengguna pada model internal SOPFlow. Untuk production pemerintah yang membutuhkan sertifikat resmi, rekomendasi arsitekturnya adalah integrasi PSrE/BSrE sehingga custody private key tidak berada di aplikasi ini.

## CI dan testing

CI utama memeriksa server dan client melalui typecheck, lint, unit test, build, serta critical Playwright journeys. Dokumentasi integration test aktual ada pada `docs/integration-test.md`.

Dokumen laporan test yang memuat jumlah test/coverage adalah snapshot historis pada commit/run tertentu. Status branch terkini harus dilihat dari CI commit tersebut.

## Komponen yang tidak merupakan arsitektur aktif

Dokumentasi lama pernah menyebut beberapa komponen berikut, tetapi komponen tersebut bukan bagian dari runtime SOPFlow saat ini:

- PostgreSQL;
- S3/MinIO;
- Evolution API notification module;
- HSM/KMS production;
- OCSP/TSA eksternal;
- PSrE/BSrE integration.

Komponen production-grade TTE tersebut dapat menjadi pengembangan lanjutan dan tidak boleh digambarkan sebagai fitur yang sudah diimplementasikan.
