# Diagram Aktivitas: PJ Penyusun/Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10, 11, 13, 14 |
| Tujuan | Menjelaskan proses penyusunan draft SOP pada workbench, penyimpanan perubahan, riwayat edit, tindak lanjut revisi evaluator, dan penandaan dokumen siap diajukan. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Menyusun Draft SOP

|PJ Penyusun / Penyusun|
start
:Membuka daftar SOP atau workbench penyusunan;

|Sistem|
:Memeriksa sesi, peran penyusun, OPD, dan hak akses terhadap SOP;
:Menampilkan workbench berisi identitas SOP, status, preview dokumen, diagram prosedur, versi, log aktivitas, dan umpan balik evaluasi;

|PJ Penyusun / Penyusun|
:Mengubah identitas SOP seperti judul, nomor, nama lembaga, dasar hukum, SOP terkait, atau lampiran;

|Sistem|
:Memvalidasi field wajib, nomor SOP, status dokumen, dan relasi dasar hukum atau lampiran;

if (Data identitas valid?) then (Ya)
  :Menyimpan perubahan identitas SOP;
  :Mencatat riwayat edit bagian header;
  :Memperbarui preview dokumen;
else (Tidak)
  :Menampilkan pesan validasi pada bagian identitas SOP;
endif

|PJ Penyusun / Penyusun|
:Mengubah pelaksana, langkah prosedur, urutan, keputusan ya/tidak, waktu, kelengkapan, keluaran, atau keterangan;

|Sistem|
:Memvalidasi urutan langkah, pelaksana OPD, cabang keputusan, dan data wajib prosedur;

if (Langkah valid?) then (Ya)
  :Menyimpan langkah prosedur dan relasi antar langkah;
  :Mencatat riwayat edit bagian langkah;
  :Memperbarui tabel prosedur dan diagram;
else (Tidak)
  :Menampilkan langkah atau cabang yang perlu diperbaiki;
endif

|PJ Penyusun / Penyusun|
:Menyesuaikan tata letak diagram, arah panah, label, atau titik tekuk;

|Sistem|
:Memvalidasi bentuk diagram, cabang, sisi koneksi, dan titik tekuk;

if (Konfigurasi diagram valid?) then (Ya)
  :Menyimpan konfigurasi diagram;
  :Menampilkan diagram terbaru pada preview;
else (Tidak)
  :Menampilkan bagian diagram yang tidak valid;
endif

|PJ Penyusun / Penyusun|
if (Dokumen berasal dari revisi evaluator?) then (Ya)
  :Membaca catatan evaluasi yang perlu diperbaiki;
  :Memperbaiki substansi SOP sesuai catatan;
  :Menandai tindak lanjut selesai;

  |Sistem|
  :Memastikan SOP masih dalam status revisi dari evaluator dan tindak lanjut masih terbuka;
  :Menyimpan status tindak lanjut selesai;
  :Mencatat riwayat tindak lanjut;

  |PJ Penyusun|
  :Memilih kirim ulang evaluasi;

  |Sistem|
  :Memvalidasi kelengkapan workbench dan status revisi;

  if (Dokumen lengkap untuk dikirim ulang?) then (Ya)
    :Mengembalikan SOP ke pengajuan evaluasi aktif;
    :Menampilkan notifikasi bahwa SOP dikirim ulang untuk evaluasi;
  else (Tidak)
    :Menampilkan bagian dokumen yang masih perlu dilengkapi;
  endif
else (Tidak)
  if (Draft sudah lengkap dan siap diajukan?) then (Ya)
    :Menandai draft siap diajukan evaluasi;

    |Sistem|
    :Memvalidasi kelengkapan akhir dokumen dan transisi status;
    :Mengubah status SOP menjadi menunggu pengajuan evaluasi;
    :Mencatat riwayat perubahan status;
    :Menampilkan SOP siap diajukan oleh PJ Penyusun;
  else (Tidak)
    |Sistem|
    :Menyimpan draft pada status berjalan dan menampilkan perubahan terakhir;
  endif
endif

stop
@enduml
```
