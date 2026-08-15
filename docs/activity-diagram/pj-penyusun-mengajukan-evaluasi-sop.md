# Diagram Aktivitas: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menggambarkan proses PJ Penyusun memilih dan mengajukan SOP untuk dievaluasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengajukan Evaluasi SOP

|PJ Penyusun|
start
:Membuka pengajuan evaluasi;

|Sistem|
:Menampilkan SOP yang siap diajukan;

|PJ Penyusun|
:Memilih SOP yang akan dievaluasi;
:Meninjau SOP terpilih;
:Mengirim pengajuan evaluasi;

|Sistem|
:Memproses pengajuan;

if (Pengajuan dapat diterima?) then (Ya)
  :Menampilkan pengajuan telah dikirim untuk evaluasi;
else (Tidak)
  :Menampilkan alasan pengajuan belum dapat dilakukan;
endif

stop

@enduml
```
