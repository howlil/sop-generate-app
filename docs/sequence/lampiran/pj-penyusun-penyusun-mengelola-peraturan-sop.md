# Sequence Diagram: PJ Penyusun / Penyusun - Mengelola Peraturan SOP

Sumber use case: `UC-18` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Peraturan SOP |
| Aktor utama | PJ Penyusun / Penyusun |
| Nomor kebutuhan fungsional | 5 |
| Tujuan | Menggambarkan interaksi penyusun dan sistem saat mengelola peraturan yang digunakan sebagai dasar hukum SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengelola Peraturan SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Peraturan SOP" as B
control "Pengelola Peraturan SOP" as C
entity "Data Peraturan SOP" as D

A -> B : Membuka data Peraturan SOP
B -> C : Meminta daftar peraturan SOP
C -> D : Mengambil data peraturan SOP
D --> C : Daftar peraturan SOP
C --> B : Mengirim daftar peraturan SOP
B --> A : Menampilkan data peraturan SOP

A -> B : Memilih tambah, ubah, atau hapus
B -> C : Meminta perubahan data
C -> D : Menyimpan perubahan
D --> C : Hasil perubahan
C --> B : Mengirim hasil pengelolaan
B --> A : Menampilkan data terbaru atau alasan perubahan ditolak

@enduml
```
