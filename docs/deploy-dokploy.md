# Panduan Deploy ke Dokploy

Proyek ini telah dikonfigurasi untuk di-*deploy* menggunakan **Dokploy** yang menggantikan setup Komodo sebelumnya.

Alur CI/CD (*Continuous Integration & Deployment*):
1. **Push** ke branch `final` atau `main` (tergantung konfigurasi `.github/workflows/cd.yml`).
2. **GitHub Actions** akan menjalankan `integration-test`.
3. Jika tes lulus, GitHub Actions akan memanggil **Dokploy Webhook**.
4. **Dokploy** akan mem-*build* ulang container (Frontend, Backend) dan me-*restart* *service* secara otomatis.

---

## Prasyarat
- Server VPS dengan Dokploy yang sudah ter-install.
- Repositori GitHub/GitLab.

---

## 1. Konfigurasi Awal di Dokploy

1. **Masuk ke Dashboard Dokploy**
2. Klik **Create Project** lalu buat project baru (misal: `sop-app-project`).
3. Masuk ke project tersebut, lalu klik tab **Compose**.
4. Klik **Create Compose Application**.
5. Isi konfigurasi sebagai berikut:
   - **Name**: `sop-app` (atau bebas)
   - **Provider**: **Github** (Pilih repositori proyek ini dan tentukan branch, misalnya `main` atau `final`)
   - **Compose File Path**: `docker-compose.prod.yml`
6. **Simpan** konfigurasi.

---

## 2. Setup Environment Variables

Dokploy menulis variabel ke file `.env` saat deploy. Backend membutuhkan koneksi database dan JWT.

1. Buka tab **Environment** pada compose `sop-app`.
2. Salin isi `.env.example` dari repo, ganti semua nilai `GANTI_*`.
3. **Save**, lalu redeploy.

Contoh minimal (ganti password/secret):

```env
DB_ROOT_PASSWORD=password-root-kuat
DB_NAME=sop_biro_organisasi
DB_USER=sop_app
DB_PASSWORD=password-app-kuat

JWT_SECRET=secret-jwt-minimal-32-karakter-panjang
JWT_REFRESH_SECRET=secret-refresh-bedaa-min-32-karakter

PDF_SIGNING_ENABLED=true
PDF_SIGNING_P12_PASSPHRASE=passphrase-sertifikat
PDF_SIGNING_P12_BASE64=...
```

`DATABASE_HOST`, `DATABASE_URL`, dan `NODE_ENV=production` di-set otomatis di `docker-compose.prod.yml` — tidak perlu diisi manual.

**Catatan:** jika `DB_PASSWORD` mengandung karakter khusus (`@`, `#`, `%`, dll.), hindari simbol tersebut atau encode URL di `DATABASE_URL` (hubungi tim jika perlu).
w
---

## 3. Menghubungkan Dokploy dengan GitHub Actions (Webhook)

Agar Dokploy *hanya* men-*deploy* ketika tes CI kita lulus, kita harus mengatur **Webhook**.

1. Di halaman *Compose* aplikasi kamu di Dokploy, pilih tab **Deployments** atau **Settings**.
2. Cari bagian **Webhook URL** atau **Deployment Webhook**.
3. **Copy / Salin** URL webhook tersebut.
4. (Penting) **Matikan fitur Auto Deploy** di Dokploy jika kamu ingin *deploy* hanya di-trigger lewat keberhasilan GitHub Actions.
5. Buka repositori GitHub proyek ini.
6. Pergi ke **Settings** > **Secrets and variables** > **Actions**.
7. Buat *Repository secret* baru:
   - **Name**: `DOKPLOY_WEBHOOK_URL`
   - **Secret**: *(Paste URL yang kamu dapatkan di Langkah 3)*
8. Klik **Add secret**.

---

## 4. Cara Penggunaan (Deploy)

Setelah semuanya diatur, proses *deploy* sepenuhnya otomatis.
1. Setiap kali kamu melakukan `git push` (atau *merge Pull Request*) ke branch yang telah dikonfigurasi (contoh: `final` atau `main`).
2. GitHub Actions (`.github/workflows/cd.yml`) akan menjalankan tes.
3. Setelah sukses, Dokploy akan menerima sinyal webhook untuk melakukan proses *pull*, *build*, dan menjalankan ulang container (seperti `db`, `backend`, `frontend`).

### Mengakses Aplikasi
Sesuai `docker-compose.prod.yml`:
- **Frontend**: `http://[IP-VPS]:8080` — UI aplikasi; request `/api/*` di-proxy ke backend internal.
- **Backend**: tidak di-expose ke host (port `3000` sudah dipakai Dokploy). Akses API lewat frontend (`/api/...`) atau tambahkan **Domain** di Dokploy yang mengarah ke service `frontend` port `80`.

Kamu dapat menambahkan Domain dan SSL gratis melalui menu **Domains** di Dashboard Dokploy (service: `frontend`, container port: `80`).
