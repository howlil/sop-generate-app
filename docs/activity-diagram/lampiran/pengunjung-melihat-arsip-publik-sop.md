# Diagram Aktivitas: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22 |
| Tujuan | Menggambarkan proses pengunjung mencari dan melihat dokumen SOP yang tersedia pada arsip publik. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Melihat Arsip Publik SOP

|Pengunjung|
start
:Membuka arsip publik SOP;

|Sistem|
:Menampilkan daftar OPD dan SOP yang tersedia untuk publik;

|Pengunjung|
:Melakukan pencarian atau memilih OPD;
:Memilih SOP yang ingin dilihat;

|Sistem|
if (SOP tersedia pada arsip publik?) then (Ya)
  :Menampilkan informasi dan dokumen SOP;
else (Tidak)
  :Menampilkan informasi bahwa SOP tidak tersedia;
endif

stop

@enduml
```
