# Diagram Aktivitas: PJ Evaluator - Mengelola OPD

Sumber use case: `UC-05` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 1 |
| Tujuan | Menjelaskan proses PJ Evaluator melihat, menambah, mengubah, dan menonaktifkan data OPD. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola OPD

|PJ Evaluator|
start
:Membuka halaman manajemen OPD;

|Sistem|
:Memeriksa sesi dan peran PJ Evaluator;
:Menampilkan daftar OPD aktif, pencarian, dan aksi tambah, ubah, atau nonaktifkan;

|PJ Evaluator|
:Memilih aksi tambah, ubah, atau nonaktifkan OPD;

if (Aksi tambah atau ubah?) then (Ya)
  :Mengisi atau memperbarui nama OPD;
else (Nonaktifkan)
  :Mengonfirmasi penonaktifan OPD;
endif

:Menyimpan aksi OPD;

|Sistem|
:Memvalidasi kewenangan, nama OPD, keunikan data, dan relasi yang masih memakai OPD;

if (Data valid dan aturan terpenuhi?) then (Ya)
  :Menyimpan OPD baru, memperbarui nama, atau menonaktifkan OPD;
  :Menampilkan daftar OPD terbaru dan notifikasi berhasil;
else (Tidak)
  :Menampilkan alasan kegagalan seperti data duplikat, tidak ditemukan, atau masih digunakan;
endif

stop
@enduml
```
