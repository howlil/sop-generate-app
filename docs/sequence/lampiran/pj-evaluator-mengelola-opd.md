# Sequence Diagram: PJ Evaluator - Mengelola OPD

Sumber use case: `UC-05` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 1 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat menambah, mengubah, atau menghapus data OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengelola OPD
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Data OPD" as B
control "Pengelola OPD" as C
entity "Data OPD" as D

A -> B : Membuka data OPD
B -> C : Meminta daftar OPD
C -> D : Mengambil data OPD
D --> C : Daftar OPD
C --> B : Mengirim daftar OPD
B --> A : Menampilkan data OPD

A -> B : Memilih tambah, ubah, atau hapus OPD
B -> C : Mengirim perubahan data OPD
C -> D : Memeriksa aturan perubahan OPD
D --> C : Hasil pemeriksaan

alt Perubahan dapat dilakukan
  C -> D : Menyimpan perubahan OPD
  D --> C : Data OPD terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan data OPD terbaru
else Perubahan tidak dapat dilakukan
  C --> B : Mengirim alasan penolakan
  B --> A : Menampilkan informasi perubahan tidak dapat dilakukan
end

@enduml
```
