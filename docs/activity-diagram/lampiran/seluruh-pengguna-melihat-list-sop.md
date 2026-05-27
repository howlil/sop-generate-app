# Diagram Aktivitas: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Tidak memiliki nomor tersendiri |
| Tujuan | Menjelaskan proses pengguna melihat daftar SOP sesuai hak akses masing-masing. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Melihat List SOP

|Pengguna|
start
:Membuka halaman daftar SOP;

|Sistem|
:Memeriksa peran dan ruang lingkup akses pengguna;
:Mencari daftar SOP yang boleh dilihat pengguna;
if (Data SOP tersedia?) then (Ya)
  :Menampilkan daftar SOP beserta statusnya;
else (Tidak)
  :Menampilkan informasi bahwa belum ada SOP yang tersedia;
endif

|Pengguna|
:Memilih SOP untuk melihat detail atau melanjutkan proses;

|Sistem|
:Menampilkan detail SOP sesuai hak akses pengguna;

stop
@enduml
```

