# Diagram Aktivitas: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menggambarkan proses PJ Evaluator melihat ringkasan hasil penilaian SOP pada OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Melihat Hasil Penilaian OPD

|PJ Evaluator|
start
:Membuka hasil penilaian OPD;

|Sistem|
:Menampilkan ringkasan hasil penilaian;

|PJ Evaluator|
:Memilih periode atau cakupan data bila diperlukan;

|Sistem|
:Menampilkan hasil sesuai pilihan;

|PJ Evaluator|
:Meninjau hasil penilaian OPD;

stop

@enduml
```
