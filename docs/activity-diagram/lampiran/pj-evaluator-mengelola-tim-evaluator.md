# Diagram Aktivitas: PJ Evaluator - Mengelola Tim Evaluator

Sumber use case: `UC-06` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Evaluator |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 2 |
| Tujuan | Menggambarkan proses PJ Evaluator mengelola anggota tim evaluator. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Tim Evaluator

|PJ Evaluator|
start
:Membuka data tim evaluator;

|Sistem|
:Menampilkan anggota tim evaluator;

|PJ Evaluator|
:Memilih tambah, ubah, atau nonaktifkan anggota;
:Mengisi data anggota evaluator;

|Sistem|
:Memvalidasi data dan perubahan yang dipilih;

if (Data valid?) then (Ya)
  :Menyimpan perubahan anggota evaluator;
  :Menampilkan tim evaluator terbaru;
else (Tidak)
  :Menampilkan informasi yang perlu diperbaiki;
endif

stop

@enduml
```
