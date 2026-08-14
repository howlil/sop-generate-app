# Diagram Aktivitas: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menggambarkan proses PJ Evaluator mengelola PJ Penyusun dan anggota Penyusun pada setiap OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengelola Tim Penyusun SOP

|PJ Evaluator|
start
:Membuka data tim penyusun SOP;

|Sistem|
:Menampilkan tim penyusun berdasarkan OPD;

|PJ Evaluator|
:Memilih tambah, ubah, pindah OPD, aktifkan, atau nonaktifkan anggota;
:Mengisi data dan peran anggota;

|Sistem|
:Memvalidasi data, OPD, dan penetapan PJ Penyusun;

if (Perubahan sesuai aturan?) then (Ya)
  :Menyimpan perubahan tim penyusun;
  :Menampilkan data terbaru;
else (Tidak)
  :Menampilkan alasan perubahan tidak dapat dilakukan;
endif

stop

@enduml
```
