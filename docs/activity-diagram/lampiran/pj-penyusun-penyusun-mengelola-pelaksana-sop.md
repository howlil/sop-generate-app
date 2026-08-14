# Diagram Aktivitas: PJ Penyusun/Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menggambarkan proses PJ Penyusun atau Penyusun mengelola daftar pelaksana SOP pada OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Pelaksana SOP

|PJ Penyusun / Penyusun|
start
:Membuka data pelaksana SOP;

|Sistem|
:Menampilkan daftar pelaksana pada OPD pengguna;

|PJ Penyusun / Penyusun|
:Memilih tambah, ubah, atau hapus pelaksana;
:Mengisi atau memilih data pelaksana;

|Sistem|
:Memvalidasi perubahan data pelaksana;

if (Perubahan dapat dilakukan?) then (Ya)
  :Menyimpan perubahan pelaksana;
  :Menampilkan daftar pelaksana terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
