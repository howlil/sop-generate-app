# Sequence Diagram: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat mengelola anggota tim penyusun SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengelola Tim Penyusun SOP
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Tim Penyusun SOP" as B
control "Pengelola Tim Penyusun SOP" as C
entity "Data Tim Penyusun SOP" as D

A -> B : Membuka data Tim Penyusun SOP
B -> C : Meminta daftar tim penyusun SOP
C -> D : Mengambil data tim penyusun SOP
D --> C : Daftar tim penyusun SOP
C --> B : Mengirim daftar tim penyusun SOP
B --> A : Menampilkan data tim penyusun SOP

A -> B : Memilih tambah, ubah, atau hapus
B -> C : Meminta perubahan data
C -> D : Menyimpan perubahan
D --> C : Hasil perubahan
C --> B : Mengirim hasil pengelolaan
B --> A : Menampilkan data terbaru atau alasan perubahan ditolak

@enduml
```
