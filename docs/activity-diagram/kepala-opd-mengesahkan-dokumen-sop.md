# Diagram Aktivitas: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18, 19, 21 |
| Tujuan | Menjelaskan proses Kepala OPD menandatangani seluruh SOP dalam pengajuan, menerbitkan SOP berlaku, memperbarui arsip publik, dan menangani pencabutan bila diperlukan. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengesahkan Dokumen SOP

|Kepala OPD|
start
:Membuka daftar pengajuan atau SOP yang siap disahkan;

|Sistem|
:Memeriksa sesi, peran Kepala OPD, dan OPD pengguna;
:Menampilkan pengajuan yang sudah ditandatangani PJ Penyusun beserta daftar SOP, Berita Acara, dan status TTE;

|Kepala OPD|
:Meninjau dokumen SOP, Berita Acara, dan hasil evaluasi;

if (Aksi yang dipilih adalah pengesahan?) then (Ya)
  :Memilih tanda tangani seluruh SOP dalam pengajuan;
  :Memasukkan PIN TTE;

  |Sistem|
  :Memvalidasi PIN, kesiapan profil TTE, kewenangan OPD, status pengajuan, dan kelayakan seluruh SOP;

  if (Ada syarat yang tidak valid?) then (Ya)
    :Menampilkan alasan gagal dan tidak mengesahkan SOP mana pun;
    stop
  else (Tidak)
  endif

  :Mengesahkan setiap SOP dalam pengajuan sebagai SOP berlaku;
  :Mencatat riwayat tanda tangan Kepala OPD;
  :Menetapkan tanggal efektif dan metadata pengesahan;
  :Menandai versi lama yang digantikan bila ada;
  :Mengubah pengajuan menjadi selesai;
  :Menyiapkan informasi QR atau validasi pengesahan;
  :Memperbarui arsip publik SOP;
  :Menampilkan pemberitahuan bahwa seluruh SOP berhasil disahkan;
else (Tidak)
  :Memilih cabut SOP berlaku;

  |Sistem|
  :Memastikan SOP berada pada OPD Kepala OPD dan masih berstatus berlaku;
  :Memastikan tidak ada revisi atau pengajuan berjalan yang menghalangi pencabutan;

  if (SOP dapat dicabut?) then (Ya)
    :Mengubah status SOP menjadi dicabut;
    :Mencatat riwayat perubahan status;
    :Mengeluarkan SOP dari daftar arsip berlaku;
    :Menampilkan pemberitahuan SOP berhasil dicabut;
  else (Tidak)
    :Menampilkan alasan penolakan pencabutan;
  endif
endif

stop
@enduml
```
