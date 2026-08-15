# Sequence Diagram: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | — |
| Tujuan | Menggambarkan interaksi pengguna dan sistem saat melihat daftar SOP yang dapat diakses sesuai perannya. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Melihat List SOP
autonumber
autoactivate on

actor "Pengguna" as A
boundary "Halaman Daftar SOP" as B
control "Pengelola SOP" as C
entity "SOP" as D

A -> B : Membuka daftar SOP
B -> C : Meminta daftar SOP
C -> D : Mengambil SOP yang dapat diakses
D --> C : Daftar SOP
C --> B : Mengirim daftar SOP
B --> A : Menampilkan daftar SOP

opt Pengguna memilih salah satu SOP
  A -> B : Memilih SOP
  B -> C : Meminta detail SOP
  C -> D : Mengambil detail SOP
  D --> C : Detail SOP
  C --> B : Mengirim detail SOP
  B --> A : Menampilkan detail SOP
end

@enduml
```
