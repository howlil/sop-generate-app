# Diagram Aktivitas: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22 |
| Tujuan | Menggambarkan proses pengunjung mencari dan melihat SOP yang tersedia pada arsip publik. |

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
:Menampilkan SOP yang tersedia untuk publik;

|Pengunjung|
:Mencari atau menyaring SOP bila diperlukan;

|Sistem|
:Menampilkan SOP sesuai pilihan;

|Pengunjung|
:Memilih SOP yang ingin dilihat;

|Sistem|
:Menampilkan dokumen SOP;

stop

@enduml
```
