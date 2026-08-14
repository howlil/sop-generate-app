# Sequence Diagram: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menggambarkan interaksi pengunjung dan sistem saat memeriksa informasi pengesahan dokumen melalui tautan atau QR verifikasi. |

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
boundary "Halaman Verifikasi Pengesahan" as B
control "Pengelola Verifikasi TTE" as C
entity "Riwayat Pengesahan" as D

A -> B : Membuka tautan atau QR verifikasi
B -> C : Meminta informasi pengesahan
C -> D : Mencari riwayat pengesahan

alt Data pengesahan ditemukan
  D --> C : Informasi dokumen dan penandatangan
  C --> B : Mengirim hasil pengesahan
  B --> A : Menampilkan dokumen, penandatangan, peran, dan waktu pengesahan
else Data pengesahan tidak ditemukan
  D --> C : Data tidak tersedia
  C --> B : Mengirim informasi tidak ditemukan
  B --> A : Menampilkan informasi pengesahan tidak ditemukan
end

@enduml
```
