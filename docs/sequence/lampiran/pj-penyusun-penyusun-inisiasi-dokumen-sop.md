# Sequence Diagram: PJ Penyusun/Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan interaksi PJ Penyusun atau Penyusun dengan sistem saat memulai SOP baru atau versi baru. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Inisiasi Dokumen SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Inisiasi SOP" as B
control "Pengelola SOP" as C
entity "Dokumen SOP" as D

A -> B : Membuka inisiasi dokumen SOP
B --> A : Menampilkan pilihan pembuatan dokumen

alt Membuat SOP baru
  A -> B : Mengisi informasi awal SOP
  B -> C : Meminta pembuatan SOP baru
  C -> D : Memeriksa dan membuat draft awal
else Membuat versi baru
  A -> B : Memilih SOP yang akan dijadikan sumber
  B -> C : Meminta pembuatan versi baru
  C -> D : Memeriksa dan menyiapkan draft dari versi sumber
end

alt Dokumen dapat dibuat
  D --> C : Draft SOP tersedia
  C --> B : Mengirim draft SOP
  B --> A : Menampilkan draft untuk dilanjutkan
else Dokumen belum dapat dibuat
  D --> C : Alasan pembuatan ditolak
  C --> B : Mengirim informasi penolakan
  B --> A : Menampilkan alasan dokumen belum dapat dibuat
end

@enduml
```
