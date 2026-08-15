# Diagram Aktivitas: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menggambarkan proses PJ Evaluator menetapkan dan memperbarui Kepala OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Kepala OPD

|PJ Evaluator|
start
:Membuka pengelolaan Kepala OPD;

|Sistem|
:Menampilkan data Kepala OPD pada setiap OPD;

|PJ Evaluator|
:Memilih OPD;
:Menambah atau memperbarui Kepala OPD;

|Sistem|
:Memproses penetapan Kepala OPD;

if (Penetapan dapat dilakukan?) then (Ya)
  :Menampilkan Kepala OPD yang berlaku;
else (Tidak)
  :Menampilkan alasan penetapan tidak dapat dilakukan;
endif

stop

@enduml
```
