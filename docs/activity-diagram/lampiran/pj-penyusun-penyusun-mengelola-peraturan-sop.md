# Diagram Aktivitas: PJ Penyusun/Penyusun - Mengelola Peraturan SOP

Sumber use case: `UC-18` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Peraturan SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 5 |
| Tujuan | Menjelaskan proses pengguna mengelola peraturan yang menjadi dasar hukum penyusunan SOP. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Peraturan SOP

|PJ Penyusun / Penyusun|
start
:Membuka halaman peraturan SOP;

|Sistem|
:Memeriksa hak akses pengguna pada OPD;
:Menampilkan daftar peraturan yang tersedia;

|PJ Penyusun / Penyusun|
:Memilih tambah atau menggunakan peraturan yang sudah ada;
:Mengisi nomor, tahun, dan keterangan peraturan;
:Menyimpan peraturan;

|Sistem|
:Memeriksa kelengkapan data peraturan;
:Memeriksa apakah peraturan sudah terdaftar;
if (Peraturan dapat digunakan?) then (Ya)
  :Menyimpan peraturan atau menghubungkan peraturan yang sudah ada;
  :Menampilkan pemberitahuan berhasil;
else (Tidak)
  :Menolak penyimpanan;
  :Menampilkan alasan data belum sesuai;
endif

stop
@enduml
```

