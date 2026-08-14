# Diagram Aktivitas: PJ Penyusun/Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan proses PJ Penyusun atau Penyusun memulai dokumen SOP baru atau versi baru untuk disusun. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Inisiasi Dokumen SOP

|PJ Penyusun / Penyusun|
start
:Membuka menu inisiasi dokumen SOP;
:Memilih membuat SOP baru atau versi baru;

if (Membuat SOP baru?) then (Ya)
  :Mengisi informasi awal SOP;
else (Tidak)
  :Memilih versi SOP yang akan dijadikan sumber;
endif

|Sistem|
:Memvalidasi hak akses dan data awal;

if (Data dapat digunakan?) then (Ya)
  :Membuat draft SOP;
  :Menampilkan draft untuk dilanjutkan ke proses penyusunan;
else (Tidak)
  :Menampilkan alasan dokumen belum dapat dibuat;
endif

stop

@enduml
```
