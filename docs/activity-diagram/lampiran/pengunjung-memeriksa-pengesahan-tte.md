# Diagram Aktivitas: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menggambarkan proses pengunjung memeriksa informasi pengesahan dokumen melalui QR atau tautan verifikasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Memeriksa Pengesahan TTE

|Pengunjung|
start
:Membuka QR atau tautan verifikasi;

|Sistem|
:Mencari informasi pengesahan;

if (Informasi pengesahan ditemukan?) then (Ya)
  :Menampilkan dokumen, penandatangan, peran, dan waktu pengesahan;
else (Tidak)
  :Menampilkan informasi pengesahan tidak ditemukan;
endif

|Pengunjung|
:Meninjau hasil pemeriksaan;

stop

@enduml
```
