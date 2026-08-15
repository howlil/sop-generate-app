# Sequence Diagram: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22 |
| Tujuan | Menggambarkan interaksi pengunjung dan sistem saat mencari dan melihat SOP yang tersedia pada arsip publik. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Melihat Arsip Publik SOP
autonumber
autoactivate on

actor "Pengunjung" as A
boundary "Arsip Publik SOP" as B
control "Pengelola Arsip Publik" as C
entity "SOP Berlaku" as D

A -> B : Membuka arsip publik
B -> C : Meminta daftar SOP
C -> D : Mengambil SOP yang tersedia untuk publik
D --> C : Daftar SOP
C --> B : Mengirim daftar SOP
B --> A : Menampilkan arsip SOP

A -> B : Memilih SOP
B -> C : Meminta dokumen SOP
C -> D : Mengambil dokumen SOP
D --> C : Dokumen SOP
C --> B : Mengirim dokumen
B --> A : Menampilkan dokumen SOP

@enduml
```
