# Skenario UC-02: Logout

Dokumen ini merinci use case **Logout** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-02 |
| Use case diagram | Logout |
| No requirements | Tidak ada oval requirements tersendiri; pendukung No 7 |
| Nama fungsional requirements | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem autentikasi dan manajemen sesi |

## Prasyarat

- Pengguna sudah login.
- Sesi pengguna masih tercatat pada aplikasi.

## Pemicu

Pengguna memilih aksi keluar dari sistem.

## Alur utama

1. Pengguna menekan menu logout.
2. Sistem menghapus atau membatalkan token sesi pada sisi klien dan/atau server.
3. Sistem membersihkan konteks pengguna aktif.
4. Sistem mengarahkan pengguna ke halaman publik atau halaman login.

## Alur alternatif

- Jika sesi sudah kedaluwarsa, sistem tetap membersihkan konteks lokal dan mengarahkan pengguna keluar dari area internal.

## Hasil akhir

Sesi internal pengguna berakhir dan fitur privat tidak dapat diakses tanpa login ulang.

