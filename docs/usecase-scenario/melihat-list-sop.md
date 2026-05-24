# Skenario UC-03: Melihat List SOP

Dokumen ini merinci use case **Melihat List SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-03 |
| Use case diagram | Melihat List SOP |
| No requirements | Tidak ada baris requirements tersendiri |
| Nama fungsional requirements | Navigasi daftar dan monitoring SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem katalog SOP |

## Prasyarat

- Pengguna sudah login.
- Pengguna memiliki hak akses terhadap daftar SOP sesuai perannya.

## Pemicu

Pengguna membuka menu daftar, dashboard, atau workbench SOP.

## Alur utama

1. Pengguna membuka halaman daftar SOP.
2. Sistem membaca peran dan `opdId` dari sesi pengguna.
3. Sistem mengambil daftar SOP yang sesuai ruang lingkup akses.
4. Sistem menampilkan informasi ringkas, seperti judul, nomor, OPD, versi, dan status.
5. Pengguna memilih salah satu SOP untuk melihat detail atau melanjutkan pekerjaan sesuai kewenangan.

## Alur alternatif

- Jika daftar kosong, sistem menampilkan keadaan kosong yang sesuai konteks peran.
- Jika pengguna tidak berwenang melihat SOP tertentu, sistem tidak memasukkan SOP tersebut ke daftar atau menolak akses detail.

## Hasil akhir

Pengguna mendapatkan visibilitas terhadap SOP yang relevan sebagai titik masuk ke use case lanjutan.

