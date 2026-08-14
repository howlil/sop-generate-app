# Diagram Aktivitas: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menggambarkan proses PJ Evaluator melihat ringkasan dan perbandingan hasil evaluasi OPD. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Melihat Hasil Penilaian OPD

|PJ Evaluator|
start
:Membuka halaman hasil penilaian OPD;
:Memilih periode penilaian yang ingin dilihat;

|Sistem|
:Menyiapkan hasil evaluasi sesuai periode yang dipilih;

if (Data penilaian tersedia?) then (Ya)
  :Menampilkan ringkasan, grafik, dan hasil per OPD;
else (Tidak)
  :Menampilkan informasi bahwa data belum tersedia;
endif

|PJ Evaluator|
:Meninjau hasil penilaian OPD;

stop

@enduml
```
