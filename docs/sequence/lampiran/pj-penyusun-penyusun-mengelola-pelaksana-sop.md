# Sequence Diagram: PJ Penyusun / Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun / Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menggambarkan interaksi penyusun dan sistem saat mengelola data pelaksana yang digunakan dalam SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengelola Pelaksana SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Pelaksana SOP" as B
control "Pengelola Pelaksana SOP" as C
entity "Data Pelaksana SOP" as D

A -> B : Membuka data Pelaksana SOP
B -> C : Meminta daftar pelaksana SOP
C -> D : Mengambil data pelaksana SOP
D --> C : Daftar pelaksana SOP
C --> B : Mengirim daftar pelaksana SOP
B --> A : Menampilkan data pelaksana SOP

A -> B : Memilih tambah, ubah, atau hapus
B -> C : Meminta perubahan data
C -> D : Menyimpan perubahan
D --> C : Hasil perubahan
C --> B : Mengirim hasil pengelolaan
B --> A : Menampilkan data terbaru atau alasan perubahan ditolak

@enduml
```
