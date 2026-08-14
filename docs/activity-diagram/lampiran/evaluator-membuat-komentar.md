# Diagram Aktivitas: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menggambarkan proses evaluator memberikan catatan perbaikan pada SOP yang belum sesuai. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Membuat Komentar

|Evaluator|
start
:Menilai SOP sebagai perlu perbaikan;
:Menuliskan catatan perbaikan;

|Sistem|
:Memvalidasi catatan evaluator;

if (Catatan telah diisi?) then (Ya)
  :Menyimpan catatan perbaikan;
  :Menandai SOP memerlukan tindak lanjut penyusun;
  :Menampilkan catatan pada hasil evaluasi;
else (Tidak)
  :Meminta evaluator melengkapi catatan perbaikan;
endif

stop

@enduml
```
