# Diagram Aktivitas: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18 |
| Tujuan | Menggambarkan proses Kepala OPD meninjau dan mengesahkan SOP setelah proses evaluasi selesai. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengesahkan Dokumen SOP

|Kepala OPD|
start
:Membuka dokumen yang siap disahkan;

|Sistem|
:Menampilkan SOP dan Berita Acara;

|Kepala OPD|
:Meninjau dokumen SOP;
:Memilih pengesahan;
:Memasukkan PIN TTE;

|Sistem|
:Memproses pengesahan SOP;

if (Pengesahan berhasil?) then (Ya)
  :Menetapkan SOP sebagai dokumen berlaku;
  :Menampilkan hasil pengesahan;
else (Tidak)
  :Menampilkan alasan pengesahan belum dapat dilakukan;
endif

stop

@enduml
```
