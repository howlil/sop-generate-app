# Skenario UC-21: Memverifikasi Tanda Tangan Digital

Dokumen ini merinci use case **Memverifikasi Tanda Tangan Digital** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-21 |
| Use case diagram | Memverifikasi Tanda Tangan Digital |
| No requirements | 24 |
| Nama fungsional requirements | Verifikasi Tanda Tangan PDF |
| Aktor utama | Pengunjung |
| Aktor terlibat | Sistem verifikasi PDF |

## Prasyarat

- Pengunjung memiliki berkas PDF yang akan diverifikasi.
- Fitur verifikasi PDF tersedia pada sistem.

## Pemicu

Pengunjung mengunggah PDF untuk mengecek validitas tanda tangan digital.

## Alur utama

1. Pengunjung membuka halaman verifikasi tanda tangan digital.
2. Pengunjung memilih dan mengunggah berkas PDF.
3. Sistem memvalidasi format dan ukuran berkas.
4. Sistem memeriksa tanda tangan digital pada PDF.
5. Sistem menampilkan hasil verifikasi, termasuk status validitas dan informasi tanda tangan yang dapat dibaca.

## Alur alternatif

- Jika berkas bukan PDF, sistem menolak unggahan.
- Jika PDF tidak memiliki tanda tangan digital, sistem menampilkan status tidak ditemukan.
- Jika tanda tangan tidak valid, sistem menampilkan status gagal verifikasi.

## Hasil akhir

Pengunjung memperoleh hasil validasi tanda tangan digital PDF.

