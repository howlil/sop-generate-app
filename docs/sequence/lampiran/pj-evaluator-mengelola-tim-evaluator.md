# Sequence Diagram: PJ Evaluator - Mengelola Tim Evaluator

Sumber use case: `UC-06` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Evaluator |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 2 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat mengelola anggota tim evaluator. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengelola Tim Evaluator
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Tim Evaluator" as B
control "Pengelola Tim Evaluator" as C
entity "Data Tim Evaluator" as D

A -> B : Membuka data Tim Evaluator
B -> C : Meminta daftar tim evaluator
C -> D : Mengambil data tim evaluator
D --> C : Daftar tim evaluator
C --> B : Mengirim daftar tim evaluator
B --> A : Menampilkan data tim evaluator

A -> B : Memilih tambah, ubah, atau hapus
B -> C : Meminta perubahan data
C -> D : Menyimpan perubahan
D --> C : Hasil perubahan
C --> B : Mengirim hasil pengelolaan
B --> A : Menampilkan data terbaru atau alasan perubahan ditolak

@enduml
```
