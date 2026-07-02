# Diagram Aktivitas: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menjelaskan pemeriksaan pengesahan dari QR atau tautan publik berdasarkan pasangan dokumenTteId dan userId. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Memeriksa Pengesahan TTE

|Pengunjung|
start
:Memindai QR atau membuka tautan validasi pengesahan;

|Sistem|
:Membaca identitas dokumen TTE dan pengguna penandatangan dari tautan;
:Memvalidasi format identitas dokumen dan penandatangan;

if (Format tautan valid?) then (Ya)
  :Mencari riwayat tanda tangan yang sesuai;
else (Tidak)
  :Menampilkan pengesahan tidak valid;
  stop
endif

if (Riwayat pengesahan ditemukan?) then (Ya)
  :Menampilkan status pengesahan, jenis dokumen, nomor dokumen, nama penandatangan, peran, dan waktu tanda tangan;
else (Tidak)
  :Menampilkan pengesahan tidak ditemukan atau tidak valid;
endif

stop
@enduml
```
