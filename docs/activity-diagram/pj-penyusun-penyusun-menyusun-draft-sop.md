# Diagram Aktivitas: PJ Penyusun/Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan proses PJ Penyusun atau Penyusun melengkapi draft SOP hingga siap diajukan untuk evaluasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Menyusun Draft SOP

|PJ Penyusun / Penyusun|
start
:Membuka draft SOP yang akan disusun;

|Sistem|
:Menampilkan isi draft dan informasi pendukung penyusunan;

|PJ Penyusun / Penyusun|
:Melengkapi identitas dan informasi dokumen SOP;
:Menyusun pelaksana dan langkah prosedur;
:Meninjau hasil penyusunan SOP;

|Sistem|
:Memvalidasi dan menyimpan perubahan draft;

if (Data penyusunan valid?) then (Ya)
  :Menampilkan draft terbaru;
else (Tidak)
  :Menampilkan bagian yang perlu diperbaiki;
endif

|PJ Penyusun / Penyusun|
if (Draft sudah lengkap?) then (Ya)
  :Memilih tandai siap diajukan;

  |Sistem|
  :Memeriksa kelengkapan akhir SOP;
  if (SOP memenuhi kelengkapan?) then (Ya)
    :Menandai SOP menunggu pengajuan evaluasi;
    :Menampilkan SOP siap diajukan oleh PJ Penyusun;
  else (Tidak)
    :Menampilkan bagian SOP yang belum lengkap;
  endif
else (Tidak)
  :Melanjutkan penyusunan pada waktu berikutnya;
endif

stop

@enduml
```
