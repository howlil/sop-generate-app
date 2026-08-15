# Diagram Aktivitas: PJ Penyusun/Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan proses PJ Penyusun atau Penyusun melengkapi dan menyimpan draft SOP hingga siap diajukan. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Menyusun Draft SOP

|PJ Penyusun / Penyusun|
start
:Membuka draft SOP;

|Sistem|
:Menampilkan isi draft SOP;

|PJ Penyusun / Penyusun|
:Melengkapi informasi dokumen SOP;
:Menyusun pelaksana dan langkah prosedur;
:Meninjau hasil penyusunan;
:Menyimpan draft;

|Sistem|
:Menampilkan draft terbaru;

|PJ Penyusun / Penyusun|
if (Draft sudah lengkap?) then (Ya)
  :Menandai draft siap diajukan;

  |Sistem|
  :Menampilkan SOP siap diajukan untuk evaluasi;
else (Tidak)
  :Melanjutkan penyusunan pada waktu berikutnya;
endif

stop

@enduml
```
