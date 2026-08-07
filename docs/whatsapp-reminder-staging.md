# Reminder WhatsApp dengan Evolution API

Fitur ini mengirim notifikasi otomatis berdasarkan status pengajuan melalui instance Evolution API eksternal. Evolution API tidak menjadi bagian dari compose aplikasi; instance, QR/pairing, dashboard/manager, update image, dan storage Evolution API dikelola pada server private terpisah. Aplikasi SOP hanya menjadi HTTP client. Tidak ada broadcast manual, tombol kirim pesan uji, tautan ke aplikasi, atau halaman riwayat pesan.

## Aturan penerima

| Status pengajuan              | Pesan                      | Penerima                                      |
| ----------------------------- | -------------------------- | --------------------------------------------- |
| `SEDANG_DIEVALUASI`           | Pengingat evaluasi SOP     | Semua pengguna aktif dengan peran `EVALUATOR` |
| `SELESAI_DIEVALUASI`          | Pengingat TTD berita acara | Satu `PJ_EVALUATOR` aktif                     |
| `DITANDATANGANI_PJ_EVALUATOR` | Pengingat TTD berita acara | Satu `PJ_PENYUSUN` aktif pada OPD pengajuan   |
| `DITANDATANGANI_PJ_PENYUSUN`  | Pengingat TTD SOP          | Satu `KEPALA_OPD` aktif pada OPD pengajuan    |

Jika penerima tunggal tidak ada atau berjumlah lebih dari satu, sistem tidak mengirim dan mencatat kesalahan konfigurasi tanpa menggagalkan alur pengajuan. Pesan dikirim ulang setiap `WHATSAPP_REMINDER_INTERVAL_MINUTES` selama status belum berubah. Tidak ada batas maksimum pengiriman.

## Kontrak Evolution API

- Pemeriksaan kesiapan: `GET /instance/connectionState/{EVOLUTION_API_INSTANCE}`; pengiriman hanya dilanjutkan jika response memuat `instance.state=open`.
- Pengiriman teks: `POST /message/sendText/{EVOLUTION_API_INSTANCE}` dengan JSON `number` dan `text`.
- Header `apikey` berisi `EVOLUTION_API_KEY`.
- Nomor tujuan dikirim sebagai digit internasional tanpa `+`, misalnya `6281234567890`.
- Backend mengakses `EVOLUTION_API_BASE_URL` melalui HTTPS pada production. Jika server private belum punya domain publik, gunakan tunnel/reverse proxy yang memberi URL HTTPS stabil ke backend aplikasi.

## Penyimpanan dan keamanan

Tabel `PengingatWhatsApp` adalah state antrean aktif, bukan riwayat pesan. Satu baris unik mewakili pasangan pengajuan, penerima, dan jenis pengingat. Baris dihapus ketika status, peran, keaktifan, OPD, nomor telepon, atau filter staging tidak lagi sesuai. Kolom `lastSentAt`, `nextSendAt`, lock lease, dan jumlah kegagalan hanya dipakai untuk penjadwalan, retry, dan mencegah dua instance backend mengirim baris yang sama secara bersamaan.

Nomor pengguna berasal dari kolom `Pengguna.nohp`. API menerima format `08...` atau `628...`, lalu selalu menyimpannya sebagai `628...`. Constraint database menolak format lain. Migrasi menormalisasi data lama sebelum constraint dipasang.

API key Evolution API hanya boleh disimpan pada environment backend. Jangan meletakkannya di frontend, source control, database, log, atau dokumentasi. Frontend tetap berkomunikasi hanya dengan API aplikasi dan tidak memiliki koneksi langsung ke Evolution API. `WHATSAPP_ALLOWED_RECIPIENTS` bersifat opsional: kosong berarti seluruh nomor valid yang sesuai role/status di database; isi daftar nomor hanya ketika staging perlu dibatasi.

## Konfigurasi

1. Pastikan instance di Evolution API sudah dibuat dan state koneksinya `open`.
2. Pastikan `EVOLUTION_API_INSTANCE` berisi nama instance, bukan UUID instance, kecuali deployment Evolution API Anda memang memakai nama instance berupa UUID.
3. Isi environment backend/Compose aplikasi:

   ```dotenv
   WHATSAPP_ENABLED=false
   EVOLUTION_API_BASE_URL=https://evolution.example.test
   EVOLUTION_API_KEY=ISI_API_KEY_EVOLUTION
   EVOLUTION_API_INSTANCE=sop-production
   # Kosong: gunakan seluruh nomor valid dari database.
   WHATSAPP_ALLOWED_RECIPIENTS=
   ```

4. Jalankan deployment CI/CD aplikasi dan tunggu service `db`, `backend`, serta `frontend` healthy. Ketersediaan Evolution API tidak memengaruhi health atau startup aplikasi.
5. Setelah API key dan instance tervalidasi, ubah `WHATSAPP_ENABLED=true` dan deploy ulang backend.

Jika Evolution API tidak dapat dihubungi, API key salah, atau instance belum `open`, alur pengajuan tetap berjalan. State antrean tetap berada di database aplikasi dan worker menjadwalkan retry; aplikasi tidak mencoba mengelola lifecycle Evolution API.

## Uji ke WhatsApp asli

Pastikan pengguna terkait memiliki `nohp` valid di database. Untuk demonstrasi cepat, gunakan interval satu menit. Jika tidak ingin menghubungi seluruh pengguna pada staging, isi `WHATSAPP_ALLOWED_RECIPIENTS` dengan nomor penguji saja.

1. Ubah pengajuan ke salah satu status pada matriks penerima.
2. Tunggu paling lama satu siklus rekonsiliasi ditambah waktu respons Evolution API.
3. Pastikan pesan diterima oleh nomor yang tepat dan tidak memuat tautan.
4. Biarkan status tetap sama dan pastikan pesan berikutnya datang setelah interval reminder.
5. Ubah status pengajuan. Pastikan jenis reminder lama berhenti; jika status baru juga actionable, reminder penerima tahap baru dibuat.
6. Nonaktifkan salah satu evaluator atau ubah nomornya, lalu pastikan evaluator tersebut tidak menerima pengiriman berikutnya. Jika filter staging dipakai, penghapusan nomor dari allowlist juga harus menghentikan pengiriman.
7. Putuskan instance Evolution API sementara. Alur bisnis harus tetap berhasil dan reminder dijadwalkan ulang. Setelah instance kembali `open`, pengiriman dilanjutkan.

Periksa log container `backend` dan log Evolution API dari server private yang terpisah. Nomor tujuan pada log backend otomatis disamarkan dan API key tidak dicatat.

Setelah demonstrasi selesai, set `WHATSAPP_ENABLED=false` dan deploy ulang backend jika pengiriman reminder belum akan dipakai.

## Pengujian otomatis

Matriks pengujian lengkap tersedia di [E2E workflow reminder WhatsApp](./whatsapp-reminder-e2e.md).

```powershell
cd server
pnpm test:core-unit
pnpm test:integration:docker:whatsapp
pnpm test:e2e:docker:whatsapp
pnpm build
```

Unit test provider mencakup payload dan header Evolution API, status koneksi instance, timeout ambigu, rate limit, respons rusak, dan kegagalan jaringan. Integration test memakai MariaDB Docker serta HTTP stub lokal dan tidak mengirim ke WhatsApp asli.
