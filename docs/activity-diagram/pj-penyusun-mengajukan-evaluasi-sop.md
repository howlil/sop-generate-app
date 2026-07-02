# Diagram Aktivitas: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menjelaskan proses PJ Penyusun membuat pengajuan evaluasi dari SOP yang sudah berstatus siap diajukan. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengajukan Evaluasi SOP

|PJ Penyusun|
start
:Membuka halaman pengajuan evaluasi OPD sendiri;

|Sistem|
:Memeriksa sesi, peran PJ Penyusun, dan OPD pengguna;
:Menampilkan daftar SOP OPD yang siap diajukan serta ringkasan pengajuan aktif;

|PJ Penyusun|
if (Ada SOP yang akan diajukan?) then (Ya)
  :Memilih satu atau beberapa SOP;
  :Memilih jenis pengajuan evaluasi;
  :Mengirim pengajuan evaluasi;
else (Tidak)
  |Sistem|
  :Menampilkan informasi bahwa belum ada SOP siap diajukan;
  stop
endif

|Sistem|
:Memastikan pengguna berwenang membuat pengajuan untuk OPD sendiri;
:Memeriksa apakah OPD masih memiliki pengajuan aktif yang belum selesai;

if (Masih ada pengajuan aktif?) then (Ya)
  :Menolak pengajuan baru dan menampilkan pengajuan yang harus diselesaikan dahulu;
  stop
else (Tidak)
endif

:Memvalidasi SOP yang dipilih tidak duplikat, milik OPD pengguna, dan berstatus menunggu pengajuan evaluasi;

if (Semua SOP valid?) then (Ya)
  :Membuat pengajuan evaluasi berstatus sedang dievaluasi;
  :Membuat daftar nilai evaluasi awal untuk setiap SOP;
  :Mengubah status setiap SOP menjadi sedang dievaluasi;
  :Menampilkan notifikasi pengajuan berhasil dan daftar pengajuan terbaru;
else (Tidak)
  :Menampilkan daftar SOP yang tidak valid, beda OPD, duplikat, atau belum siap diajukan;
endif

stop
@enduml
```
