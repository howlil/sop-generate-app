# Diagram Aktivitas: Evaluator - Mengevaluasi SOP

Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengevaluasi SOP |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 15 |
| Tujuan | Menggambarkan proses evaluator menilai substansi SOP hingga pengajuan dapat diselesaikan. |

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
:Menampilkan SOP yang terdapat dalam pengajuan;

|Evaluator|
:Memilih SOP;
:Memeriksa substansi SOP;
:Menentukan hasil penilaian;

if (SOP perlu perbaikan?) then (Ya)
  :Menjalankan UC-12 Membuat Komentar;
else (Tidak)
  :Menetapkan hasil sesuai;
endif

|Sistem|
:Menyimpan hasil penilaian;

|Evaluator|
if (Seluruh SOP sudah sesuai?) then (Ya)
  :Melengkapi informasi penyelesaian evaluasi;
  :Memilih selesaikan evaluasi;

  |Sistem|
  :Memvalidasi hasil seluruh SOP;
  if (Evaluasi dapat diselesaikan?) then (Ya)
    :Menandai pengajuan selesai dievaluasi;
    :Menyiapkan pengajuan untuk penandatanganan Berita Acara;
  else (Tidak)
    :Menampilkan informasi yang masih perlu dilengkapi;
  endif
else (Tidak)
  :Melanjutkan penilaian atau menunggu perbaikan SOP;
endif

stop

@enduml
```
