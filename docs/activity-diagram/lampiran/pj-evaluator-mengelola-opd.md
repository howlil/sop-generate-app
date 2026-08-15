# Diagram Aktivitas: PJ Evaluator - Mengelola OPD

Sumber use case: `UC-05` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 1 |
| Tujuan | Menggambarkan proses PJ Evaluator menambah, mengubah, atau menghapus data OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola OPD

|PJ Evaluator|
start
:Membuka pengelolaan OPD;

|Sistem|
:Menampilkan daftar OPD;

|PJ Evaluator|
:Memilih tindakan pengelolaan;
:Menambah, mengubah, atau menghapus data OPD;

|Sistem|
:Memproses perubahan data OPD;

if (Perubahan dapat diterapkan?) then (Ya)
  :Menampilkan data OPD terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
