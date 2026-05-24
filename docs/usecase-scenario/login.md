# Skenario UC-01: Login

Dokumen ini merinci use case **Login** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-01 |
| Use case diagram | Login |
| No requirements | 7 |
| Nama fungsional requirements | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem autentikasi dan manajemen sesi |

## Prasyarat

- Akun pengguna sudah terdaftar dan belum dinonaktifkan.
- Pengguna berada pada halaman masuk sistem.

## Pemicu

Pengguna ingin mengakses fitur internal sesuai peran.

## Alur utama

1. Pengguna mengisi identitas akun dan kata sandi.
2. Sistem memvalidasi format masukan.
3. Sistem mencari akun pengguna yang masih aktif.
4. Sistem memverifikasi kata sandi terhadap hash yang tersimpan.
5. Sistem memuat peran dan ruang lingkup akses pengguna.
6. Sistem menerbitkan sesi autentikasi.
7. Sistem mengarahkan pengguna ke dashboard sesuai peran.

## Alur alternatif

- Jika kredensial salah, sistem menolak login dan menampilkan pesan kegagalan.
- Jika akun sudah dinonaktifkan, sistem menolak akses.
- Jika sesi lama masih ada, sistem dapat memperbarui sesi yang valid.

## Hasil akhir

Pengguna memiliki sesi aktif dan dapat mengakses use case internal yang diizinkan oleh perannya.

