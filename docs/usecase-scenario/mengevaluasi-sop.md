# Skenario UC-11: Mengevaluasi SOP

**Use case inti (core)** — urutan 3 dari 5 alur bisnis utama.

Dokumen ini merinci use case **Mengevaluasi SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-11 |
| Core | Ya (3/5 — Evaluasi SOP) |
| Use case diagram | Mengevaluasi SOP |
| No requirements | 15 |
| Nama fungsional requirements | Penilaian Substansi SOP |
| Aktor utama | Evaluator |
| Aktor terlibat | Sistem evaluasi SOP |

## Prasyarat

- Evaluator sudah login.
- Terdapat pengajuan evaluasi berisi SOP yang sedang dievaluasi.

## Pemicu

Evaluator membuka workbench evaluasi untuk menilai substansi SOP.

## Alur utama

1. Evaluator memilih pengajuan evaluasi.
2. Sistem menampilkan daftar SOP di dalam pengajuan.
3. Evaluator membuka detail SOP dan memeriksa substansi dokumen.
4. Evaluator memberikan hasil penilaian untuk SOP.
5. Sistem menyimpan nilai evaluasi dan audit perubahan.
6. Setelah seluruh SOP memenuhi kriteria, evaluator menyelesaikan evaluasi pengajuan.
7. Sistem mengubah status pengajuan menjadi selesai dievaluasi.

## Alur alternatif

- Jika SOP belum sesuai, evaluator memilih hasil perlu perbaikan dan UC-12 **Membuat Komentar** berjalan sebagai `<<extend>>`.
- Jika terjadi konflik versi penilaian, sistem menolak pembaruan agar perubahan evaluator lain tidak tertimpa.
- Jika belum semua SOP sesuai, sistem menolak penyelesaian pengajuan.

## Hasil akhir

Hasil penilaian substansi tersimpan dan pengajuan dapat dilanjutkan jika seluruh SOP sudah sesuai.

