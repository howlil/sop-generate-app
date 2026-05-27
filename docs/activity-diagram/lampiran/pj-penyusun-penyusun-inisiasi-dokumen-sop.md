# Diagram Aktivitas: PJ Penyusun/Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menjelaskan proses pengguna membuat wadah awal dokumen SOP sebelum draft disusun. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Inisiasi Dokumen SOP

|PJ Penyusun / Penyusun|
start
:Membuka halaman pembuatan SOP baru;

|Sistem|
:Memeriksa hak akses pengguna pada OPD;
:Menampilkan formulir data awal SOP;

|PJ Penyusun / Penyusun|
:Mengisi judul, nomor, dan informasi awal SOP;
:Mengirim data pembuatan SOP;

|Sistem|
:Memeriksa kelengkapan data awal SOP;
:Memeriksa apakah nomor SOP sudah digunakan;
if (Data awal dapat digunakan?) then (Ya)
  :Membuat dokumen SOP baru sebagai draft;
  :Menampilkan halaman penyusunan draft SOP;
else (Tidak)
  :Menolak pembuatan SOP;
  :Menampilkan alasan, misalnya nomor SOP sudah digunakan;
endif

stop
@enduml
```

