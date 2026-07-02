# Diagram Aktivitas: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menjelaskan proses PJ Evaluator melihat grafik dan ringkasan evaluasi tahunan per OPD. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Melihat Hasil Penilaian OPD

|PJ Evaluator|
start
:Membuka halaman grafik evaluasi;
:Memilih tahun, OPD, atau filter laporan;

|Sistem|
:Memeriksa sesi dan peran PJ Evaluator;
:Memvalidasi filter tahun dan OPD;
:Mengolah data pengajuan selesai, nilai OPD, tanggal evaluasi, dan status terkait;

if (Data tersedia?) then (Ya)
  :Menampilkan grafik tahunan, tabel OPD, ringkasan nilai, dan tren evaluasi;
else (Tidak)
  :Menampilkan informasi belum ada data evaluasi untuk filter yang dipilih;
endif

|PJ Evaluator|
:Meninjau hasil penilaian dan membandingkan capaian OPD;

stop
@enduml
```
