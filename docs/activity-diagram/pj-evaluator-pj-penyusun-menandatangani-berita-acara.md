# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menggambarkan penandatanganan Berita Acara secara berurutan oleh PJ Evaluator dan PJ Penyusun. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Menandatangani Berita Acara

|PJ Evaluator|
start
:Membuka pengajuan yang selesai dievaluasi;
:Meninjau Berita Acara;
:Memilih tanda tangani dan memasukkan PIN TTE;

|Sistem|
:Memvalidasi kewenangan, PIN TTE, dan status pengajuan;

if (Tanda tangan PJ Evaluator valid?) then (Ya)
  :Mencatat tanda tangan PJ Evaluator;
  :Menyiapkan Berita Acara untuk PJ Penyusun;
else (Tidak)
  :Menampilkan alasan penandatanganan gagal;
  stop
endif

|PJ Penyusun|
:Membuka Berita Acara yang menunggu tanda tangan;
:Meninjau Berita Acara;
:Memilih tanda tangani dan memasukkan PIN TTE;

|Sistem|
:Memvalidasi kewenangan, PIN TTE, dan urutan penandatanganan;

if (Tanda tangan PJ Penyusun valid?) then (Ya)
  :Mencatat tanda tangan PJ Penyusun;
  :Menandai Berita Acara selesai ditandatangani;
  :Menyiapkan SOP untuk pengesahan Kepala OPD;
else (Tidak)
  :Menampilkan alasan penandatanganan gagal;
endif

stop

@enduml
```
