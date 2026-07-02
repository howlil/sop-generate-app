# Diagram Aktivitas: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menjelaskan komentar evaluasi sebagai catatan resmi pada `NilaiEvaluasi`, bukan tabel komentar terpisah. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Membuat Komentar

|Evaluator|
start
:Membuka dokumen SOP dalam workspace evaluasi;
:Menemukan substansi yang perlu diperbaiki;
:Memilih hasil perlu perbaikan;

|Sistem|
:Menandai catatan evaluasi sebagai isian wajib;
:Menampilkan area catatan perbaikan;

|Evaluator|
:Menulis catatan perbaikan yang jelas;
:Menyimpan nilai evaluasi;

|Sistem|
:Memeriksa peran Evaluator, status pengajuan, SOP dalam pengajuan, dan versi penilaian terakhir;

if (Catatan kosong?) then (Ya)
  :Menolak penyimpanan dan menampilkan pesan bahwa catatan wajib diisi;
  stop
else (Tidak)
endif

:Menyimpan catatan pada nilai evaluasi;
:Mengatur hasil menjadi perlu perbaikan;
:Membuka tindak lanjut untuk penyusun;
:Mengubah SOP menjadi revisi dari evaluator;
:Mencatat riwayat penilaian;
:Menampilkan status perlu perbaikan dan alur tindak lanjut penyusun;

stop
@enduml
```
