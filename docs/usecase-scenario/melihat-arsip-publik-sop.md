# Skenario UC-19: Melihat Arsip Publik SOP

Dokumen ini merinci use case **Melihat Arsip Publik SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-19 |
| Use case diagram | Melihat Arsip Publik SOP |
| No requirements | 22 |
| Nama fungsional requirements | Akses Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Aktor terlibat | Sistem arsip publik SOP |

## Prasyarat

- SOP sudah berstatus berlaku dan tersedia untuk publik.
- Pengunjung tidak perlu login.

## Pemicu

Pengunjung membuka halaman arsip publik SOP.

## Alur utama

1. Pengunjung membuka halaman arsip publik.
2. Sistem menampilkan daftar SOP berlaku yang dapat diakses publik.
3. Pengunjung mencari atau memfilter daftar SOP.
4. Sistem menampilkan hasil pencarian.
5. Pengunjung membuka detail atau pratinjau dokumen SOP.
6. Sistem menampilkan informasi dokumen sesuai data arsip publik.

## Alur alternatif

- Jika tidak ada SOP yang cocok dengan pencarian, sistem menampilkan hasil kosong.
- Jika SOP tidak berstatus publik atau tidak berlaku, sistem tidak menampilkannya pada arsip publik.

## Hasil akhir

Pengunjung dapat melihat SOP yang sudah berlaku tanpa login.

