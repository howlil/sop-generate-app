# Diagram Aktivitas: Evaluator - Mengevaluasi SOP

Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengevaluasi SOP |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 15, 16 |
| Tujuan | Menjelaskan proses evaluator menilai SOP, memberi catatan resmi bila perlu perbaikan, membuka tindak lanjut penyusun, dan menyelesaikan pengajuan. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengevaluasi SOP

|Evaluator|
start
:Membuka dashboard atau workspace evaluasi;

|Sistem|
:Memeriksa sesi dan peran Evaluator;
:Menampilkan daftar pengajuan evaluasi beserta OPD, status, progres penilaian, dan filter;

|Evaluator|
:Memilih pengajuan evaluasi;

|Sistem|
:Memastikan evaluator berwenang melihat pengajuan;
:Menampilkan detail pengajuan, daftar SOP, dokumen SOP, diagram, riwayat nilai, dan form penilaian;

|Evaluator|
:Memilih salah satu SOP dalam pengajuan;
:Memeriksa substansi, kelengkapan, dan kesesuaian SOP;
:Memilih hasil penilaian;

if (Hasil PERLU_PERBAIKAN?) then (Ya)
  :Mengisi catatan perbaikan yang harus ditindaklanjuti penyusun;
else (Tidak)
  :Memilih hasil SESUAI dan meninjau kembali catatan bila ada;
endif

:Menyimpan nilai evaluasi SOP;

|Sistem|
:Memeriksa status pengajuan masih dalam evaluasi;
:Memastikan SOP termasuk dalam pengajuan yang dipilih;
:Memeriksa perubahan terakhir agar penilaian tidak menimpa data yang lebih baru;

if (PERLU_PERBAIKAN tanpa catatan?) then (Ya)
  :Menampilkan pesan bahwa catatan perbaikan wajib diisi;
  stop
else (Tidak)
endif

:Menyimpan hasil penilaian, catatan, evaluator penilai, dan riwayat penilaian;

if (Hasil PERLU_PERBAIKAN?) then (Ya)
  :Menandai SOP sebagai revisi dari evaluator;
  :Membuka status tindak lanjut untuk penyusun;
  :Menampilkan status perlu perbaikan pada pengajuan;
else (Tidak)
  :Menandai SOP bernilai sesuai;
  :Menutup tindak lanjut terbuka bila nilai sebelumnya perlu perbaikan;
  :Menampilkan nilai tersimpan sebagai sesuai;
endif

|Evaluator|
if (Semua SOP sudah bernilai SESUAI?) then (Ya)
  :Mengisi nomor Berita Acara;
  if (Jenis pengajuan membutuhkan nilai OPD?) then (Ya)
    :Mengisi nilai OPD;
  else (Tidak)
    :Melewati pengisian nilai OPD;
  endif
  :Memilih selesaikan evaluasi;
else (Tidak)
  :Melanjutkan penilaian SOP lain atau menunggu perbaikan penyusun;
  stop
endif

|Sistem|
:Memastikan seluruh SOP dalam pengajuan bernilai sesuai;
:Memvalidasi nomor Berita Acara dan nilai OPD bila diperlukan;

if (Syarat penyelesaian terpenuhi?) then (Ya)
  :Mengubah pengajuan menjadi selesai dievaluasi;
  :Mengubah SOP terkait menjadi menunggu tanda tangan PJ Evaluator;
  :Menyimpan nomor Berita Acara, nilai OPD, tanggal selesai, dan penanggung jawab;
  :Menampilkan pengajuan siap ditandatangani;
else (Tidak)
  :Menampilkan SOP atau data pengajuan yang masih perlu dilengkapi;
endif

stop
@enduml
```
