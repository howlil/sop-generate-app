# Deployment VPS dengan GitHub Actions dan Docker Compose

Target deploy ini sengaja tidak memakai PaaS. GitHub Actions menjalankan job deploy di self-hosted runner pada VPS atau mesin yang satu jaringan dengan VPS, lalu menjalankan `docker compose` secara lokal.

IP `10.44.8.17` adalah IP private. GitHub-hosted runner dari internet tidak bisa diandalkan untuk SSH ke IP private itu. Karena itu deploy production memakai `runs-on: self-hosted`.

## Data yang Dipertahankan

Compose production memakai named volume stabil:

- `sop-arsip-db-prod-data` untuk MariaDB.
- `sop-arsip-pdf-prod-data` untuk PDF SOP arsip.

Deploy tidak menjalankan `docker compose down -v` dan tidak menjalankan `docker volume prune`, jadi database dan file PDF arsip tidak ikut terhapus ketika image/container aplikasi diganti.

## Secret GitHub Actions

Tambahkan secrets di repository GitHub:

- `VPS_SUDO_PASSWORD`: isi jika user deploy harus memakai `sudo` untuk Docker atau folder `/opt/sop-app`.
- `ENV_PRODUCTION`: isi lengkap file `.env` production.

Jika `docker compose ps` bisa jalan tanpa `sudo` di VPS, `VPS_SUDO_PASSWORD` tidak wajib. Jika Docker hanya bisa jalan dengan `sudo docker ...`, isi secret `VPS_SUDO_PASSWORD`.
Jangan commit password atau env production ke repo.

## ENV_PRODUCTION Minimal

Isi `ENV_PRODUCTION` mengikuti `.env.example`, misalnya:

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
PUBLIC_APP_ORIGIN=http://10.44.8.17
ALLOWED_ORIGINS=http://10.44.8.17
SOP_PDF_STORAGE_DIR=/app/storage/sop-pdf
PDF_SIGNING_ENABLED=true
PDF_SIGNING_P12_PASSPHRASE=...
PDF_SIGNING_P12_BASE64=...
```

GitHub Actions akan menambahkan `APP_VERSION=<commit-sha>` saat deploy.

## Persiapan VPS Satu Kali

Install GitHub Actions self-hosted runner pada VPS atau mesin yang satu jaringan dengan VPS. Di GitHub repo:

`Settings` -> `Actions` -> `Runners` -> `New self-hosted runner`

Ikuti command yang diberikan GitHub untuk Linux x64. Jalankan runner sebagai service supaya deploy otomatis:

```sh
sudo ./svc.sh install
sudo ./svc.sh start
```

Pastikan runner punya label `self-hosted`, `Linux`, dan `X64`, karena workflow production memakai:

```yaml
runs-on: [self-hosted, Linux, X64]
```

Di VPS, pastikan Docker dan Compose plugin tersedia:

```sh
docker --version
docker compose version
```

Jika belum ada, install Docker. Mode terbaik adalah membuat user deploy bisa menjalankan Docker tanpa sudo:

```sh
sudo usermod -aG docker howlil
sudo mkdir -p /opt/sop-app
sudo chown -R howlil:howlil /opt/sop-app
```

Logout/login ulang setelah `usermod`, atau restart session SSH.

Jika user belum bisa menjalankan Docker tanpa sudo, workflow tetap bisa jalan dengan secret `VPS_SUDO_PASSWORD`. Secret itu dipakai untuk:

- Membuat dan mengambil ownership `/opt/sop-app`.
- Menjalankan `docker compose`.
- Menjalankan `docker image prune -af`.

User VPS tetap harus punya izin sudo. Jika user benar-benar tidak ada di sudoers, GitHub Actions tidak bisa menjalankan Docker atau menulis ke `/opt/sop-app`; minta admin VPS memberi akses sudo atau pindahkan deploy ke user yang punya akses.

## Alur Deploy

Setiap push ke branch `final`:

1. GitHub Actions build image production dan menjalankan integration test.
2. Source commit dikemas dengan `git archive`.
3. Bundle diekstrak ke `/opt/sop-app/releases/<sha>` oleh self-hosted runner.
4. `.env` dari `ENV_PRODUCTION` ditulis ke `/opt/sop-app/shared/.env`.
5. `/opt/sop-app/current` diarahkan ke release terbaru.
6. Runner menjalankan:

```sh
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml build backend frontend
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker image prune -af
```

Jika Docker butuh sudo, workflow otomatis menjalankan command Docker lewat `sudo -S` memakai secret `VPS_SUDO_PASSWORD`.

`docker image prune -af` hanya menghapus image yang tidak dipakai container aktif. Named volume database dan PDF tidak dihapus.

## Rollback Manual

Di VPS:

```sh
cd /opt/sop-app/releases
ls -lt
ln -sfn /opt/sop-app/releases/<sha-lama> /opt/sop-app/current
ln -sfn /opt/sop-app/shared/.env /opt/sop-app/current/.env
cd /opt/sop-app/current
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```
