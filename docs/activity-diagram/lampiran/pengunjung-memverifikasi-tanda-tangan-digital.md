# Diagram Aktivitas: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menjelaskan proses pengunjung mengunggah dokumen PDF untuk memeriksa validitas tanda tangan digital. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Memverifikasi Tanda Tangan Digital

|Pengunjung|
start
:Membuka halaman verifikasi tanda tangan digital;
:Mengunggah dokumen PDF;

|Sistem|
:Memeriksa format dan ukuran berkas;
if (Berkas dapat diperiksa?) then (Ya)
  :Memeriksa tanda tangan digital pada PDF;
else (Tidak)
  :Menolak berkas;
  :Menampilkan alasan berkas tidak dapat diperiksa;
  stop
endif

if (Tanda tangan digital valid?) then (Ya)
  :Menampilkan hasil bahwa tanda tangan digital valid;
else (Tidak)
  :Menampilkan hasil bahwa tanda tangan tidak valid atau tidak ditemukan;
endif

stop
@enduml
```

