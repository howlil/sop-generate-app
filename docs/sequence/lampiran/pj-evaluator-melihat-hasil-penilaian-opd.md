# Sequence Diagram: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menggambarkan proses PJ Evaluator melihat rekap dan grafik hasil penilaian SOP pada OPD. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Melihat Hasil Penilaian OPD
autonumber

actor "PJ Evaluator" as Aktor
boundary "Halaman Laporan Evaluasi" as UI
control "Laporan Evaluasi Controller" as LaporanCtrl
control "Pengolah Grafik Evaluasi" as GrafikCtrl
entity "Pengajuan Evaluasi" as Pengajuan
entity "Nilai Evaluasi" as Nilai

Aktor -> UI : Membuka halaman laporan hasil penilaian OPD
Aktor -> UI : Memilih periode atau filter laporan
UI -> LaporanCtrl : Meminta data hasil penilaian
LaporanCtrl -> Pengajuan : Mengambil pengajuan selesai atau dalam tahap akhir
LaporanCtrl -> Nilai : Mengambil nilai evaluasi OPD
LaporanCtrl -> GrafikCtrl : Mengolah data menjadi ringkasan grafik

alt Data penilaian tersedia
  GrafikCtrl --> LaporanCtrl : Data grafik dan tabel
  LaporanCtrl --> UI : Mengirim hasil laporan
  UI --> Aktor : Menampilkan grafik dan tabel penilaian OPD
else Data belum tersedia
  GrafikCtrl --> LaporanCtrl : Data kosong
  LaporanCtrl --> UI : Mengirim hasil kosong
  UI --> Aktor : Menampilkan informasi data belum tersedia
end

@enduml
```

