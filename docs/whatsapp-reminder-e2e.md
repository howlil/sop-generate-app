# E2E workflow reminder WhatsApp

Dokumen ini mencatat pengujian end-to-end reminder WhatsApp untuk staging. Pengujian menjalankan aplikasi Nest lengkap, autentikasi dan endpoint workflow asli, MariaDB 11.4 di Docker, Prisma, scheduler services, serta adapter HTTP WAHA. Tujuan HTTP diarahkan ke WAHA stub lokal agar respons sukses, timeout, rate limit, dan kegagalan lain dapat direproduksi tanpa mengirim pesan ke nomor sungguhan.

## Batas sistem yang diuji

```text
HTTP API evaluasi/TTE
        ↓
Status PengajuanEvaluasi di MariaDB
        ↓
Reconciler PengingatWhatsApp
        ↓
Optimistic claim + eligibility check + retry worker
        ↓
WahaProvider (HTTP asli)
        ↓
WAHA HTTP stub dan pemeriksaan payload
```

Tidak ada repository atau provider yang di-mock pada jalur utama. Stub hanya menggantikan proses WAHA/WhatsApp eksternal. Dengan demikian, serialisasi request, API key, timeout fetch, status HTTP, locking database, dan perubahan workflow tetap diuji sebagai satu sistem.

## Alur sukses utama

1. Pengajuan berstatus `SEDANG_DIEVALUASI` menghasilkan reminder untuk seluruh evaluator aktif, termasuk evaluator dari OPD berbeda.
2. Dua evaluator menerima pesan pertama. Worker dipanggil sebelum jatuh tempo dan tidak mengirim apa pun.
3. Setelah `nextSendAt`, kedua evaluator menerima reminder ulang. Ini membuktikan pengulangan tidak berhenti setelah pengiriman pertama.
4. Evaluator menyelesaikan evaluasi melalui endpoint API. Status menjadi `SELESAI_DIEVALUASI`; reminder evaluator dibuang dan PJ Evaluator menerima reminder TTD berita acara.
5. PJ Evaluator menandatangani berita acara melalui endpoint TTE. PJ Penyusun pada OPD pengajuan menerima reminder berikutnya.
6. PJ Penyusun menandatangani berita acara. Kepala OPD pada OPD pengajuan menerima reminder pengesahan SOP.
7. Kepala OPD menandatangani SOP melalui endpoint batch TTE. Status pengajuan menjadi `SELESAI` dan seluruh state reminder dihapus.
8. Semua payload diverifikasi memakai session yang benar, header API key yang benar, `chatId` WAHA yang benar, dan isi pesan tanpa URL.

## Matriks testcase otomatis

| No. | Kelompok      | Skenario                                                       | Hasil yang diwajibkan                                                     |
| --: | ------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
|   1 | Workflow      | Evaluasi → TTD PJ Evaluator → TTD PJ Penyusun → TTD Kepala OPD | Penerima berpindah sesuai status; terminal menghapus reminder             |
|   2 | Reminder      | Worker dipanggil sebelum `nextSendAt`                          | Tidak ada pesan tambahan                                                  |
|   3 | Reminder      | Interval berikutnya tercapai                                   | Pesan dikirim ulang tanpa counter maksimum                                |
|   4 | Terminal      | Pengajuan ditolak melalui API setelah reminder dibuat          | Reminder dihapus sebelum POST WAHA                                        |
|   5 | Concurrency   | Dua worker mengambil reminder bersamaan                        | Setiap nomor menerima tepat satu pesan                                    |
|   6 | Batch         | Satu penerima mendapat HTTP 500, penerima lain sukses          | Kegagalan terisolasi; penerima lain tetap terkirim; row gagal dapat pulih |
|   7 | Batch         | Session `FAILED` untuk dua penerima                            | Satu readiness check; semua row dijadwalkan ulang; tidak ada POST pesan   |
|   8 | Recipient     | Dua evaluator memakai nomor sama                               | Nomor dideduplikasi                                                       |
|   9 | Recipient     | Nomor telepon bukan seluler Indonesia                          | Penerima dilewati                                                         |
|  10 | Safety        | Nomor tidak berada dalam allowlist                             | Penerima dilewati                                                         |
|  11 | Invariant     | PJ Evaluator aktif tidak tersedia                              | Fail closed, tidak salah kirim; pulih setelah PJ tersedia                 |
|  12 | Race          | Pengguna dinonaktifkan setelah reconcile                       | Row stale dihapus tanpa request WAHA                                      |
|  13 | Race          | Nomor berubah setelah reconcile                                | Row stale dihapus tanpa request WAHA                                      |
|  14 | Race          | Peran berubah setelah reconcile                                | Row stale dihapus tanpa request WAHA                                      |
|  15 | Provider      | Session `SCAN_QR_CODE`/belum `WORKING`                         | `SESSION_NOT_READY`, retry 5 menit                                        |
|  16 | Provider      | HTTP 401                                                       | `UNAUTHORIZED`, retry 5 menit                                             |
|  17 | Provider      | HTTP 429 dengan `Retry-After: 120`                             | Retry tepat 120 detik                                                     |
|  18 | Provider      | HTTP 500                                                       | `UNAVAILABLE`, transient retry                                            |
|  19 | Provider      | HTTP sukses tetapi body bukan JSON                             | `INVALID_RESPONSE`, transient retry                                       |
|  20 | Provider      | HTTP 400/bad recipient                                         | Tidak retry cepat; gunakan interval reminder normal                       |
|  21 | Worst case    | POST melewati timeout                                          | `TIMEOUT` dan delivery ambigu; tidak retry cepat                          |
|  22 | Worst case    | Socket putus setelah POST diterima                             | `UNAVAILABLE` ambigu; tidak retry cepat agar tidak duplikat               |
|  23 | Recovery      | WAHA kembali `WORKING`                                         | Pengiriman berhasil, failure counter kembali nol                          |
|  24 | No maximum    | Row sudah gagal 999 kali                                       | Tetap disimpan; kegagalan ke-1000 masih dijadwalkan ulang                 |
|  25 | Lock          | Lease worker masih aktif                                       | Tidak diambil worker lain                                                 |
|  26 | Lock recovery | Lease kedaluwarsa                                              | Reminder dapat diklaim dan dikirim kembali                                |

Beberapa pemeriksaan digabung dalam satu testcase workflow, sehingga 26 kondisi pada matriks dijalankan dalam 20 testcase Jest.

Invariant duplikasi role tunggal juga dilindungi trigger/unique database dan unit test resolver. E2E memverifikasi kondisi role tidak tersedia karena database yang valid memang tidak mengizinkan pembuatan dua role tunggal aktif yang melanggar invariant.

## Menjalankan pengujian

```powershell
cd server
pnpm test:e2e:docker:whatsapp
```

Runner akan menyalakan MariaDB test, memasang dependency dari lockfile, generate Prisma client, melakukan `prisma db push --force-reset`, lalu menjalankan hanya suite WhatsApp E2E. Database wajib memiliki nama yang mengandung kata `test`; helper akan membatalkan eksekusi jika target database tidak aman.

Untuk menjalankan integration state test dan E2E sekaligus:

```powershell
pnpm test:integration:docker:whatsapp
```

## Hasil terakhir

Eksekusi pada 2 Agustus 2026:

- E2E WhatsApp: 20/20 lulus.
- Gabungan integration state + E2E WhatsApp: 23/23 lulus.
- Durasi Jest E2E: sekitar 46 detik, di luar bootstrap container.
- Unit regression adapter WAHA: 13/13 lulus.
- Seluruh core unit test aplikasi: 556/556 lulus pada 47 suite.
- Build NestJS: lulus.
- Defect yang ditemukan pengujian: abort fetch Node dapat dibungkus sebagai `TypeError`. Provider diperbaiki untuk mendeteksi `AbortSignal.aborted`, sehingga timeout POST selalu dikategorikan sebagai delivery ambigu.

## Uji penerimaan ke WhatsApp asli

E2E otomatis tidak melakukan pairing QR dan tidak mengirim ke WhatsApp asli. Uji itu tetap dilakukan satu kali sebagai staging acceptance test:

1. Pair session `sop-staging` sampai status `WORKING`.
2. Masukkan hanya nomor penguji ke `WHATSAPP_ALLOWED_RECIPIENTS`.
3. Jalankan satu pengajuan uji melalui empat status actionable.
4. Cocokkan penerima dan isi pesan dengan alur sukses utama.
5. Pertahankan satu status selama dua interval untuk membuktikan repeat.
6. Ubah status ke `DITOLAK` atau `SELESAI` dan pastikan pengiriman berhenti.

Langkah pairing dan perintah Compose tersedia di [panduan staging WAHA](./whatsapp-reminder-staging.md).
