# Diagram Aktivitas: PJ Penyusun/Penyusun - Mengelola Peraturan SOP

Sumber use case: `UC-18` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Peraturan SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 5 |
| Tujuan | Menjelaskan pengelolaan master peraturan dan penautannya sebagai dasar hukum SOP. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Peraturan SOP

|PJ Penyusun / Penyusun|
start
:Membuka halaman peraturan atau tab dasar hukum pada workbench;

|Sistem|
:Memeriksa sesi dan peran pengguna yang berwenang;
:Menampilkan daftar peraturan, pencarian, dan aksi tambah, ubah, hapus, atau tautkan;

|PJ Penyusun / Penyusun|
if (Membuat atau mengubah master peraturan?) then (Ya)
  :Mengisi nama, nomor, tahun, dan tentang peraturan;
  :Menyimpan peraturan;

  |Sistem|
  :Memvalidasi field wajib, kombinasi nomor dan tahun, serta hak akses;

  if (Peraturan valid?) then (Ya)
    :Menyimpan master peraturan dan pencatat perubahan terakhir;
    :Menampilkan daftar peraturan terbaru;
  else (Tidak)
    :Menampilkan pesan validasi atau duplikasi;
    stop
  endif
else (Tidak)
endif

|PJ Penyusun / Penyusun|
if (Menautkan peraturan sebagai dasar hukum SOP?) then (Ya)
  :Memilih peraturan pada workbench SOP;
  :Menyimpan dasar hukum SOP;

  |Sistem|
  :Memastikan SOP masih dapat diedit dan pengguna berhak atas OPD terkait;
  :Mengganti daftar dasar hukum sesuai pilihan pengguna;
  :Mencatat riwayat edit bagian header;
  :Menampilkan dasar hukum terbaru pada preview SOP;
else (Tidak)
  :Selesai mengelola daftar peraturan;
endif

stop
@enduml
```
