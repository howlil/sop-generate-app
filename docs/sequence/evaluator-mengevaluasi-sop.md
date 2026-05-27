# Sequence Diagram: Evaluator - Mengevaluasi SOP

Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengevaluasi SOP |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 15 |
| Tujuan | Menggambarkan proses evaluator memeriksa SOP, menyimpan hasil penilaian, dan menyelesaikan evaluasi pengajuan. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengevaluasi SOP
autonumber

actor "Evaluator" as Aktor
boundary "Halaman Evaluasi SOP" as UI
control "Evaluasi Controller" as EvalCtrl
control "Validasi Penilaian" as Validasi
entity "Pengajuan Evaluasi" as Pengajuan
entity "Detail SOP" as Detail
entity "Nilai Evaluasi" as Nilai
entity "Catatan Evaluasi" as Catatan
entity "Log Penilaian" as Log

Aktor -> UI : Membuka halaman evaluasi SOP
UI -> EvalCtrl : Meminta daftar pengajuan yang perlu dievaluasi
EvalCtrl -> Pengajuan : Mengambil pengajuan berstatus sedang dievaluasi
EvalCtrl --> UI : Menampilkan daftar pengajuan

Aktor -> UI : Memilih pengajuan dan SOP yang akan dinilai
UI -> EvalCtrl : Meminta detail SOP dan data penilaian
EvalCtrl -> Detail : Mengambil dokumen SOP
EvalCtrl -> Nilai : Mengambil nilai evaluasi sebelumnya
EvalCtrl --> UI : Menampilkan dokumen dan form penilaian

Aktor -> UI : Mengisi hasil penilaian SOP
UI -> EvalCtrl : Mengirim hasil penilaian
EvalCtrl -> Validasi : Memeriksa kelengkapan penilaian dan versi data

alt SOP perlu perbaikan
  Validasi --> EvalCtrl : Perlu catatan perbaikan
  EvalCtrl --> UI : Meminta catatan perbaikan
  Aktor -> UI : Mengisi catatan perbaikan
  UI -> EvalCtrl : Mengirim catatan perbaikan
  EvalCtrl -> Catatan : Menyimpan catatan evaluasi
  EvalCtrl -> Nilai : Menyimpan hasil perlu perbaikan
  EvalCtrl -> Detail : Mengubah status SOP menjadi perlu revisi
  EvalCtrl -> Log : Mencatat riwayat penilaian
  EvalCtrl --> UI : Mengirim hasil evaluasi tersimpan
  UI --> Aktor : Menampilkan SOP perlu ditindaklanjuti
else SOP sudah sesuai
  Validasi --> EvalCtrl : Penilaian valid
  EvalCtrl -> Nilai : Menyimpan hasil sesuai
  EvalCtrl -> Log : Mencatat riwayat penilaian
  EvalCtrl --> UI : Mengirim hasil penilaian tersimpan
  UI --> Aktor : Menampilkan hasil bahwa SOP sesuai
end

opt Evaluator menyelesaikan evaluasi pengajuan
  Aktor -> UI : Memilih aksi selesai evaluasi
  UI -> EvalCtrl : Mengirim permintaan penyelesaian pengajuan
  EvalCtrl -> Nilai : Memeriksa seluruh hasil penilaian
  alt Semua SOP sudah sesuai
    EvalCtrl -> Pengajuan : Mengubah status menjadi selesai dievaluasi
    EvalCtrl --> UI : Mengirim status evaluasi selesai
    UI --> Aktor : Menampilkan pemberitahuan evaluasi selesai
  else Masih ada SOP belum sesuai
    EvalCtrl --> UI : Mengirim daftar SOP yang belum selesai
    UI --> Aktor : Menampilkan SOP yang masih perlu dinilai atau diperbaiki
  end
end

@enduml
```

