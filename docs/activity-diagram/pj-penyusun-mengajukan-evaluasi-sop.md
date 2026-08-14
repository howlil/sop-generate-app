# Diagram Aktivitas: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menggambarkan proses PJ Penyusun mengajukan SOP yang telah siap kepada evaluator. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengajukan Evaluasi SOP

|PJ Penyusun|
start
:Membuka menu pengajuan evaluasi;

|Sistem|
:Menampilkan SOP pada OPD yang siap diajukan;

|PJ Penyusun|
:Memilih SOP yang akan diajukan;
:Mengirim pengajuan evaluasi;

|Sistem|
:Memvalidasi SOP terpilih dan proses evaluasi OPD yang sedang berjalan;

if (Pengajuan memenuhi syarat?) then (Ya)
  :Mencatat pengajuan evaluasi;
  :Memindahkan SOP terpilih ke proses evaluasi;
  :Menampilkan pengajuan berhasil dibuat;
else (Tidak)
  :Menampilkan alasan pengajuan belum dapat dibuat;
endif

stop

@enduml
```
