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
:Membuka data OPD;

|Sistem|
:Menampilkan daftar OPD;

|PJ Evaluator|
:Memilih tambah, ubah, atau hapus OPD;
:Mengisi atau memilih data yang diperlukan;

|Sistem|
:Memvalidasi perubahan data OPD;

if (Perubahan dapat dilakukan?) then (Ya)
  :Menyimpan perubahan data OPD;
  :Menampilkan daftar OPD terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
