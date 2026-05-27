# Diagram Aktivitas: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22 |
| Tujuan | Menjelaskan proses pengunjung melihat dokumen SOP yang sudah berlaku tanpa login. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Melihat Arsip Publik SOP

|Pengunjung|
start
:Membuka halaman arsip publik SOP;

|Sistem|
:Menampilkan daftar SOP yang sudah berlaku;

|Pengunjung|
:Mengisi kata kunci atau filter pencarian;

|Sistem|
:Mencari SOP sesuai kata kunci atau filter;
if (SOP ditemukan?) then (Ya)
  :Menampilkan daftar hasil pencarian;
else (Tidak)
  :Menampilkan informasi bahwa SOP tidak ditemukan;
  stop
endif

|Pengunjung|
:Memilih SOP yang ingin dilihat;

|Sistem|
:Menampilkan detail atau pratinjau dokumen SOP;

stop
@enduml
```

