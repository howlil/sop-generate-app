# Sequence Diagram: PJ Penyusun / Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan interaksi penyusun dan sistem saat memulai dokumen SOP baru atau versi baru. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Inisiasi Dokumen SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Inisiasi SOP" as B
control "Pengelola SOP" as C
entity "SOP" as D

A -> B : Memilih pembuatan SOP atau versi baru
B -> C : Meminta inisiasi dokumen
C -> D : Membuat draft awal
D --> C : Draft SOP dibuat
C --> B : Mengirim hasil inisiasi
B --> A : Membuka draft untuk disusun

@enduml
```
