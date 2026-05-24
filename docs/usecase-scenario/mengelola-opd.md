# Skenario UC-05: Mengelola OPD

Dokumen ini merinci use case **Mengelola OPD** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-05 |
| Use case diagram | Mengelola OPD |
| No requirements | 1 |
| Nama fungsional requirements | Pengelolaan Data OPD |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem master data OPD |

## Prasyarat

- PJ Evaluator sudah login.
- Data yang dimasukkan mengikuti ketentuan validasi master OPD.

## Pemicu

PJ Evaluator perlu menambah, mengubah, atau menonaktifkan data OPD.

## Alur utama

1. PJ Evaluator membuka menu pengelolaan OPD.
2. Sistem menampilkan daftar OPD yang sudah terdaftar.
3. PJ Evaluator memilih aksi tambah atau ubah.
4. PJ Evaluator mengisi data OPD.
5. Sistem memvalidasi kelengkapan dan potensi duplikasi.
6. Sistem menyimpan perubahan.
7. Sistem memperbarui daftar OPD.

## Alur alternatif

- Jika data wajib belum lengkap, sistem menolak penyimpanan.
- Jika OPD dinonaktifkan, sistem melakukan soft-delete agar riwayat relasi tetap utuh.

## Hasil akhir

Data master OPD tersimpan secara konsisten dan dapat digunakan oleh use case lain.

