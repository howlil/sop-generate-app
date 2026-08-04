# Reminder WhatsApp dengan WAHA

Fitur ini mengirim notifikasi otomatis berdasarkan status pengajuan melalui instance WAHA eksternal di `https://waha.howlil.my.id`. WAHA memiliki deployment, session, dashboard, dan penyimpanan sendiri; aplikasi SOP hanya menjadi HTTP client. Tidak ada broadcast manual, tombol kirim pesan uji, tautan ke aplikasi, atau halaman riwayat pesan.

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
- Backend mengakses `WAHA_BASE_URL` melalui HTTPS. Compose aplikasi tidak membuat, me-restart, atau menunggu service WAHA.

## Penyimpanan dan keamanan

Tabel `PengingatWhatsApp` adalah state antrean aktif, bukan riwayat pesan. Satu baris unik mewakili pasangan pengajuan, penerima, dan jenis pengingat. Baris dihapus ketika status, peran, keaktifan, OPD, nomor telepon, atau filter staging tidak lagi sesuai. Kolom `lastSentAt`, `nextSendAt`, lock lease, dan jumlah kegagalan hanya dipakai untuk penjadwalan, retry, dan mencegah dua instance mengirim baris yang sama secara bersamaan.

Nomor pengguna berasal dari kolom `Pengguna.nohp`. API menerima format `08...` atau `628...`, lalu selalu menyimpannya sebagai `628...`. Constraint database menolak format lain. Migrasi menormalisasi data lama sebelum constraint dipasang.

API key WAHA hanya boleh disimpan pada environment backend. Jangan meletakkannya di frontend, source control, database, log, atau dokumentasi. Frontend tetap berkomunikasi hanya dengan API aplikasi dan tidak memiliki koneksi langsung ke WAHA. `WHATSAPP_ALLOWED_RECIPIENTS` bersifat opsional: kosong berarti seluruh nomor valid yang sesuai role/status di database; isi daftar nomor hanya ketika staging perlu dibatasi.

## Konfigurasi

1. Buka dashboard WAHA hosted di `https://waha.howlil.my.id`, lalu pastikan session yang akan dipakai sudah tersedia dan berstatus `WORKING`.
2. Isi environment backend/Compose aplikasi dengan kredensial milik WAHA hosted:

   ```dotenv
   WHATSAPP_ENABLED=false
   WAHA_BASE_URL=https://waha.howlil.my.id
   WAHA_API_KEY=ISI_API_KEY_WAHA
   WAHA_SESSION=sop-staging
   # Kosong: gunakan seluruh nomor valid dari database.
   WHATSAPP_ALLOWED_RECIPIENTS=
   ```

3. Jalankan **Deploy** pada service Compose aplikasi dan tunggu service `db`, `backend`, serta `frontend` healthy. Ketersediaan WAHA tidak memengaruhi health atau startup aplikasi.

4. Pastikan nilai `WAHA_SESSION` persis sama dengan nama session hosted, termasuk huruf besar/kecil.
5. Setelah API key dan session tervalidasi, ubah `WHATSAPP_ENABLED=true` dan deploy ulang backend.

Jika WAHA tidak dapat dihubungi, API key salah, atau session belum `WORKING`, alur pengajuan tetap berjalan. State antrean tetap berada di database aplikasi dan worker menjadwalkan retry; aplikasi tidak mencoba mengelola lifecycle WAHA.

## Uji ke WhatsApp asli

Pastikan pengguna terkait memiliki `nohp` valid di database. Untuk demonstrasi cepat, gunakan interval satu menit. Jika tidak ingin menghubungi seluruh pengguna pada staging, isi `WHATSAPP_ALLOWED_RECIPIENTS` dengan nomor penguji saja.

1. Ubah pengajuan ke salah satu status pada matriks penerima.
2. Tunggu paling lama satu siklus rekonsiliasi ditambah waktu respons WAHA.
3. Pastikan pesan diterima oleh nomor yang tepat dan tidak memuat tautan.
4. Biarkan status tetap sama dan pastikan pesan berikutnya datang setelah interval reminder.
5. Ubah status pengajuan. Pastikan jenis reminder lama berhenti; jika status baru juga actionable, reminder penerima tahap baru dibuat.
6. Nonaktifkan salah satu evaluator atau ubah nomornya, lalu pastikan evaluator tersebut tidak menerima pengiriman berikutnya. Jika filter staging dipakai, penghapusan nomor dari allowlist juga harus menghentikan pengiriman.
7. Putuskan session WAHA sementara. Alur bisnis harus tetap berhasil dan reminder dijadwalkan ulang. Setelah session kembali `WORKING`, pengiriman dilanjutkan.

Periksa log container `backend` dari halaman Compose aplikasi serta log WAHA dari platform hosting WAHA yang terpisah. Nomor tujuan pada log backend otomatis disamarkan dan API key tidak dicatat.

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
