# Diagram Aktivitas: PJ Penyusun/Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menjelaskan proses pengguna mengelola data pelaksana yang digunakan dalam penyusunan SOP. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Pelaksana SOP

|PJ Penyusun / Penyusun|
start
:Membuka halaman pelaksana SOP;

|Sistem|
:Memeriksa hak akses pengguna pada OPD;
:Menampilkan daftar pelaksana SOP;

|PJ Penyusun / Penyusun|
:Memilih tambah, ubah, atau hapus pelaksana;
:Mengisi data pelaksana;
:Menyimpan perubahan;

|Sistem|
:Memeriksa kelengkapan data pelaksana;
if (Data pelaksana valid?) then (Ya)
  :Menyimpan data pelaksana;
  :Menampilkan pemberitahuan berhasil;
else (Tidak)
  :Menolak penyimpanan;
  :Menampilkan alasan data belum sesuai;
endif

stop
@enduml
```

