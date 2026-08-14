# Diagram Aktivitas: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18 |
| Tujuan | Menggambarkan proses Kepala OPD mengesahkan SOP yang telah menyelesaikan tahapan evaluasi dan penandatanganan Berita Acara. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengesahkan Dokumen SOP

|Kepala OPD|
start
:Membuka pengajuan yang siap disahkan;

|Sistem|
:Menampilkan SOP dan Berita Acara yang telah selesai ditandatangani;

|Kepala OPD|
:Meninjau dokumen SOP;
:Memilih pengesahan;
:Memasukkan PIN TTE;

|Sistem|
:Memvalidasi kewenangan, PIN TTE, dan kesiapan dokumen;

if (Pengesahan memenuhi syarat?) then (Ya)
  :Mengesahkan seluruh SOP dalam pengajuan;
  :Menetapkan SOP sebagai berlaku;
  :Memperbarui arsip publik;
  :Menandai pengajuan selesai;
  :Menampilkan hasil pengesahan;
else (Tidak)
  :Menampilkan alasan pengesahan belum dapat dilakukan;
endif

stop

@enduml
```
