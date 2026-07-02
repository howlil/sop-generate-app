# Diagram Aktivitas: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menjelaskan proses PJ Evaluator menetapkan Kepala OPD aktif, memperbarui data, dan melihat riwayat penugasan. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Kepala OPD

|PJ Evaluator|
start
:Membuka tab Kepala OPD;

|Sistem|
:Memeriksa sesi dan peran PJ Evaluator;
:Menampilkan daftar Kepala OPD, OPD aktif, status penugasan, dan riwayat penugasan;

|PJ Evaluator|
:Memilih tambah, ubah, nonaktifkan, atau lihat riwayat Kepala OPD;

if (Melihat riwayat?) then (Ya)
  |Sistem|
  :Menampilkan riwayat penugasan Kepala OPD pada OPD terkait;
  stop
else (Mengelola data)
endif

|PJ Evaluator|
:Memilih OPD dan mengisi identitas Kepala OPD;
:Menyimpan perubahan;

|Sistem|
:Memvalidasi field akun, email atau NIP unik, OPD aktif, dan aturan satu Kepala OPD aktif per OPD;

if (Aturan terpenuhi?) then (Ya)
  :Menyimpan akun Kepala OPD;
  :Memperbarui penugasan aktif dan riwayat OPD pengguna;
  :Menampilkan daftar terbaru dan notifikasi berhasil;
else (Tidak)
  :Menampilkan alasan seperti OPD sudah memiliki Kepala OPD aktif atau identitas duplikat;
endif

stop
@enduml
```
