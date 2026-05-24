# Skenario UC-17: Mengelola Pelaksana SOP

Dokumen ini merinci use case **Mengelola Pelaksana SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-17 |
| Use case diagram | Mengelola Pelaksana SOP |
| No requirements | 6 |
| Nama fungsional requirements | Pengelolaan Data Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem master pelaksana SOP |

## Prasyarat

- Aktor sudah login sebagai PJ Penyusun atau Penyusun.
- Aktor berada dalam ruang lingkup OPD yang dikelola.

## Pemicu

Aktor perlu menambah, memperbarui, atau menggunakan data pelaksana pada SOP.

## Alur utama

1. Aktor membuka menu pelaksana SOP atau panel pelaksana pada workbench SOP.
2. Sistem menampilkan daftar pelaksana pada OPD.
3. Aktor menambah atau mengubah data pelaksana.
4. Sistem memvalidasi data pelaksana.
5. Sistem menyimpan data master pelaksana.
6. Jika digunakan pada SOP, aktor menautkan pelaksana ke dokumen atau langkah SOP.
7. Sistem menyimpan relasi pelaksana dengan SOP.

## Alur alternatif

- Jika pelaksana sudah digunakan pada dokumen yang tidak boleh diubah, sistem dapat menolak penghapusan.
- Jika data pelaksana duplikat atau kosong, sistem menolak penyimpanan.

## Hasil akhir

Data pelaksana SOP tersedia dan dapat digunakan dalam penyusunan langkah atau diagram SOP.

