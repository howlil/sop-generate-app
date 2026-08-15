# Diagram Aktivitas: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Tidak memiliki nomor tersendiri |
| Tujuan | Menggambarkan proses pengguna melihat, mencari, dan memilih SOP yang dapat diakses. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Melihat List SOP

|Pengguna|
start
:Membuka daftar SOP;

|Sistem|
:Menampilkan SOP yang dapat diakses pengguna;

|Pengguna|
:Melakukan pencarian atau penyaringan bila diperlukan;

|Sistem|
:Menampilkan daftar sesuai pilihan pengguna;

|Pengguna|
:Memilih SOP yang ingin dilihat;

|Sistem|
:Menampilkan informasi SOP yang dipilih;

stop

@enduml
```
