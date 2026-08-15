# Diagram Aktivitas: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menggambarkan proses evaluator memberikan catatan perbaikan pada SOP yang memerlukan tindak lanjut. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Membuat Komentar

|Evaluator|
start
:Memilih SOP yang memerlukan perbaikan;
:Menulis komentar perbaikan;
:Menyimpan komentar;

|Sistem|
:Menyimpan catatan evaluasi;
:Menampilkan komentar pada hasil evaluasi;

|Evaluator|
:Meninjau komentar yang telah disimpan;

stop

@enduml
```
