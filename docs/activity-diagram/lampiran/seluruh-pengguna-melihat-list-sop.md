# Diagram Aktivitas: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Tidak memiliki nomor tersendiri |
| Tujuan | Menjelaskan proses pengguna melihat daftar SOP sesuai peran, OPD, filter status, dan akses detail. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Melihat List SOP

|Pengguna|
start
:Membuka halaman daftar SOP sesuai peran;

|Sistem|
:Memeriksa sesi dan peran pengguna;
:Menyiapkan filter awal seperti status, tanggal, OPD, dan kata kunci;

if (Peran PJ Evaluator atau Evaluator?) then (Ya)
  :Menyiapkan cakupan daftar lintas OPD sesuai kewenangan;
else (Tidak)
  :Membatasi daftar pada OPD pengguna;
endif

:Mengambil daftar SOP versi terbaru sesuai cakupan akses;
:Menerapkan filter status, rentang tanggal, OPD, dan pencarian;
:Menentukan label status, versi, nomor SOP, OPD, dan aksi yang boleh dilakukan;

if (Data tersedia?) then (Ya)
  :Menampilkan tabel atau kartu daftar SOP, badge status, dan aksi sesuai peran;
else (Tidak)
  :Menampilkan informasi bahwa belum ada SOP sesuai filter;
endif

|Pengguna|
if (Memilih SOP?) then (Ya)
  :Membuka detail SOP;

  |Sistem|
  :Memeriksa hak akses pengguna terhadap SOP yang dipilih;
  :Memuat dokumen, langkah, diagram, riwayat, dan log yang boleh dilihat;
  :Menampilkan detail atau preview SOP;
else (Tidak)
  :Tetap di daftar SOP;
endif

stop
@enduml
```
