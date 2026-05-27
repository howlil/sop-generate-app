# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menjelaskan proses penandatanganan berita acara evaluasi oleh PJ Evaluator dan PJ Penyusun secara berurutan. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Menandatangani Berita Acara

|PJ Evaluator|
start
:Membuka daftar pengajuan yang telah selesai dievaluasi;

|Sistem|
:Memeriksa hak akses PJ Evaluator dan status pengajuan;
:Menampilkan pengajuan yang dapat ditandatangani oleh PJ Evaluator;

|PJ Evaluator|
:Memilih pengajuan evaluasi;
:Memasukkan PIN tanda tangan elektronik;
:Mengirim permintaan tanda tangan berita acara;

|Sistem|
:Memeriksa kebenaran PIN PJ Evaluator;
if (PIN dan status pengajuan sesuai?) then (Ya)
  :Mencatat tanda tangan PJ Evaluator pada berita acara;
  :Mengubah pengajuan ke tahap menunggu tanda tangan PJ Penyusun;
else (Tidak)
  :Menolak proses tanda tangan;
  :Menampilkan alasan kegagalan;
  stop
endif

|PJ Penyusun|
:Membuka daftar pengajuan yang menunggu tanda tangan PJ Penyusun;

|Sistem|
:Memeriksa hak akses PJ Penyusun, OPD, dan status pengajuan;
:Menampilkan pengajuan yang dapat ditandatangani oleh PJ Penyusun;

|PJ Penyusun|
:Memilih pengajuan evaluasi;
:Memasukkan PIN tanda tangan elektronik;
:Mengirim permintaan tanda tangan berita acara;

|Sistem|
:Memeriksa kebenaran PIN PJ Penyusun;
if (PIN dan status pengajuan sesuai?) then (Ya)
  :Mencatat tanda tangan PJ Penyusun pada berita acara;
  :Mengubah pengajuan ke tahap siap disahkan;
  :Menampilkan pemberitahuan bahwa berita acara berhasil ditandatangani;
else (Tidak)
  :Menolak proses tanda tangan;
  :Menampilkan alasan kegagalan;
endif

stop
@enduml
```

