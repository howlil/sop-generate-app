# Skenario UC-07: Mengelola Kepala OPD

Dokumen ini merinci use case **Mengelola Kepala OPD** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-07 |
| Use case diagram | Mengelola Kepala OPD |
| No requirements | 4 |
| Nama fungsional requirements | Pengelolaan Kepala OPD |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem pengelolaan pengguna dan OPD |

## Prasyarat

- PJ Evaluator sudah login.
- OPD tujuan sudah terdaftar.

## Pemicu

PJ Evaluator perlu menetapkan atau memperbarui Kepala OPD aktif.

## Alur utama

1. PJ Evaluator membuka menu Kepala OPD.
2. Sistem menampilkan daftar Kepala OPD dan OPD terkait.
3. PJ Evaluator memilih OPD dan mengisi data Kepala OPD.
4. Sistem memvalidasi identitas akun dan OPD tujuan.
5. Sistem memastikan aturan satu Kepala OPD aktif untuk satu OPD.
6. Sistem menyimpan data Kepala OPD.
7. Sistem menampilkan status Kepala OPD terbaru.

## Alur alternatif

- Jika OPD sudah memiliki Kepala OPD aktif, sistem menolak penambahan sampai data lama dinonaktifkan atau diganti sesuai aturan.
- Jika identitas akun duplikat, sistem menolak penyimpanan.

## Hasil akhir

Kepala OPD aktif tercatat sebagai pihak yang berwenang pada use case pengesahan dokumen SOP.

