# Diagram Aktivitas: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22, 21 |
| Tujuan | Menjelaskan akses publik tanpa login untuk melihat OPD, daftar SOP berlaku, detail dokumen, preview, dan PDF arsip. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Melihat Arsip Publik SOP

|Pengunjung|
start
:Membuka halaman arsip publik SOP;

|Sistem|
:Menampilkan daftar OPD yang memiliki SOP berlaku, kolom pencarian, dan daftar arsip awal;

|Pengunjung|
:Memilih OPD, memasukkan kata kunci, atau memilih SOP tertentu;

|Sistem|
if (Pengunjung melihat daftar SOP OPD?) then (Ya)
  :Memfilter hanya SOP yang berstatus berlaku;
  :Menampilkan ringkasan nomor SOP, judul, versi, tanggal efektif, dan OPD;
else (Melihat detail dokumen)
  :Memastikan dokumen yang dipilih masih berstatus berlaku;
  :Menampilkan detail header, dasar hukum, lampiran, pelaksana, langkah prosedur, diagram, dan informasi pengesahan publik;
endif

|Pengunjung|
if (Mengunduh atau membuka PDF arsip?) then (Ya)
  :Memilih aksi unduh atau lihat PDF;

  |Sistem|
  :Memastikan PDF resmi tersedia untuk SOP berlaku;
  :Menampilkan atau menyiapkan PDF arsip;
else (Tidak)
  :Tetap membaca arsip pada halaman publik;
endif

stop
@enduml
```
