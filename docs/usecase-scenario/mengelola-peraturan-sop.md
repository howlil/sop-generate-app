# Skenario UC-18: Mengelola Peraturan SOP

Dokumen ini merinci use case **Mengelola Peraturan SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-18 |
| Use case diagram | Mengelola Peraturan SOP |
| No requirements | 5 |
| Nama fungsional requirements | Pengelolaan Peraturan OPD |
| Aktor utama | PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem master peraturan |

## Prasyarat

- Aktor sudah login sebagai PJ Penyusun atau Penyusun.
- Aktor memiliki akses pada OPD terkait.

## Pemicu

Aktor perlu mencatat dasar hukum atau peraturan yang digunakan pada SOP.

## Alur utama

1. Aktor membuka menu peraturan atau tab dasar hukum pada workbench SOP.
2. Sistem menampilkan daftar peraturan yang tersedia untuk OPD.
3. Aktor menambah data peraturan atau memilih peraturan yang sudah ada.
4. Sistem memvalidasi nomor, tahun, dan data pendukung peraturan.
5. Sistem menyimpan data peraturan atau menautkan peraturan yang sudah tersedia.
6. Jika dalam konteks SOP, sistem menghubungkan peraturan sebagai dasar hukum SOP.

## Alur alternatif

- Jika peraturan dengan nomor dan tahun yang sama sudah ada, sistem menggunakan data yang ada dan menambahkan relasi OPD bila diperlukan.
- Jika data wajib tidak lengkap, sistem menolak penyimpanan.

## Hasil akhir

Dasar hukum SOP tercatat dan dapat digunakan dalam dokumen SOP.

