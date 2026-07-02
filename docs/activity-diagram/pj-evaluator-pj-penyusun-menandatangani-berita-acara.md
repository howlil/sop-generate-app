# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menjelaskan penandatanganan Berita Acara evaluasi secara berurutan oleh PJ Evaluator lalu PJ Penyusun dengan validasi TTE. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Menandatangani Berita Acara

|PJ Evaluator|
start
:Membuka daftar pengajuan yang selesai dievaluasi;

|Sistem|
:Memeriksa sesi dan peran PJ Evaluator;
:Menampilkan pengajuan selesai evaluasi, nomor Berita Acara, nilai, OPD, dan status TTE;

|PJ Evaluator|
:Membuka detail Berita Acara;
:Meninjau isi Berita Acara dan hasil evaluasi;
:Memilih tanda tangani Berita Acara;
:Memasukkan PIN TTE;

|Sistem|
:Memvalidasi PIN, profil TTE, sertifikat, status pengajuan, dan kewenangan PJ Evaluator;

if (Validasi PJ Evaluator berhasil?) then (Ya)
  :Membubuhkan tanda tangan PJ Evaluator pada Berita Acara;
  :Mencatat riwayat tanda tangan dan metadata verifikasi;
  :Mengubah status pengajuan menjadi ditandatangani PJ Evaluator;
  :Menampilkan Berita Acara yang menunggu tanda tangan PJ Penyusun;
else (Tidak)
  :Menampilkan alasan gagal seperti PIN salah, TTE belum siap, atau status tidak sesuai;
  stop
endif

|PJ Penyusun|
:Membuka pengajuan OPD sendiri yang menunggu tanda tangan PJ Penyusun;

|Sistem|
:Memeriksa sesi, peran PJ Penyusun, OPD, dan status pengajuan;
:Menampilkan detail Berita Acara, daftar SOP, tanda tangan PJ Evaluator, dan status TTE PJ Penyusun;

|PJ Penyusun|
:Meninjau Berita Acara;
:Memilih tanda tangani Berita Acara;
:Memasukkan PIN TTE;

|Sistem|
:Memvalidasi PIN, profil TTE, sertifikat, OPD, status pengajuan, dan apakah tanda tangan PJ Penyusun belum ada;

if (Validasi PJ Penyusun berhasil?) then (Ya)
  :Membubuhkan tanda tangan PJ Penyusun pada Berita Acara;
  :Mencatat riwayat tanda tangan PJ Penyusun;
  :Mengubah pengajuan menjadi ditandatangani PJ Penyusun;
  :Menandai SOP dalam pengajuan sebagai diverifikasi PJ Evaluator organisasi;
  :Menampilkan bahwa SOP siap disahkan Kepala OPD;
else (Tidak)
  :Menampilkan alasan gagal tanpa mengubah status pengajuan;
endif

stop
@enduml
```
