# Skenario UC-14: Mengajukan Evaluasi SOP

**Use case inti (core)** — urutan 2 dari 5 alur bisnis utama.

Dokumen ini merinci use case **Mengajukan Evaluasi SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-14 |
| Core | Ya (2/5 — Ajukan evaluasi) |
| Use case diagram | Mengajukan Evaluasi SOP |************
| No requirements | 12 |
| Nama fungsional requirements | Pengajuan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Aktor terlibat | Sistem pengajuan evaluasi |

## Prasyarat

- PJ Penyusun sudah login.
- Terdapat minimal satu SOP pada OPD yang siap dievaluasi.
- Tidak ada pengajuan aktif yang melanggar aturan proses berjalan.

## Pemicu

PJ Penyusun ingin menyerahkan SOP kepada evaluator untuk dinilai.

## Alur utama

1. PJ Penyusun membuka menu pengajuan evaluasi.
2. Sistem menampilkan SOP yang memenuhi syarat untuk diajukan.
3. PJ Penyusun memilih SOP yang akan dimasukkan ke pengajuan.
4. PJ Penyusun mengisi informasi pengajuan yang dibutuhkan.
5. Sistem memvalidasi status SOP, kepemilikan OPD, dan aturan pengajuan aktif.
6. Sistem membuat pengajuan evaluasi.
7. Sistem mengubah status SOP yang diajukan menjadi sedang dievaluasi.

## Alur alternatif

- Jika ada SOP yang belum siap dievaluasi, sistem menolak SOP tersebut dari pengajuan.
- Jika OPD masih memiliki pengajuan aktif, sistem menolak pembuatan pengajuan baru.
- Jika daftar SOP kosong, sistem menampilkan bahwa belum ada SOP yang dapat diajukan.

## Hasil akhir

Pengajuan evaluasi tercatat dan SOP terkait masuk ke proses evaluasi.

