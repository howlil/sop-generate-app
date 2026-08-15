# Sequence Diagram: PJ Penyusun / Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan interaksi penyusun dan sistem saat mengisi dan menyimpan draft SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Menyusun Draft SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Ruang Penyusunan SOP" as B
control "Pengelola Draft SOP" as C
entity "Draft SOP" as D

A -> B : Membuka draft SOP
B -> C : Meminta isi draft
C -> D : Mengambil draft SOP
D --> C : Data draft
C --> B : Mengirim draft
B --> A : Menampilkan draft SOP

A -> B : Mengisi atau memperbarui draft
B -> C : Meminta penyimpanan draft
C -> D : Menyimpan perubahan
D --> C : Draft diperbarui
C --> B : Mengirim hasil penyimpanan
B --> A : Menampilkan draft terbaru

@enduml
```
