# Sequence Diagram: PJ Evaluator / PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menggambarkan interaksi pengguna dan sistem saat menyiapkan atau memperbarui tanda tangan elektronik. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Membuat Tanda Tangan Elektronik
autonumber
autoactivate on

actor "PJ Evaluator / PJ Penyusun" as A
boundary "Pengaturan TTE" as B
control "Pengelola TTE" as C
entity "Profil TTE" as D

A -> B : Membuka pengaturan TTE
B -> C : Meminta profil TTE
C -> D : Mengambil profil TTE
D --> C : Profil TTE
C --> B : Mengirim profil TTE
B --> A : Menampilkan status TTE

A -> B : Mengatur atau memperbarui TTE
B -> C : Meminta penyimpanan pengaturan
C -> D : Menyimpan profil TTE
D --> C : Profil diperbarui
C --> B : Mengirim hasil pengaturan
B --> A : Menampilkan TTE siap digunakan

@enduml
```
