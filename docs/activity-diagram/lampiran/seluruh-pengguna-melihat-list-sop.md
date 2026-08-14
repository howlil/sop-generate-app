# Diagram Aktivitas: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Tidak memiliki nomor tersendiri |
| Tujuan | Menggambarkan proses pengguna melihat dan memilih SOP sesuai cakupan aksesnya. |

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
:Menentukan cakupan SOP sesuai peran dan OPD pengguna;
:Menampilkan daftar SOP yang dapat diakses;

|Pengguna|
:Melakukan pencarian atau penyaringan bila diperlukan;

|Sistem|
:Memperbarui daftar SOP sesuai pilihan pengguna;

|Pengguna|
if (Memilih salah satu SOP?) then (Ya)
  :Membuka SOP yang dipilih;

  |Sistem|
  :Menampilkan informasi dan dokumen SOP;
else (Tidak)
  :Tetap melihat daftar SOP;
endif

stop

@enduml
```
