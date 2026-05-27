# Diagram Aktivitas: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menjelaskan proses PJ Evaluator menetapkan atau memperbarui Kepala OPD yang aktif. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Kepala OPD

|PJ Evaluator|
start
:Membuka halaman pengelolaan Kepala OPD;

|Sistem|
:Memeriksa hak akses PJ Evaluator;
:Menampilkan daftar Kepala OPD dan OPD terkait;

|PJ Evaluator|
:Memilih OPD yang akan diatur;
:Mengisi atau memperbarui data Kepala OPD;
:Menyimpan perubahan;

|Sistem|
:Memeriksa kelengkapan data akun;
:Memeriksa apakah OPD sudah memiliki Kepala OPD aktif;
if (Data dapat disimpan?) then (Ya)
  :Menyimpan data Kepala OPD;
  :Menampilkan pemberitahuan berhasil;
else (Tidak)
  :Menolak penyimpanan;
  :Menampilkan alasan, misalnya Kepala OPD aktif sudah ada;
endif

stop
@enduml
```

