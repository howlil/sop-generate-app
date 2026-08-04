# Reminder WhatsApp dengan WAHA

Fitur ini mengirim notifikasi otomatis berdasarkan status pengajuan melalui WAHA yang berjalan di compose production pada Easypanel. Tidak ada broadcast manual, tombol kirim pesan uji, tautan ke aplikasi, atau halaman riwayat pesan.

## Aturan penerima

| Status pengajuan              | Pesan                      | Penerima                                      |
| ----------------------------- | -------------------------- | --------------------------------------------- |
| `SEDANG_DIEVALUASI`           | Pengingat evaluasi SOP     | Semua pengguna aktif dengan peran `EVALUATOR` |
| `SELESAI_DIEVALUASI`          | Pengingat TTD berita acara | Satu `PJ_EVALUATOR` aktif                     |
| `DITANDATANGANI_PJ_EVALUATOR` | Pengingat TTD berita acara | Satu `PJ_PENYUSUN` aktif pada OPD pengajuan   |
| `DITANDATANGANI_PJ_PENYUSUN`  | Pengingat TTD SOP          | Satu `KEPALA_OPD` aktif pada OPD pengajuan    |

Jika penerima tunggal tidak ada atau berjumlah lebih dari satu, sistem tidak mengirim dan mencatat kesalahan konfigurasi tanpa menggagalkan alur pengajuan. Pesan dikirim ulang setiap `WHATSAPP_REMINDER_INTERVAL_MINUTES` selama status belum berubah. Tidak ada batas maksimum pengiriman.

## Kontrak WAHA

- Pemeriksaan kesiapan: `GET /api/sessions/{WAHA_SESSION}`; pengiriman hanya dilanjutkan jika `status=WORKING`.
- Pengiriman teks: `POST /api/sendText` dengan JSON `chatId`, `text`, dan `session`.
- Header `X-Api-Key` berisi `WAHA_API_KEY`.
- Nomor tujuan dikirim sebagai `628...@c.us`.
- Backend memakai URL internal `http://waha:3000` ketika WAHA berada di compose production yang sama.

## Penyimpanan dan keamanan

Tabel `PengingatWhatsApp` adalah state antrean aktif, bukan riwayat pesan. Satu baris unik mewakili pasangan pengajuan, penerima, dan jenis pengingat. Baris dihapus ketika status, peran, keaktifan, OPD, nomor telepon, atau filter staging tidak lagi sesuai. Kolom `lastSentAt`, `nextSendAt`, lock lease, dan jumlah kegagalan hanya dipakai untuk penjadwalan, retry, dan mencegah dua instance mengirim baris yang sama secara bersamaan.

Nomor pengguna berasal dari kolom `Pengguna.nohp`. API menerima format `08...` atau `628...`, lalu selalu menyimpannya sebagai `628...`. Constraint database menolak format lain. Migrasi menormalisasi data lama sebelum constraint dipasang.

API key WAHA hanya boleh disimpan pada environment backend. Jangan meletakkannya di frontend, source control, log, atau dokumentasi. `WHATSAPP_ALLOWED_RECIPIENTS` bersifat opsional: kosong berarti seluruh nomor valid yang sesuai role/status di database; isi daftar nomor hanya ketika staging perlu dibatasi.

## Konfigurasi

1. Pastikan service `waha` di Easypanel sudah berjalan. Arahkan domain WAHA ke service `waha` port internal `3000` untuk membuka dashboard dan pairing QR.
2. Salin `.env.example` menjadi `.env` dan isi konfigurasi WAHA:

   ```dotenv
   WHATSAPP_ENABLED=false
   WAHA_BASE_URL=http://waha:3000
   WAHA_IMAGE=devlikeapro/waha:latest-2026.4.3
   WAHA_API_KEY=ISI_API_KEY_WAHA
   WAHA_SESSION=sop-staging
   WAHA_DASHBOARD_USERNAME=admin
   WAHA_DASHBOARD_PASSWORD=ISI_PASSWORD_DASHBOARD_WAHA
   WAHA_PUBLIC_URL=https://URL-WAHA-EASYPANEL
   # Kosong: gunakan seluruh nomor valid dari database.
   WHATSAPP_ALLOWED_RECIPIENTS=
   ```

3. Deploy stack dan pastikan konfigurasi lain valid:

   ```powershell
   docker compose -f docker-compose.prod.yml up -d --build
   ```

4. Buka dashboard WAHA, buat atau aktifkan session sesuai `WAHA_SESSION`, lalu scan QR sampai session `WORKING`.
5. Setelah session WAHA `WORKING`, ubah `WHATSAPP_ENABLED=true` dan deploy ulang backend/stack.

## Uji ke WhatsApp asli

Pastikan pengguna terkait memiliki `nohp` valid di database. Untuk demonstrasi cepat, gunakan interval satu menit. Jika tidak ingin menghubungi seluruh pengguna pada staging, isi `WHATSAPP_ALLOWED_RECIPIENTS` dengan nomor penguji saja.

1. Ubah pengajuan ke salah satu status pada matriks penerima.
2. Tunggu paling lama satu siklus rekonsiliasi ditambah waktu respons WAHA.
3. Pastikan pesan diterima oleh nomor yang tepat dan tidak memuat tautan.
4. Biarkan status tetap sama dan pastikan pesan berikutnya datang setelah interval reminder.
5. Ubah status pengajuan. Pastikan jenis reminder lama berhenti; jika status baru juga actionable, reminder penerima tahap baru dibuat.
6. Nonaktifkan salah satu evaluator atau ubah nomornya, lalu pastikan evaluator tersebut tidak menerima pengiriman berikutnya. Jika filter staging dipakai, penghapusan nomor dari allowlist juga harus menghentikan pengiriman.
7. Putuskan session WAHA sementara. Alur bisnis harus tetap berhasil dan reminder dijadwalkan ulang. Setelah session kembali `WORKING`, pengiriman dilanjutkan.

Periksa log backend; nomor tujuan otomatis disamarkan dan token tidak dicatat:

```powershell
docker compose -f docker-compose.prod.yml logs -f backend
```

Untuk log WAHA:

```powershell
docker compose -f docker-compose.prod.yml logs -f waha
```

Setelah demonstrasi selesai, set `WHATSAPP_ENABLED=false` dan buat ulang backend.

## Pengujian otomatis

Matriks pengujian lengkap tersedia di [E2E workflow reminder WhatsApp](./whatsapp-reminder-e2e.md).

```powershell
cd server
pnpm test:core-unit
pnpm test:integration:docker:whatsapp
pnpm test:e2e:docker:whatsapp
pnpm build
```

Unit test provider mencakup payload dan header WAHA, status session, timeout ambigu, rate limit, respons rusak, dan kegagalan jaringan. Integration test memakai MariaDB Docker serta HTTP stub lokal dan tidak mengirim ke WhatsApp asli.
