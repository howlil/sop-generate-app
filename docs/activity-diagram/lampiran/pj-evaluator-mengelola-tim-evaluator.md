# Diagram Aktivitas: PJ Evaluator - Mengelola Tim Evaluator

Sumber use case: `UC-06` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Evaluator |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 2 |
| Tujuan | Menjelaskan proses PJ Evaluator mengelola akun evaluator yang bertugas menilai SOP. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Tim Evaluator

|PJ Evaluator|
start
:Membuka halaman tim evaluator;

|Sistem|
:Memeriksa hak akses PJ Evaluator;
:Menampilkan daftar evaluator;

|PJ Evaluator|
:Memilih tambah, ubah, atau nonaktifkan evaluator;
:Mengisi data akun evaluator;
:Menyimpan perubahan;

|Sistem|
:Memeriksa kelengkapan data akun;
:Memeriksa apakah identitas akun sudah digunakan;
if (Data evaluator valid?) then (Ya)
  :Menyimpan data evaluator;
  :Menampilkan pemberitahuan berhasil;
else (Tidak)
  :Menolak penyimpanan;
  :Menampilkan alasan kegagalan;
endif

stop
@enduml
```

