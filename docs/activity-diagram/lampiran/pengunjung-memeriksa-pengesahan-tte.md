# Diagram Aktivitas: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menggambarkan proses pengunjung memeriksa informasi pengesahan dokumen melalui tautan atau QR verifikasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Memeriksa Pengesahan TTE

|Pengunjung|
start
:Membuka tautan atau QR verifikasi pengesahan;

|Sistem|
:Mencari data pengesahan dokumen;

if (Data pengesahan ditemukan?) then (Ya)
  :Menampilkan identitas dokumen, penandatangan, peran, dan waktu pengesahan;
else (Tidak)
  :Menampilkan informasi bahwa data pengesahan tidak ditemukan;
endif

stop

@enduml
```
