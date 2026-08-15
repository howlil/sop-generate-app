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
:Membuka pengelolaan tim evaluator;

|Sistem|
:Menampilkan anggota tim evaluator;

|PJ Evaluator|
:Memilih anggota atau menambahkan anggota baru;
:Menentukan perubahan data atau status anggota;

|Sistem|
:Memproses perubahan tim evaluator;

if (Perubahan dapat diterapkan?) then (Ya)
  :Menampilkan susunan tim evaluator terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
