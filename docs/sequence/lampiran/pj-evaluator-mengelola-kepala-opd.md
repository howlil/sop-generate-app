# Sequence Diagram: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat mengelola data Kepala OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengelola Kepala OPD
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Kepala OPD" as B
control "Pengelola Kepala OPD" as C
entity "Data Kepala OPD" as D

A -> B : Membuka data Kepala OPD
B -> C : Meminta daftar Kepala OPD
C -> D : Mengambil data Kepala OPD
D --> C : Daftar Kepala OPD
C --> B : Mengirim daftar Kepala OPD
B --> A : Menampilkan data Kepala OPD

A -> B : Memilih tambah, ubah, atau hapus
B -> C : Meminta perubahan data
C -> D : Menyimpan perubahan
D --> C : Hasil perubahan
C --> B : Mengirim hasil pengelolaan
B --> A : Menampilkan data terbaru atau alasan perubahan ditolak

@enduml
```
