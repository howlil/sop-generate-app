# Diagram Aktivitas: Evaluator - Mengevaluasi SOP

Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengevaluasi SOP |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 15 |
| Tujuan | Menggambarkan proses evaluator menilai substansi SOP dan menyelesaikan evaluasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Mengevaluasi SOP

|Evaluator|
start
:Membuka pengajuan evaluasi;

|Sistem|
:Menampilkan SOP dalam pengajuan;

|Evaluator|
:Memilih SOP;
:Meninjau substansi SOP;
:Menentukan hasil penilaian;

if (SOP perlu perbaikan?) then (Ya)
  :Menjalankan UC-12 Membuat Komentar;
else (Tidak)
  :Menetapkan hasil sesuai;
endif

|Sistem|
:Menyimpan hasil penilaian;

|Evaluator|
if (Seluruh SOP telah selesai dinilai?) then (Ya)
  :Menyelesaikan evaluasi;

  |Sistem|
  :Menampilkan evaluasi telah selesai;
else (Tidak)
  :Melanjutkan penilaian SOP lainnya;
endif

stop

@enduml
```
