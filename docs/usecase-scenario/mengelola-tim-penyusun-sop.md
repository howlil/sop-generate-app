# Skenario UC-08: Mengelola Tim Penyusun SOP

Dokumen ini merinci use case **Mengelola Tim Penyusun SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-08 |
| Use case diagram | Mengelola Tim Penyusun SOP |
| No requirements | 3 |
| Nama fungsional requirements | Pengelolaan Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem pengelolaan pengguna dan OPD |

## Prasyarat

- PJ Evaluator sudah login.
- OPD tujuan sudah terdaftar.

## Pemicu

PJ Evaluator perlu mengatur akun PJ Penyusun atau Penyusun pada OPD.

## Alur utama

1. PJ Evaluator membuka menu tim penyusun SOP.
2. Sistem menampilkan daftar akun penyusun per OPD.
3. PJ Evaluator memilih tambah atau ubah akun.
4. PJ Evaluator mengisi identitas, peran, dan OPD penugasan.
5. Sistem memvalidasi keunikan akun dan aturan peran.
6. Jika peran adalah PJ Penyusun, sistem memastikan OPD tidak memiliki PJ Penyusun aktif lain.
7. Sistem menyimpan data akun dan riwayat penugasan.

## Alur alternatif

- Jika terjadi mutasi OPD, sistem memperbarui penugasan aktif dan menyimpan riwayat.
- Jika aturan satu PJ Penyusun aktif dilanggar, sistem menolak perubahan.

## Hasil akhir

Tim penyusun SOP pada OPD tercatat dan dapat mengakses use case penyusunan sesuai peran.

