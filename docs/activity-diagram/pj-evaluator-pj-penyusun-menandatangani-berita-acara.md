# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menggambarkan proses penandatanganan Berita Acara secara berurutan oleh PJ Evaluator dan PJ Penyusun. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Menandatangani Berita Acara

|PJ Evaluator|
start
:Membuka Berita Acara hasil evaluasi;
:Meninjau Berita Acara;
:Menandatangani Berita Acara menggunakan PIN TTE;

|Sistem|
:Memproses penandatanganan PJ Evaluator;

if (Penandatanganan berhasil?) then (Ya)
  :Menampilkan Berita Acara menunggu tanda tangan PJ Penyusun;
else (Tidak)
  :Menampilkan alasan penandatanganan gagal;
  stop
endif

|PJ Penyusun|
:Membuka Berita Acara;
:Meninjau Berita Acara;
:Menandatangani Berita Acara menggunakan PIN TTE;

|Sistem|
:Memproses penandatanganan PJ Penyusun;

if (Penandatanganan berhasil?) then (Ya)
  :Menampilkan Berita Acara selesai ditandatangani;
else (Tidak)
  :Menampilkan alasan penandatanganan gagal;
endif

stop

@enduml
```
