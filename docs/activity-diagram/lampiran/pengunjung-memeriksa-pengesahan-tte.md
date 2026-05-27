# Diagram Aktivitas: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menjelaskan proses pengunjung memeriksa keabsahan pengesahan tanda tangan elektronik melalui tautan atau kode verifikasi. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Memeriksa Pengesahan TTE

|Pengunjung|
start
:Membuka tautan atau memindai kode verifikasi pengesahan;

|Sistem|
:Menerima kode verifikasi;
:Mencari data pengesahan dokumen;
if (Data pengesahan ditemukan?) then (Ya)
  :Memeriksa status dokumen;
  :Menampilkan informasi pengesahan dan status dokumen;
else (Tidak)
  :Menampilkan informasi bahwa pengesahan tidak ditemukan atau tidak valid;
endif

stop
@enduml
```

