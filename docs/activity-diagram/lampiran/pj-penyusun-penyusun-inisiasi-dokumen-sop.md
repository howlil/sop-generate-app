# Diagram Aktivitas: PJ Penyusun/Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menjelaskan pembuatan SOP baru atau versi baru sebelum dokumen disusun pada workbench. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Inisiasi Dokumen SOP

|PJ Penyusun / Penyusun|
start
:Membuka halaman manajemen SOP;

|Sistem|
:Memeriksa sesi, peran penyusun, dan OPD pengguna;
:Menampilkan daftar SOP versi terbaru dan aksi tambah SOP atau buat versi baru;

|PJ Penyusun / Penyusun|
if (Membuat SOP baru?) then (Ya)
  :Memilih tambah SOP;
  :Mengisi judul, nomor SOP, dan nama lembaga awal bila ada;
  :Menyimpan SOP baru;

  |Sistem|
  :Memvalidasi judul, nomor SOP, OPD pengguna, dan keunikan nomor SOP;

  if (Data awal valid?) then (Ya)
    :Membuat header SOP dan detail versi pertama berstatus draft;
    :Mencatat pembuat dokumen;
    :Membuka workbench detail SOP baru;
  else (Tidak)
    :Menampilkan error nomor SOP duplikat atau field wajib;
    stop
  endif
else (Tidak)
  :Memilih buat versi baru dari SOP berlaku;
  :Mengonfirmasi pembuatan revisi;

  |Sistem|
  :Memvalidasi OPD, sumber SOP berlaku, dan memastikan tidak ada revisi berjalan;

  if (Versi baru dapat dibuat?) then (Ya)
    :Menyalin isi SOP berlaku ke versi baru;
    :Menghubungkan versi baru dengan versi sumber;
    :Menetapkan status awal sebagai draft;
    :Membuka workbench versi baru;
  else (Tidak)
    :Menampilkan alasan seperti belum ada versi berlaku atau revisi masih berjalan;
  endif
endif

stop
@enduml
```
