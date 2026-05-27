# Diagram Aktivitas: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menjelaskan proses evaluator memberikan catatan perbaikan ketika SOP belum sesuai. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Membuat Komentar

|Evaluator|
start
:Menilai SOP dan menemukan bagian yang perlu diperbaiki;
:Memilih hasil evaluasi perlu perbaikan;

|Sistem|
:Menampilkan kolom komentar evaluasi;

|Evaluator|
:Menulis catatan perbaikan;
:Menyimpan komentar evaluasi;

|Sistem|
:Memeriksa apakah komentar sudah diisi;
if (Komentar sudah lengkap?) then (Ya)
  :Menyimpan komentar sebagai catatan evaluasi;
  :Menandai SOP perlu ditindaklanjuti oleh penyusun;
  :Menampilkan pemberitahuan berhasil;
else (Tidak)
  :Menolak penyimpanan komentar;
  :Menampilkan pesan bahwa komentar wajib diisi;
endif

stop
@enduml
```

