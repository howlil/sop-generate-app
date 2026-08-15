# Diagram Aktivitas: PJ Penyusun/Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menggambarkan proses PJ Penyusun atau Penyusun mengelola data pelaksana yang digunakan dalam penyusunan SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Pelaksana SOP

|PJ Penyusun / Penyusun|
start
:Membuka pengelolaan pelaksana SOP;

|Sistem|
:Menampilkan daftar pelaksana pada OPD;

|PJ Penyusun / Penyusun|
:Memilih tindakan pengelolaan;
:Menambah, mengubah, atau menghapus pelaksana;

|Sistem|
:Memproses perubahan data pelaksana;

if (Perubahan dapat dilakukan?) then (Ya)
  :Menampilkan daftar pelaksana terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
