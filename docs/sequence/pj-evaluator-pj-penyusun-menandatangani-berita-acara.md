# Sequence Diagram: PJ Evaluator / PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menggambarkan urutan interaksi PJ Evaluator dan PJ Penyusun saat menandatangani Berita Acara evaluasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Menandatangani Berita Acara
autonumber
autoactivate on

actor "PJ Evaluator" as A
actor "PJ Penyusun" as E
boundary "Halaman Berita Acara" as B
control "Pengelola Penandatanganan" as C
entity "Berita Acara" as D

A -> B : Menandatangani Berita Acara
B -> C : Meminta penandatanganan PJ Evaluator
C -> D : Mencatat tanda tangan PJ Evaluator
D --> C : Tanda tangan tercatat
C --> B : Mengirim hasil penandatanganan
B --> A : Menampilkan Berita Acara telah ditandatangani

E -> B : Menandatangani Berita Acara setelah PJ Evaluator
B -> C : Meminta penandatanganan PJ Penyusun
C -> D : Mencatat tanda tangan PJ Penyusun
D --> C : Penandatanganan selesai
C --> B : Mengirim hasil penandatanganan
B --> E : Menampilkan Berita Acara selesai ditandatangani

@enduml
```
