# Diagram Aktivitas: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18 |
| Tujuan | Menjelaskan proses Kepala OPD dalam mengesahkan SOP agar dokumen dapat diberlakukan dan ditampilkan pada arsip publik. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengesahkan Dokumen SOP

|Kepala OPD|
start
:Membuka daftar SOP yang siap disahkan;

|Sistem|
:Memeriksa hak akses Kepala OPD dan kesesuaian OPD;
:Menampilkan pengajuan dan SOP yang sudah dapat disahkan;

|Kepala OPD|
:Memilih pengajuan atau dokumen SOP;
:Meninjau detail dokumen SOP;
:Memilih aksi pengesahan;
:Memasukkan PIN tanda tangan elektronik;

|Sistem|
:Memeriksa kebenaran PIN Kepala OPD;
:Memeriksa status pengajuan dan kewenangan OPD;
if (PIN, status, dan kewenangan sesuai?) then (Ya)
  :Mencatat riwayat pengesahan dokumen;
  :Mengubah status SOP menjadi berlaku;
  :Menandai versi lama sesuai aturan pergantian dokumen;
  :Memperbarui arsip publik SOP;
  :Mengubah status pengajuan menjadi selesai;
  :Menampilkan pemberitahuan bahwa pengesahan berhasil;
else (Tidak)
  :Menolak proses pengesahan;
  :Menampilkan alasan kegagalan;
endif

stop
@enduml
```

