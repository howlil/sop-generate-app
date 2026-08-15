# Sequence Diagram: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menggambarkan interaksi pengunjung dan sistem saat memverifikasi tanda tangan digital pada dokumen PDF. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Memverifikasi Tanda Tangan Digital
autonumber
autoactivate on

actor "Pengunjung" as A
boundary "Halaman Verifikasi Dokumen" as B
control "Pengelola Verifikasi Dokumen" as C
entity "Dokumen PDF" as D

A -> B : Mengunggah dokumen PDF
B -> C : Meminta verifikasi tanda tangan
C -> D : Memeriksa dokumen
D --> C : Hasil pemeriksaan
C --> B : Mengirim hasil verifikasi
B --> A : Menampilkan status tanda tangan digital

@enduml
```
