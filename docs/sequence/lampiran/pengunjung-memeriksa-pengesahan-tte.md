# Sequence Diagram: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menggambarkan interaksi pengunjung dan sistem saat memeriksa informasi pengesahan melalui QR atau tautan verifikasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Memeriksa Pengesahan TTE
autonumber
autoactivate on

actor "Pengunjung" as A
boundary "Halaman Verifikasi TTE" as B
control "Pengelola Verifikasi TTE" as C
entity "Riwayat Pengesahan" as D

A -> B : Membuka QR atau tautan verifikasi
B -> C : Meminta informasi pengesahan
C -> D : Mencari riwayat pengesahan
D --> C : Data pengesahan
C --> B : Mengirim hasil pemeriksaan
B --> A : Menampilkan informasi pengesahan

@enduml
```
