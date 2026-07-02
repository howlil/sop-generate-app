# Sequence Diagram: PJ Evaluator - Melihat Hasil Penilaian OPD

Sumber use case: `UC-04` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Hasil Penilaian OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 20 |
| Tujuan | Menggambarkan proses melihat grafik evaluasi tahunan OPD dari rekap hasil evaluasi. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Melihat Hasil Penilaian OPD
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Grafik Evaluasi" as B
control "Pengelola Rekap Evaluasi" as C
control "Pemeriksa Cakupan Laporan" as D
entity "Pengajuan Evaluasi" as Pengajuan
entity "OPD" as OPD
entity "Nilai OPD" as NilaiOPD

A -> B : Membuka halaman grafik evaluasi
B --> A : Menampilkan pilihan tahun, OPD, dan jenis rekap
A -> B : Memilih parameter penilaian OPD
B -> C : Meminta rekap hasil evaluasi OPD
C -> D : Memeriksa kewenangan PJ Evaluator melihat rekap
D --> C : Hasil pemeriksaan cakupan laporan
C -> Pengajuan : Mengambil pengajuan selesai sesuai parameter
Pengajuan --> C : Pengajuan selesai
C -> NilaiOPD : Mengambil nilai OPD
NilaiOPD --> C : Nilai OPD
C -> OPD : Mengambil identitas OPD
OPD --> C : Identitas OPD
C -> C : Menyusun ringkasan, tren, dan peringkat penilaian
C --> B : Mengirim data grafik dan tabel rekap
B --> A : Menampilkan grafik hasil penilaian OPD dan ringkasannya

@enduml
```
