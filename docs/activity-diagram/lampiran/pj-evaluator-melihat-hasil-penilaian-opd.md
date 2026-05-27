# Diagram Aktivitas: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menjelaskan proses PJ Evaluator melihat rekap hasil penilaian SOP pada OPD. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Melihat Hasil Penilaian OPD

|PJ Evaluator|
start
:Membuka halaman laporan hasil penilaian OPD;
:Memilih periode atau filter laporan;

|Sistem|
:Memeriksa hak akses PJ Evaluator;
:Mengambil data hasil evaluasi SOP;
if (Data hasil penilaian tersedia?) then (Ya)
  :Mengolah data menjadi ringkasan dan grafik;
  :Menampilkan grafik serta tabel hasil penilaian;
else (Tidak)
  :Menampilkan informasi bahwa data penilaian belum tersedia;
endif

|PJ Evaluator|
:Meninjau hasil penilaian OPD;

stop
@enduml
```

