# E2E workflow reminder WhatsApp

Pengujian end-to-end menjalankan aplikasi Nest lengkap, autentikasi dan endpoint workflow asli, MariaDB, Prisma, scheduler, serta adapter HTTP Evolution API. Tujuan HTTP diarahkan ke stub lokal agar respons sukses, timeout, rate limit, dan kegagalan Evolution API dapat direproduksi tanpa mengirim pesan sungguhan.

## Batas sistem yang diuji

```text
HTTP API evaluasi/TTE
        -> Status PengajuanEvaluasi di MariaDB
        -> Reconciler PengingatWhatsApp
        -> Optimistic claim + eligibility check + retry worker
        -> EvolutionApiProvider (HTTP asli)
        -> Evolution API HTTP stub dan pemeriksaan payload
```

Tidak ada repository atau provider yang di-mock pada jalur utama. Stub hanya menggantikan layanan Evolution API eksternal. Dengan demikian serialisasi request, header API key, timeout fetch, status HTTP dan body, locking database, serta perubahan workflow diuji sebagai satu sistem.

## Alur sukses utama

1. Pengajuan `SEDANG_DIEVALUASI` menghasilkan reminder untuk seluruh evaluator aktif.
2. Worker tidak mengirim ulang sebelum `nextSendAt`, lalu mengirim ulang setelah interval tercapai.
3. Perubahan workflow memindahkan penerima secara berurutan ke PJ Evaluator, PJ Penyusun, lalu Kepala OPD.
4. Status terminal menghapus seluruh state reminder.
5. Semua request memakai header `apikey`, endpoint instance yang benar, `number` berupa nomor `62...` tanpa `+`, dan pesan tanpa URL.

## Cakupan penting

- claim concurrent dan pemulihan lock lease;
- normalisasi `08...` ke `628...`, deduplikasi nomor, constraint database, dan filter staging opsional;
- perubahan status/peran/OPD/nomor tepat sebelum kirim;
- invariant penerima tunggal;
- isolasi kegagalan satu penerima dalam batch;
- instance bukan `open` dan pemulihan ke `open`;
- API key invalid dari HTTP 401/403;
- HTTP 429 dengan `Retry-After`, HTTP 500, JSON rusak, serta `number` invalid;
- timeout atau socket putus setelah POST sebagai delivery ambigu untuk mencegah duplikasi cepat;
- reminder tetap dipertahankan setelah kegagalan berulang tanpa batas maksimum.

## Menjalankan pengujian

```powershell
cd server
pnpm test:e2e:docker:whatsapp
```

Untuk menjalankan integration state test dan E2E sekaligus:

```powershell
pnpm test:integration:docker:whatsapp
```

Runner menyalakan MariaDB test, memasang dependency dari lockfile, generate Prisma client, melakukan reset schema database test, lalu menjalankan suite WhatsApp yang dipilih. Database wajib memiliki nama yang mengandung kata `test`; helper membatalkan eksekusi jika target tidak aman.

## Uji penerimaan ke WhatsApp asli

E2E otomatis tidak mengirim ke WhatsApp asli. Acceptance test dilakukan dengan instance Evolution API staging:

1. Pastikan instance pada dashboard/manager Evolution API berstatus `open`.
2. Pastikan `nohp` pengguna uji valid di database. Untuk membatasi staging, masukkan nomor penguji ke `WHATSAPP_ALLOWED_RECIPIENTS`; kosong berarti semua nomor valid dari database.
3. Jalankan satu pengajuan uji melalui empat status actionable.
4. Cocokkan penerima dan isi pesan dengan alur sukses utama.
5. Pertahankan satu status selama dua interval untuk membuktikan repeat.
6. Ubah status ke `DITOLAK` atau `SELESAI` dan pastikan pengiriman berhenti.

Konfigurasi dan langkah operasional tersedia di [panduan Evolution API](./whatsapp-reminder-staging.md).
