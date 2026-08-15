# Sequence Diagram: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat melihat ringkasan hasil penilaian OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Melihat Hasil Penilaian OPD
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Hasil Penilaian" as B
control "Pengelola Penilaian OPD" as C
entity "Hasil Evaluasi" as D

A -> B : Membuka hasil penilaian OPD
A -> B : Memilih periode
B -> C : Meminta ringkasan penilaian
C -> D : Mengambil hasil evaluasi
D --> C : Data penilaian OPD
C --> B : Mengirim ringkasan penilaian
B --> A : Menampilkan grafik dan ringkasan OPD

@enduml
```
