# Diagram Aktivitas: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menggambarkan proses pengunjung memverifikasi tanda tangan digital pada dokumen PDF. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Memverifikasi Tanda Tangan Digital

|Pengunjung|
start
:Membuka halaman verifikasi dokumen;
:Mengunggah dokumen PDF;

|Sistem|
:Memeriksa tanda tangan digital pada dokumen;

if (Tanda tangan dapat diverifikasi?) then (Ya)
  :Menampilkan status valid dan informasi penandatangan;
else (Tidak)
  :Menampilkan informasi tanda tangan tidak valid atau tidak dapat diverifikasi;
endif

|Pengunjung|
:Meninjau hasil verifikasi;

stop

@enduml
```
