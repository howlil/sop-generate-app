# Sequence Diagram: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat mengelola data serta penugasan Kepala OPD. |

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
entity "Data OPD" as E

A -> B : Membuka data Kepala OPD
B -> C : Meminta daftar Kepala OPD
C -> D : Mengambil data Kepala OPD
D --> C : Daftar Kepala OPD
C --> B : Mengirim daftar Kepala OPD
B --> A : Menampilkan Kepala OPD beserta OPD

A -> B : Memilih tambah, ubah, pindah OPD, atau nonaktifkan
B -> C : Mengirim perubahan Kepala OPD
C -> E : Memeriksa OPD tujuan dan penugasan aktif
E --> C : Hasil pemeriksaan OPD
C -> D : Memeriksa data Kepala OPD
D --> C : Hasil pemeriksaan data

alt Penugasan sesuai aturan
  C -> D : Menyimpan perubahan Kepala OPD
  D --> C : Data Kepala OPD terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan data terbaru
else Penugasan tidak sesuai
  C --> B : Mengirim alasan perubahan ditolak
  B --> A : Menampilkan informasi penolakan
end

@enduml
```
