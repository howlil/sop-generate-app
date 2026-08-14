# Diagram Aktivitas: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menggambarkan proses pengunjung memeriksa keabsahan tanda tangan digital pada berkas PDF. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Memverifikasi Tanda Tangan Digital

|Pengunjung|
start
:Membuka halaman verifikasi tanda tangan digital;
:Memilih berkas PDF yang akan diperiksa;

|Sistem|
:Memeriksa tanda tangan digital dan integritas berkas;

if (Tanda tangan dapat diverifikasi?) then (Ya)
  :Menampilkan hasil verifikasi dan informasi penandatangan;
else (Tidak)
  :Menampilkan bahwa tanda tangan tidak valid atau tidak dapat diverifikasi;
endif

stop

@enduml
```
