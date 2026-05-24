# Skenario UC-16: Inisiasi Dokumen SOP

Dokumen ini merinci use case **Inisiasi Dokumen SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-16 |
| Use case diagram | Inisiasi Dokumen SOP |
| No requirements | 10 |
| Nama fungsional requirements | Penyusunan dan Pengelolaan Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem katalog dan versi SOP |

## Prasyarat

- Aktor sudah login sebagai PJ Penyusun atau Penyusun.
- Aktor memiliki akses pada OPD tempat SOP dibuat.

## Pemicu

Aktor membuat SOP baru atau versi baru dari SOP yang sudah berlaku.

## Alur utama

1. Aktor memilih aksi buat SOP baru.
2. Sistem menampilkan formulir inisiasi dokumen.
3. Aktor mengisi data awal, seperti judul, nomor, OPD, dan metadata yang diperlukan.
4. Sistem memvalidasi data wajib dan keunikan nomor SOP.
5. Sistem membuat entitas SOP dan detail versi awal.
6. Sistem menetapkan status awal sebagai draft.
7. Sistem membuka workbench agar aktor dapat melanjutkan UC-15 Menyusun Draft SOP.

## Alur alternatif

- Jika nomor SOP sudah digunakan, sistem menolak pembuatan.
- Jika aktor membuat versi baru dari SOP berlaku, sistem menyalin data relevan dari versi lama dan membuat draft versi berikutnya.
- Jika data wajib belum lengkap, sistem menolak inisiasi.

## Hasil akhir

Wadah dokumen SOP tersedia sebagai draft untuk disusun lebih lanjut.

