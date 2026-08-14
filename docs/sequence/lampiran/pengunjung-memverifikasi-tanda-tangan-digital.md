# Sequence Diagram: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menggambarkan interaksi pengunjung dan sistem saat memeriksa keabsahan tanda tangan digital pada berkas PDF. |

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
boundary "Halaman Verifikasi PDF" as B
control "Pengelola Verifikasi Digital" as C
entity "Berkas Bertanda Tangan" as D

A -> B : Membuka halaman verifikasi digital
B --> A : Menampilkan fasilitas verifikasi
A -> B : Memilih berkas PDF
B -> C : Meminta verifikasi tanda tangan
C -> D : Memeriksa tanda tangan dan integritas berkas
D --> C : Hasil pemeriksaan

alt Tanda tangan dapat diverifikasi
  C --> B : Mengirim hasil verifikasi
  B --> A : Menampilkan status valid dan informasi penandatangan
else Tanda tangan tidak dapat diverifikasi
  C --> B : Mengirim hasil verifikasi gagal
  B --> A : Menampilkan informasi tanda tangan tidak valid atau tidak dapat diverifikasi
end

@enduml
```
