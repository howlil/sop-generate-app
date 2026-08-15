# Diagram Aktivitas: PJ Penyusun/Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan proses PJ Penyusun atau Penyusun memulai draft SOP baru atau versi baru dari SOP yang ada. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Inisiasi Dokumen SOP

|PJ Penyusun / Penyusun|
start
:Membuka pembuatan dokumen SOP;
:Memilih membuat SOP baru atau versi baru;

if (Membuat versi baru?) then (Ya)
  :Memilih SOP yang akan dijadikan dasar;
else (Tidak)
  :Mengisi informasi awal SOP;
endif

|Sistem|
:Membuat draft SOP;

|PJ Penyusun / Penyusun|
:Membuka draft yang telah dibuat;

|Sistem|
:Menampilkan ruang penyusunan SOP;

stop

@enduml
```
