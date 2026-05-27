# Diagram Aktivitas: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menjelaskan proses PJ Penyusun dalam memilih SOP yang sudah siap dan mengajukannya kepada evaluator untuk dinilai. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengajukan Evaluasi SOP

|PJ Penyusun|
start
:Membuka halaman pengajuan evaluasi SOP;

|Sistem|
:Memeriksa hak akses PJ Penyusun;
:Mencari SOP pada OPD pengguna yang sudah siap dievaluasi;
:Menampilkan daftar SOP yang dapat diajukan;

|PJ Penyusun|
:Memilih satu atau beberapa SOP yang akan diajukan;
:Mengisi informasi pengajuan evaluasi;
:Mengirim pengajuan evaluasi;

|Sistem|
:Memeriksa kepemilikan OPD dan status setiap SOP;
if (Masih ada pengajuan lain yang sedang diproses?) then (Ya)
  :Menolak pengajuan baru;
  :Menampilkan alasan bahwa pengajuan sebelumnya belum selesai;
  stop
else (Tidak)
endif

if (Semua SOP memenuhi syarat?) then (Ya)
  :Membuat catatan pengajuan evaluasi;
  :Menyiapkan lembar penilaian untuk setiap SOP;
  :Mengubah status SOP menjadi sedang dievaluasi;
  :Menampilkan pemberitahuan bahwa pengajuan berhasil dikirim;
else (Tidak)
  :Menolak pengajuan;
  :Menampilkan daftar SOP yang belum memenuhi syarat;
endif

stop
@enduml
```

