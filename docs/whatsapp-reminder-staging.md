# Reminder WhatsApp staging dengan WAHA

Fitur ini hanya mengirim notifikasi otomatis berdasarkan status pengajuan. Tidak ada broadcast manual, tombol kirim pesan uji, tautan ke aplikasi, atau halaman riwayat pesan.

## Aturan penerima

| Status pengajuan              | Pesan                      | Penerima                                      |
| ----------------------------- | -------------------------- | --------------------------------------------- |
| `SEDANG_DIEVALUASI`           | Pengingat evaluasi SOP     | Semua pengguna aktif dengan peran `EVALUATOR` |
| `SELESAI_DIEVALUASI`          | Pengingat TTD berita acara | Satu `PJ_EVALUATOR` aktif                     |
| `DITANDATANGANI_PJ_EVALUATOR` | Pengingat TTD berita acara | Satu `PJ_PENYUSUN` aktif pada OPD pengajuan   |
| `DITANDATANGANI_PJ_PENYUSUN`  | Pengingat TTD SOP          | Satu `KEPALA_OPD` aktif pada OPD pengajuan    |

Jika penerima tunggal tidak ada atau berjumlah lebih dari satu, sistem tidak mengirim dan mencatat kesalahan konfigurasi tanpa menggagalkan alur pengajuan. Pesan dikirim ulang setiap `WHATSAPP_REMINDER_INTERVAL_MINUTES` selama status belum berubah. Tidak ada batas maksimum pengiriman.

## Penyimpanan minimal

Tabel `PengingatWhatsApp` adalah state antrean aktif, bukan riwayat pesan. Satu baris unik mewakili pasangan pengajuan, penerima, dan jenis pengingat. Baris dihapus ketika status, peran, keaktifan, OPD, nomor telepon, atau allowlist tidak lagi sesuai. Kolom `lastSentAt`, `nextSendAt`, lock lease, dan jumlah kegagalan hanya dipakai untuk penjadwalan, retry, dan mencegah dua instance mengirim baris yang sama secara bersamaan.

## Menjalankan staging

1. Salin `.env.example` menjadi `.env`, lalu gunakan secret acak yang kuat untuk `WAHA_API_KEY` dan `WAHA_DASHBOARD_PASSWORD`.
2. Isi `WHATSAPP_ALLOWED_RECIPIENTS` hanya dengan nomor penguji yang benar-benar diizinkan menerima pesan. Formatnya kode negara tanpa `+`, misalnya `6281234567890`.
3. Pertahankan `WHATSAPP_ENABLED=false` untuk proses pairing pertama.
4. Jalankan:

   ```powershell
   docker compose -f docker-compose.prod.yml -f docker-compose.staging.yml up -d --build
   ```

5. Buka `http://127.0.0.1:3001/dashboard`, masuk dengan kredensial dashboard, sambungkan menggunakan API key, buat session bernama `sop-staging`, lalu scan QR dengan akun WhatsApp pengirim.
6. Pastikan session berstatus `WORKING`.
7. Ubah `WHATSAPP_ENABLED=true`, kemudian terapkan konfigurasi backend:

   ```powershell
   docker compose -f docker-compose.prod.yml -f docker-compose.staging.yml up -d --build backend
   ```

Dashboard sengaja hanya bind ke loopback host. Jangan memublikasikan port 3001 ke internet. Volume `waha-staging-session-data` mempertahankan sesi pairing saat container dibuat ulang.

## Uji ke WhatsApp asli

Gunakan nomor uji yang berada di `WHATSAPP_ALLOWED_RECIPIENTS` sebagai `nohp` pengguna terkait. Untuk demonstrasi cepat, gunakan interval satu menit.

1. Ubah pengajuan ke salah satu status pada matriks penerima.
2. Tunggu paling lama satu siklus rekonsiliasi ditambah waktu respons WAHA.
3. Pastikan pesan diterima oleh nomor yang tepat dan tidak memuat tautan.
4. Biarkan status tetap sama dan pastikan pesan berikutnya datang setelah interval reminder.
5. Ubah status pengajuan. Pastikan jenis reminder lama berhenti; jika status baru juga actionable, reminder untuk penerima tahap baru akan dibuat.
6. Nonaktifkan salah satu evaluator atau keluarkan nomornya dari allowlist, lalu pastikan evaluator tersebut tidak menerima pengiriman berikutnya.
7. Matikan container WAHA sementara. Alur bisnis harus tetap berhasil dan reminder dijadwalkan ulang. Setelah WAHA kembali `WORKING`, pengiriman dilanjutkan.

Periksa log tanpa menampilkan nomor lengkap:

```powershell
docker compose -f docker-compose.prod.yml -f docker-compose.staging.yml logs -f backend waha
```

Setelah demonstrasi selesai, set `WHATSAPP_ENABLED=false` dan buat ulang backend. WAHA memakai koneksi WhatsApp Web yang tidak resmi; gunakan hanya akun dan nomor yang memang disediakan untuk staging/skripsi serta hindari volume/frekuensi yang menyerupai spam.

Kontrak adapter mengikuti dokumentasi resmi WAHA untuk [session dan status `WORKING`](https://waha.devlike.pro/docs/how-to/sessions/), [pengiriman teks](https://waha.devlike.pro/docs/how-to/send-messages/), serta [API key dan keamanan](https://waha.devlike.pro/docs/how-to/security/).

## Pengujian otomatis

Matriks dan bukti pengujian lengkap tersedia di [E2E workflow reminder WhatsApp](./whatsapp-reminder-e2e.md).

```powershell
cd server
pnpm test:core-unit
pnpm test:integration:docker:whatsapp
pnpm test:e2e:docker:whatsapp
pnpm build
```

Unit test mencakup normalisasi nomor, allowlist, semua evaluator, invariant penerima tunggal, deduplikasi nomor, pembuatan pesan tanpa tautan, rekonsiliasi idempoten, perubahan status tepat sebelum kirim, claim concurrent, pencegahan scheduler overlap, recovery siklus, timeout ambigu, rate limit, session tidak siap, respons rusak, dan kegagalan jaringan. Integration test memakai MariaDB Docker dan tidak mengirim ke WhatsApp asli.
