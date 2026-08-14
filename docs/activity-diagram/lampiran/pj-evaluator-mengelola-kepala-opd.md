# Diagram Aktivitas: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menggambarkan proses PJ Evaluator mengelola penugasan dan data Kepala OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Kepala OPD

|PJ Evaluator|
start
:Membuka data Kepala OPD;

|Sistem|
:Menampilkan daftar Kepala OPD beserta OPD-nya;

|PJ Evaluator|
:Memilih tambah, ubah, pindah OPD, atau nonaktifkan Kepala OPD;
:Mengisi data yang diperlukan;

|Sistem|
:Memvalidasi data dan penugasan Kepala OPD;

if (Penugasan sesuai aturan?) then (Ya)
  :Menyimpan perubahan Kepala OPD;
  :Menampilkan data terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
