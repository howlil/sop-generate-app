# Sequence Diagram: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menggambarkan interaksi PJ Evaluator dan sistem saat mengelola PJ Penyusun dan anggota Penyusun pada OPD. |

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
boundary "Halaman Tim Penyusun" as B
control "Pengelola Tim Penyusun" as C
entity "Anggota Penyusun" as D
entity "Data OPD" as E

A -> B : Membuka data tim penyusun
B -> C : Meminta tim penyusun per OPD
C -> D : Mengambil anggota penyusun
D --> C : Daftar anggota
C --> B : Mengirim tim penyusun
B --> A : Menampilkan tim penyusun per OPD

A -> B : Memilih tambah, ubah, pindah, aktifkan, atau nonaktifkan
B -> C : Mengirim perubahan anggota
C -> E : Memeriksa OPD dan penetapan PJ Penyusun
E --> C : Hasil pemeriksaan
C -> D : Memeriksa data anggota
D --> C : Hasil pemeriksaan data

alt Perubahan sesuai aturan
  C -> D : Menyimpan perubahan anggota
  D --> C : Data tim terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan tim penyusun terbaru
else Perubahan tidak sesuai
  C --> B : Mengirim alasan perubahan ditolak
  B --> A : Menampilkan informasi penolakan
end

@enduml
```
