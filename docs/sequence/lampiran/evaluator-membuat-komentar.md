# Sequence Diagram: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menggambarkan interaksi evaluator dan sistem saat memberikan catatan perbaikan pada hasil evaluasi SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Membuat Komentar
autonumber
autoactivate on

actor "Evaluator" as A
boundary "Form Komentar Evaluasi" as B
control "Pengelola Evaluasi" as C
entity "Catatan Evaluasi" as D

A -> B : Menulis komentar perbaikan
B -> C : Meminta penyimpanan komentar
C -> D : Menyimpan catatan evaluasi
D --> C : Catatan tersimpan
C --> B : Mengirim komentar terbaru
B --> A : Menampilkan komentar tersimpan

@enduml
```
