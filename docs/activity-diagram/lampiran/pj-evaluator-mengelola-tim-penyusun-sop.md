# Diagram Aktivitas: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menggambarkan proses PJ Evaluator mengelola PJ Penyusun dan anggota tim penyusun SOP pada OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Tim Penyusun SOP

|PJ Evaluator|
start
:Membuka pengelolaan tim penyusun SOP;

|Sistem|
:Menampilkan tim penyusun berdasarkan OPD;

|PJ Evaluator|
:Memilih OPD dan anggota tim;
:Menambah, memperbarui, atau mengubah status anggota;
:Menentukan PJ Penyusun bila diperlukan;

|Sistem|
:Memproses perubahan susunan tim;

if (Susunan tim dapat diterapkan?) then (Ya)
  :Menampilkan tim penyusun terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
