# Skenario UC-20: Memeriksa Pengesahan TTE

Dokumen ini merinci use case **Memeriksa Pengesahan TTE** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-20 |
| Use case diagram | Memeriksa Pengesahan TTE |
| No requirements | 23 |
| Nama fungsional requirements | Verifikasi Pengesahan TTE |
| Aktor utama | Pengunjung |
| Aktor terlibat | Sistem verifikasi pengesahan TTE |

## Prasyarat

- Dokumen memiliki riwayat pengesahan TTE di sistem.
- Pengunjung memiliki tautan, kode, atau QR verifikasi.

## Pemicu

Pengunjung membuka tautan verifikasi atau memindai QR pada dokumen SOP.

## Alur utama

1. Pengunjung membuka halaman verifikasi pengesahan TTE.
2. Sistem menerima kode atau parameter verifikasi.
3. Sistem mencari riwayat pengesahan pada database aplikasi.
4. Sistem memvalidasi bahwa data pengesahan cocok dengan dokumen terkait.
5. Sistem menampilkan status pengesahan, identitas penandatangan sesuai kebijakan, waktu pengesahan, dan status dokumen.

## Alur alternatif

- Jika kode verifikasi tidak ditemukan, sistem menampilkan status tidak valid atau tidak ditemukan.
- Jika dokumen sudah dicabut atau digantikan, sistem menampilkan status terkini agar pengunjung tidak salah menggunakan dokumen lama.

## Hasil akhir

Pengunjung mengetahui apakah pengesahan TTE pada dokumen tercatat valid di sistem.

