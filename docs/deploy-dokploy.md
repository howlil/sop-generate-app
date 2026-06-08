# Panduan CI/CD ke Dokploy + Cloudflare Tunnel

Target setup:

1. GitHub Actions menjalankan validasi build image produksi dan integration test.
2. Jika push ke branch `final` berhasil, GitHub Actions memanggil webhook deploy Dokploy.
3. Dokploy pull repo, build `docker-compose.prod.yml`, menjalankan migrasi Prisma, lalu menyalakan `db`, `backend`, dan `frontend`.
4. Cloudflare Tunnel mengarah ke Traefik Dokploy, lalu Traefik meneruskan domain ke service `frontend` port `80`.

Referensi utama:

- Dokploy Auto Deploy: https://docs.dokploy.com/docs/core/auto-deploy
- Dokploy Docker Compose: https://docs.dokploy.com/docs/core/docker-compose
- Dokploy Cloudflare Tunnels: https://docs.dokploy.com/docs/core/guides/cloudflare-tunnels

## 1. Setup Compose Application di Dokploy

1. Buat project baru di Dokploy, misalnya `sop-app-project`.
2. Buat Docker Compose application.
3. Pilih provider GitHub dan repo ini.
4. Set branch deploy ke `final` agar sama dengan `.github/workflows/cd.yml`.
5. Set Compose File Path ke `docker-compose.prod.yml`.
6. Simpan.

Catatan: branch di Dokploy dan branch di GitHub Actions harus sama. Jika berbeda, Dokploy bisa menolak deploy dengan status branch tidak cocok.

## 2. Environment Variables

Dokploy menyimpan environment dari UI ke file `.env`. Sesuai dokumentasi Docker Compose Dokploy, variabel dari UI tidak otomatis masuk container kecuali dipakai lewat `env_file` atau `${VAR}`. File `docker-compose.prod.yml` sudah memakai keduanya.

Di tab Environment aplikasi Compose, isi variabel dari `.env.example` dan ganti semua nilai contoh:

```env
DB_ROOT_PASSWORD=password-root-kuat
DB_NAME=sop_biro_organisasi
DB_USER=sop_app
DB_PASSWORD=password-app-kuat

JWT_SECRET=secret-jwt-minimal-32-karakter-panjang
JWT_REFRESH_SECRET=secret-refresh-berbeda-min-32-karakter
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
SWAGGER_ENABLED=false

PUBLIC_APP_ORIGIN=https://sop.example.com
ALLOWED_ORIGINS=https://sop.example.com

PDF_SIGNING_ENABLED=true
PDF_SIGNING_P12_PASSPHRASE=passphrase-sertifikat
PDF_SIGNING_P12_BASE64=...
```

`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_URL`, dan `NODE_ENV=production` diset oleh `docker-compose.prod.yml`; tidak perlu diisi manual di Dokploy.

Jika `DB_PASSWORD` memakai karakter khusus seperti `@`, `#`, `%`, atau `/`, ganti dengan password alfanumerik panjang. `DATABASE_URL` dibentuk otomatis dari `DB_PASSWORD`, jadi karakter URL khusus bisa membuat URL tidak valid.

## 3. Cloudflare Tunnel

Pola yang direkomendasikan dokumentasi Dokploy:

```text
Cloudflare -> Tunnel -> dokploy-traefik:80 -> frontend:80 -> backend:3000
```

Langkah ringkas:

1. Di Cloudflare Zero Trust, buat tunnel baru dan salin `TUNNEL_TOKEN`.
2. Di Dokploy, buat aplikasi Docker provider untuk `cloudflare/cloudflared`.
3. Tambahkan environment `TUNNEL_TOKEN="TOKEN_DARI_CLOUDFLARE"`.
4. Di Advanced Arguments, isi dua argumen: `tunnel` dan `run`.
5. Deploy aplikasi cloudflared.
6. Di Cloudflare Tunnel, buat Published Application Route:
   - Type: `HTTP`
   - URL: `dokploy-traefik:80`
7. Di Dokploy Compose application, buka tab Domains:
   - Domain: domain yang sama dengan route Cloudflare, misalnya `sop.example.com`
   - Service: `frontend`
   - Port: `80`
   - Jangan aktifkan HTTPS/Let's Encrypt di Dokploy untuk domain ini.
8. Di Cloudflare SSL/TLS, gunakan `Full` atau `Full (Strict)`. Jangan gunakan `Flexible` karena bisa menyebabkan redirect loop dengan Traefik.

Untuk wildcard multi-app, arahkan route `*.example.com` ke `dokploy-traefik:80`, lalu buat domain masing-masing app di Dokploy.

## 4. GitHub Actions ke Dokploy

Workflow `.github/workflows/cd.yml` berjalan pada push/PR ke `main` dan `final`. Deploy production hanya berjalan untuk push ke `final`.

Setup secret:

1. Di Dokploy, buka tab Deployments aplikasi Compose dan salin Webhook URL.
2. Jika ingin deploy hanya setelah CI lulus, matikan Auto Deploy bawaan Dokploy.
3. Di GitHub repo, buka Settings -> Secrets and variables -> Actions.
4. Tambahkan repository secret:
   - Name: `DOKPLOY_WEBHOOK_URL`
   - Value: Webhook URL dari Dokploy.

Workflow sekarang memakai `curl --fail-with-body`, jadi job akan gagal jika webhook mengembalikan HTTP error.

## 5. Runtime Production

`docker-compose.prod.yml` menjalankan:

- `db`: MariaDB 11.4 dengan named volume `db-prod-data`.
- `backend`: menunggu database sehat, menjalankan `pnpm prisma migrate deploy`, lalu `pnpm start:prod`.
- `frontend`: menunggu backend sehat, menjalankan TanStack Start SSR di port internal `4173`, Nginx di port `80`, dan proxy `/api/*` ke `backend:3000`.

Endpoint health backend tersedia di:

```text
/api/health
```

Karena Cloudflare Tunnel lewat Traefik Dokploy, `frontend` hanya memakai `expose: 80`, bukan host port `8080`.

## 6. Checklist Saat Deploy Pertama

1. Environment di Dokploy sudah terisi dan tersimpan.
2. Domain di Cloudflare Tunnel dan domain di Dokploy sama.
3. HTTPS/Let's Encrypt di domain Dokploy tidak aktif saat memakai Cloudflare Tunnel.
4. Secret GitHub `DOKPLOY_WEBHOOK_URL` sudah ada.
5. Branch Dokploy sama dengan branch deploy workflow (`final`).
6. Push ke branch `final`.
7. Cek GitHub Actions sampai job `verify` dan `deploy-production` sukses.
8. Cek logs Dokploy untuk migrasi Prisma dan health service.
