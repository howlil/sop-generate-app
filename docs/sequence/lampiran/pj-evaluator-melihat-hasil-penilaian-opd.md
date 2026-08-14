# Sequence Diagram: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat melihat ringkasan hasil evaluasi OPD. |

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
boundary "Halaman Hasil Penilaian OPD" as B
control "Pengelola Laporan Evaluasi" as C
entity "Hasil Evaluasi OPD" as D

A -> B : Membuka hasil penilaian OPD
B -> C : Meminta ringkasan penilaian
C -> D : Mengambil hasil evaluasi
D --> C : Data hasil evaluasi
C --> B : Mengirim ringkasan penilaian
B --> A : Menampilkan grafik dan ringkasan OPD

opt Memilih periode penilaian
  A -> B : Menentukan periode
  B -> C : Meminta hasil sesuai periode
  C -> D : Mengambil hasil sesuai periode
  D --> C : Data periode terpilih
  C --> B : Mengirim hasil penilaian
  B --> A : Memperbarui tampilan hasil
end

@enduml
```
