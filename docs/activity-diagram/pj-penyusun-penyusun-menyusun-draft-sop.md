# Diagram Aktivitas: PJ Penyusun/Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menjelaskan proses pengguna dalam menyusun draft SOP, menyimpan perubahan, dan menandai dokumen sebagai siap diajukan untuk evaluasi. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Menyusun Draft SOP

|PJ Penyusun / Penyusun|
start
:Membuka halaman penyusunan SOP;

|Sistem|
:Memeriksa hak akses pengguna terhadap OPD;
:Menampilkan draft SOP yang akan disusun;

|PJ Penyusun / Penyusun|
:Mengisi atau memperbarui informasi umum SOP;
:Melengkapi dasar hukum, pelaksana, langkah kerja, dan diagram alur;
:Memilih simpan draft;

|Sistem|
:Memeriksa kelengkapan dan kesesuaian data draft;
if (Data draft sudah sesuai?) then (Ya)
  :Menyimpan perubahan draft;
  :Mencatat riwayat perubahan dokumen;
else (Tidak)
  :Menampilkan bagian data yang perlu diperbaiki;
  |PJ Penyusun / Penyusun|
  :Memperbaiki data draft sesuai pesan sistem;
  |Sistem|
  :Memeriksa kembali data draft;
  :Menyimpan perubahan draft;
  :Mencatat riwayat perubahan dokumen;
endif

|PJ Penyusun / Penyusun|
if (Dokumen sudah siap diajukan?) then (Ya)
  :Memilih aksi tandai siap dievaluasi;
  |Sistem|
  :Memeriksa kelengkapan akhir dokumen SOP;
  if (Dokumen lengkap?) then (Ya)
    :Mengubah status SOP menjadi siap dievaluasi;
    :Menampilkan pemberitahuan bahwa SOP siap diajukan;
  else (Tidak)
    :Menampilkan daftar kekurangan dokumen;
  endif
else (Tidak)
  |Sistem|
  :Menampilkan pemberitahuan bahwa draft berhasil disimpan;
endif

stop
@enduml
```

