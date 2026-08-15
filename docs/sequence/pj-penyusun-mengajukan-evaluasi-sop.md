# Sequence Diagram: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menggambarkan interaksi PJ Penyusun dan sistem saat mengajukan SOP yang telah siap untuk dievaluasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengajukan Evaluasi SOP
autonumber
autoactivate on

actor "PJ Penyusun" as A
boundary "Halaman Pengajuan Evaluasi" as B
control "Pengelola Pengajuan" as C
entity "SOP dan Pengajuan Evaluasi" as D

A -> B : Membuka pengajuan evaluasi
B -> C : Meminta SOP yang siap diajukan
C -> D : Mengambil SOP yang tersedia
D --> C : Daftar SOP
C --> B : Mengirim daftar SOP
B --> A : Menampilkan SOP yang dapat diajukan

A -> B : Memilih SOP dan mengajukan evaluasi
B -> C : Meminta pembuatan pengajuan
C -> D : Membuat pengajuan evaluasi
D --> C : Pengajuan dibuat
C --> B : Mengirim hasil pengajuan
B --> A : Menampilkan pengajuan berhasil dibuat

@enduml
```
