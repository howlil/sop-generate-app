# Rencana dan Hasil Pengujian Unit

Dokumen ini berisi rencana test case dan ringkasan hasil pengujian unit untuk aplikasi SOP Generator & Evaluator. Pengujian dipetakan berdasarkan komponen yang mendukung core workflow sistem, tetapi tetap dikategorikan sebagai unit testing karena setiap service, policy, validator, repository, guard, dan helper diuji secara terisolasi menggunakan dependency yang dimock.

Pengelompokan berdasarkan workflow digunakan untuk menunjukkan keterkaitan unit test dengan proses bisnis utama aplikasi, mulai dari autentikasi, pengelolaan data master, penyusunan SOP, pengajuan evaluasi, revisi, tanda tangan elektronik, hingga arsip publik. Pengujian ini bukan integration test atau end-to-end test karena tidak menjalankan seluruh alur melalui HTTP API dan database nyata secara penuh.

## Cara Menjalankan Pengujian

Untuk menjalankan seluruh unit test pada server:

```bash
cd C:\Users\howlil\Documents\tugas-akhir\codingan\server
pnpm test
```

Untuk menjalankan unit test inti yang mewakili core workflow:

```bash
cd C:\Users\howlil\Documents\tugas-akhir\codingan\server
pnpm test:core-unit
```


Hasil pengujian penuh terakhir:

```text
Test Suites: 38 passed, 38 total
Tests:       261 passed, 261 total
Snapshots:   0 total
Time:        18.063 s
```

Hasil pengujian core unit terakhir:

```text
Test Suites: 19 passed, 19 total
Tests:       173 passed, 173 total
Snapshots:   0 total
Time:        15.371 s
```

## Core Workflow yang Didukung Pengujian Unit

Pemetaan ke kebutuhan fungsional resmi (`docs/requirements.md`):

1. **No 7–8** — Login, ubah kata sandi, otorisasi peran.
2. **No 1–6** — Master: OPD, evaluator, penyusun, kepala OPD, peraturan, pelaksana.
3. **No 10, 15** — Penyusunan draft SOP (header, prosedur, diagram) dan log perubahan.
4. **No 16** — Pengajuan evaluasi (PJ Penyusun).
5. **No 19–20** — Penilaian substansi dan catatan evaluasi (Evaluator).
6. **No 18, 17** — Tindak lanjut revisi dan pengajuan ulang.
7. Penyelesaian paket evaluasi (langkah teknis server sebelum No 22).
8. **No 9, 22, 24** — PIN TTE, TTE Berita Acara, pengesahan SOP oleh Kepala OPD.
9. **No 25, 27–30** — Pencabutan, arsip/cetak, arsip publik, verifikasi TTE/PDF.

## Tabel Test Case Unit

| ID | Modul/Unit yang Diuji | Skenario Pengujian | Data/Input Uji | Hasil yang Diharapkan | Status |
|---|---|---|---|---|:---:|
| TC-01 | `AuthService` | Login dengan kredensial valid | Email dan password pengguna aktif | Sistem mengembalikan token akses dan data pengguna | Lulus |
| TC-02 | `RolesGuard` | Role pengguna tidak sesuai dengan akses fitur | User dengan role berbeda dari role yang diwajibkan | Sistem menolak akses | Lulus |
| TC-03 | `PenyusunService` | Membuat PJ Penyusun pada OPD yang sudah memiliki PJ aktif | Data PJ Penyusun baru untuk OPD yang sudah punya PJ | Sistem menolak pembuatan PJ duplikat | Lulus |
| TC-04 | `KepalaOpdService` | Membuat Kepala OPD pada OPD yang sudah memiliki kepala aktif | Data Kepala OPD baru pada OPD yang sudah memiliki kepala aktif | Sistem menolak duplikasi Kepala OPD | Lulus |
| TC-05 | `EvaluatorService` | Membuat akun evaluator baru | Data evaluator valid | Sistem membuat akun evaluator dan melakukan hash password default | Lulus |
| TC-06 | `PelaksanaService` | Menambah pelaksana SOP sesuai OPD pengguna | Nama pelaksana dan OPD pengguna yang valid | Data pelaksana berhasil dibuat | Lulus |
| TC-07 | `PeraturanService` | Menghapus peraturan yang masih dipakai sebagai dasar hukum | ID peraturan yang masih direferensikan SOP | Sistem menolak penghapusan | Lulus |
| TC-08 | `SopCatalogService` | Membuat SOP baru | Data header SOP valid | Sistem membuat SOP header dan `DetailSOP` versi 1 dengan status draft | Lulus |
| TC-09 | `SopCatalogService` | Memperbarui header SOP | Judul, nomor SOP, dasar hukum, lampiran, dan data header lain | Data header SOP berhasil diperbarui dan log edit terbentuk | Lulus |
| TC-10 | `SopProsedurService` | Mengubah langkah/prosedur SOP | Daftar pelaksana, langkah, urutan, dan relasi percabangan | Sistem memvalidasi dan menyimpan prosedur SOP | Lulus |
| TC-11 | `SopDiagramService` | Mengatur konfigurasi diagram SOP | Data konfigurasi diagram dan path override | Konfigurasi diagram tersimpan dan workbench dikembalikan | Lulus |
| TC-12 | `SopCompletenessValidator` | Validasi SOP lengkap sebelum evaluasi | Workbench berisi header, langkah, pelaksana, dan lampiran lengkap | Sistem tidak menemukan issue kelengkapan | Lulus |
| TC-13 | `SopCompletenessValidator` | Validasi SOP kosong/tidak lengkap | Workbench tanpa langkah atau header penting | Sistem mengembalikan daftar kekurangan SOP | Lulus |
| TC-14 | `SopStatusPolicy` | Penyusun menandai SOP siap dievaluasi | Status awal `DRAFT` atau `SEDANG_DISUSUN` | Status dapat berubah ke `SIAP_DIEVALUASI` | Lulus |
| TC-15 | `SopStatusPolicy` | Penyusun biasa mengajukan SOP ke evaluasi | User role `PENYUSUN`, status SOP `SIAP_DIEVALUASI` | Sistem menolak karena pengajuan hanya boleh oleh PJ Penyusun | Lulus |
| TC-16 | `SopCatalogService` | PJ Penyusun mengajukan SOP dari status siap | User role `PJ_PENYUSUN`, status SOP `SIAP_DIEVALUASI` | Status SOP berubah ke `DIAJUKAN_EVALUASI` | Lulus |
| TC-17 | `PengajuanEvaluasiService` | PJ Penyusun membuat pengajuan evaluasi | Data pengajuan dengan DetailSOP berstatus `SIAP_DIEVALUASI` | Pengajuan evaluasi dibuat dan SOP masuk proses evaluasi | Lulus |
| TC-18 | `PengajuanEvaluasiService` | Non-PJ Penyusun membuat pengajuan evaluasi | User bukan `PJ_PENYUSUN` | Sistem menolak akses pembuatan pengajuan | Lulus |
| TC-19 | `EvaluasiNilaiService` | Evaluator memberi nilai `PERLU_PERBAIKAN` tanpa catatan | Hasil evaluasi `PERLU_PERBAIKAN`, catatan kosong | Sistem menolak input karena catatan wajib diisi | Lulus |
| TC-20 | `EvaluasiNilaiService` | Evaluator memberi nilai `PERLU_PERBAIKAN` dengan catatan | Hasil evaluasi `PERLU_PERBAIKAN` dan catatan valid | Status tindak lanjut menjadi `TERBUKA` | Lulus |
| TC-21 | `EvaluasiNilaiService` | Evaluator memberi nilai `SESUAI` | Hasil evaluasi `SESUAI` | Status tindak lanjut revisi dikosongkan | Lulus |
| TC-22 | `EvaluasiUmpanBalikService` | Penyusun melihat umpan balik evaluasi aktif | DetailSOP dengan hasil `PERLU_PERBAIKAN` | Sistem menampilkan catatan evaluasi aktif | Lulus |
| TC-23 | `EvaluasiNilaiService` | Penyusun menandai tindak lanjut revisi selesai | Nilai evaluasi berstatus tindak lanjut `TERBUKA` | Status tindak lanjut berubah menjadi `SELESAI` | Lulus |
| TC-24 | `SopCatalogService` | PJ Penyusun mengirim ulang SOP setelah revisi | DetailSOP berstatus `REVISI_DARI_EVALUATOR` dan tindak lanjut selesai | SOP dikirim kembali ke evaluator | Lulus |
| TC-25 | `SopCatalogService` | Kirim ulang revisi saat umpan balik belum selesai | Tindak lanjut evaluasi masih `TERBUKA` | Sistem menolak pengiriman ulang | Lulus |
| TC-26 | `EvaluasiNilaiService` | Menyelesaikan evaluasi saat belum semua SOP `SESUAI` | Masih ada nilai `PERLU_PERBAIKAN` | Sistem menolak penyelesaian evaluasi | Lulus |
| TC-27 | `EvaluasiNilaiService` | Menyelesaikan evaluasi saat semua SOP `SESUAI` | Semua baris nilai evaluasi `SESUAI` | Pengajuan menjadi `SELESAI_DIEVALUASI` dan SOP menjadi `SIAP_DIVERIFIKASI` | Lulus |
| TC-28 | `TteService` | PJ Evaluator menandatangani BA pada status salah | Pengajuan belum berstatus `SELESAI_DIEVALUASI` | Sistem menolak tanda tangan BA | Lulus |
| TC-29 | `TteService` | PIN TTE salah | PIN tidak sesuai dengan hash yang tersimpan | Sistem menolak autentikasi PIN | Lulus |
| TC-30 | `TteService` | PJ Evaluator menandatangani BA valid | Pengajuan berstatus `SELESAI_DIEVALUASI` dan PIN valid | Riwayat tanda tangan BA tersimpan | Lulus |
| TC-31 | `TteService` | Pengguna belum memiliki kredensial TTE | Pengguna belum mengatur PIN TTE | Sistem menolak proses TTE | Lulus |
| TC-32 | `TteRepository` | Kepala OPD menandatangani beberapa SOP dalam satu pengajuan | Pengajuan berisi lebih dari satu SOP | Nomor dokumen TTE dibuat unik untuk setiap SOP | Lulus |
| TC-33 | `SopCatalogService` | Kepala OPD mencabut SOP berlaku | SOP berstatus `BERLAKU` | Status SOP berubah menjadi `DICABUT` | Lulus |
| TC-34 | `SopCatalogService` | Penyusun membuat versi baru dari SOP berlaku | DetailSOP berstatus `BERLAKU` | Sistem membuat versi baru dari SOP berlaku | Lulus |
| TC-35 | `SopCatalogService` | Menghapus versi draft | DetailSOP versi draft hasil revisi | Versi draft berhasil dihapus | Lulus |
| TC-36 | `SopPublicService` | Publik melihat daftar OPD dengan SOP berlaku | Request arsip publik OPD | Sistem menampilkan OPD yang memiliki SOP berlaku | Lulus |
| TC-37 | `SopPublicService` | Publik mencari SOP berlaku | Kata kunci judul/nomor/OPD | Sistem menampilkan hasil pencarian SOP berlaku | Lulus |
| TC-38 | `SopPublicService` | Publik melihat dokumen SOP berlaku | ID DetailSOP berstatus `BERLAKU` | Sistem menampilkan dokumen SOP publik | Lulus |
| TC-39 | `EvaluasiGrafikService` | PJ Evaluator melihat grafik evaluasi tahunan | Tahun atau rentang tahun valid | Sistem menghitung statistik nilai OPD tahunan | Lulus |
| TC-40 | `EvaluasiGrafikService` | Rentang tahun laporan tidak valid | `tahunDari` lebih besar dari `tahunSampai` | Sistem menolak permintaan laporan | Lulus |

## Kesimpulan

Berdasarkan hasil pengujian, seluruh unit test yang tersedia pada server berhasil dijalankan dengan status lulus. Total pengujian penuh mencakup 38 test suite dan 261 test case. Hasil ini menunjukkan bahwa komponen-komponen utama yang mendukung core workflow aplikasi telah diuji secara terisolasi, termasuk validasi role, pengelolaan data master, penyusunan SOP, pengajuan evaluasi, revisi, tanda tangan elektronik, versi SOP, pencabutan SOP, dan arsip publik.

Pengujian ini memberikan keyakinan bahwa logika bisnis pada masing-masing unit berjalan sesuai kebutuhan sistem. Untuk pembuktian alur end-to-end secara penuh, pengujian tambahan berupa integration test atau end-to-end test dapat dilakukan pada tahap berikutnya.
