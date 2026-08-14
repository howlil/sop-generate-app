# Sequence Diagram: PJ Penyusun/Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menggambarkan interaksi PJ Penyusun atau Penyusun dengan sistem saat mengelola daftar pelaksana SOP pada OPD. |

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
control "Pengelola Pelaksana" as C
entity "Data Pelaksana" as D

A -> B : Membuka data pelaksana SOP
B -> C : Meminta pelaksana pada OPD pengguna
C -> D : Mengambil data pelaksana
D --> C : Daftar pelaksana
C --> B : Mengirim daftar pelaksana
B --> A : Menampilkan data pelaksana

A -> B : Memilih tambah, ubah, atau hapus pelaksana
B -> C : Mengirim perubahan pelaksana
C -> D : Memeriksa data dan penggunaan pelaksana
D --> C : Hasil pemeriksaan

alt Perubahan dapat dilakukan
  C -> D : Menyimpan perubahan pelaksana
  D --> C : Data pelaksana terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan daftar terbaru
else Perubahan tidak dapat dilakukan
  C --> B : Mengirim alasan penolakan
  B --> A : Menampilkan informasi penolakan
end

@enduml
```
