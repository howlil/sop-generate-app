# Diagram Aktivitas: PJ Penyusun/Penyusun - Mengelola Peraturan SOP

Sumber use case: `UC-18` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Peraturan SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 5 |
| Tujuan | Menggambarkan proses PJ Penyusun atau Penyusun mengelola peraturan yang digunakan sebagai dasar hukum SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Peraturan SOP

|PJ Penyusun / Penyusun|
start
:Membuka pengelolaan peraturan SOP;

|Sistem|
:Menampilkan daftar peraturan pada OPD;

|PJ Penyusun / Penyusun|
:Memilih tindakan pengelolaan;
:Menambah, mengubah, atau menghapus peraturan;

|Sistem|
:Memproses perubahan data peraturan;

if (Perubahan dapat dilakukan?) then (Ya)
  :Menampilkan daftar peraturan terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
