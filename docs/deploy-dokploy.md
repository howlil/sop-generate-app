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

Dokploy membutuhkan *environment variables* yang serupa dengan yang ada di lokal kamu.
1. Di halaman konfigurasi *Compose* tadi, pilih tab **Environment**.
2. Salin isi file `.env.example` atau file `.env` produksi kamu.
3. Paste ke kolom yang tersedia di Dokploy dan sesuaikan nilainya (misal: password database, JWT secret, dll).
4. Klik **Save**.

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
Sesuai `docker-compose.prod.yml`, aplikasi di-binding di port:
- **Frontend**: `8080` (Bisa diakses di `http://[IP-VPS]:8080`)
- **Backend**: `3000` (Bisa diakses di `http://[IP-VPS]:3000`)

Kamu dapat menambahkan Domain dan SSL gratis melalui menu **Domains** di Dashboard Dokploy untuk masing-masing port tersebut.
