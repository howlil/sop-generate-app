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
entity "Anggota Evaluator" as D

A -> B : Membuka data tim evaluator
B -> C : Meminta anggota evaluator
C -> D : Mengambil anggota evaluator
D --> C : Daftar anggota
C --> B : Mengirim daftar anggota
B --> A : Menampilkan tim evaluator

A -> B : Memilih tambah, ubah, atau nonaktifkan anggota
B -> C : Mengirim perubahan anggota
C -> D : Memeriksa data dan status anggota
D --> C : Hasil pemeriksaan

alt Data sesuai aturan
  C -> D : Menyimpan perubahan anggota
  D --> C : Data anggota terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan tim evaluator terbaru
else Data tidak sesuai
  C --> B : Mengirim informasi yang perlu diperbaiki
  B --> A : Menampilkan pesan validasi
end

@enduml
```
