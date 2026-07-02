# Diagram Aktivitas: PJ Penyusun/Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menjelaskan pengelolaan master pelaksana OPD dan pemakaiannya pada langkah SOP. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Pelaksana SOP

|PJ Penyusun / Penyusun|
start
:Membuka halaman pelaksana atau panel pelaksana pada workbench SOP;

|Sistem|
:Memeriksa sesi, peran penyusun, dan akses OPD;
:Menampilkan daftar pelaksana OPD serta opsi tambah, ubah, hapus, dan tautkan ke SOP;

|PJ Penyusun / Penyusun|
:Memilih tambah, ubah, atau hapus pelaksana;

if (Tambah atau ubah pelaksana?) then (Ya)
  :Mengisi atau memperbarui nama pelaksana;
else (Hapus pelaksana)
  :Mengonfirmasi penghapusan pelaksana;
endif

:Menyimpan perubahan pelaksana;

|Sistem|
:Memvalidasi nama tidak kosong, OPD sesuai, dan nama pelaksana tidak duplikat pada OPD;

if (Aksi hapus dan pelaksana masih dipakai?) then (Ya)
  :Menolak penghapusan karena pelaksana masih digunakan pada SOP;
  :Menampilkan daftar penggunaan yang menghalangi penghapusan;
  stop
else (Tidak)
endif

:Menyimpan master pelaksana atau menghapus bila aman;
:Menampilkan daftar pelaksana terbaru;

|PJ Penyusun / Penyusun|
if (Pelaksana dipakai pada SOP?) then (Ya)
  :Memilih pelaksana untuk langkah prosedur SOP;

  |Sistem|
  :Memastikan pelaksana berasal dari OPD yang sama dengan SOP;
  :Menyimpan hubungan pelaksana dengan langkah SOP;
  :Memperbarui preview langkah prosedur;
else (Tidak)
  :Selesai mengelola master pelaksana;
endif

stop
@enduml
```
