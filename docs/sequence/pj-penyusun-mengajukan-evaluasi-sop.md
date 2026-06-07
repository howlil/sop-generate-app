# Sequence Diagram: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menggambarkan proses pengajuan SOP yang sudah siap untuk dievaluasi oleh evaluator. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengajukan Evaluasi SOP
autonumber

actor "PJ Penyusun" as Aktor
boundary "Halaman Pengajuan Evaluasi" as UI
control "Evaluasi Controller" as EvalCtrl
control "Validasi Pengajuan" as Validasi
entity "Detail SOP" as Detail
entity "Pengajuan Evaluasi" as Pengajuan
entity "Nilai Evaluasi" as Nilai

Aktor -> UI : Membuka halaman pengajuan evaluasi
UI -> EvalCtrl : Meminta daftar SOP menunggu pengajuan evaluasi
EvalCtrl -> Detail : Mencari SOP milik OPD yang menunggu pengajuan evaluasi
Detail --> EvalCtrl : Daftar SOP siap diajukan
EvalCtrl --> UI : Menampilkan daftar SOP

Aktor -> UI : Memilih SOP dan mengisi informasi pengajuan
Aktor -> UI : Mengirim pengajuan evaluasi
UI -> EvalCtrl : Mengirim data pengajuan dan daftar SOP
EvalCtrl -> Validasi : Memeriksa OPD, status SOP, dan pengajuan aktif

alt Pengajuan aktif masih ada
  Validasi --> EvalCtrl : Tidak dapat mengajukan
  EvalCtrl --> UI : Mengirim pesan pengajuan sebelumnya belum selesai
  UI --> Aktor : Menampilkan alasan pengajuan ditolak
else Pengajuan dapat dibuat
  Validasi --> EvalCtrl : Data pengajuan valid
  EvalCtrl -> Pengajuan : Membuat pengajuan dengan status sedang dievaluasi
  loop Untuk setiap SOP yang diajukan
    EvalCtrl -> Nilai : Membuat lembar penilaian awal
    EvalCtrl -> Detail : Mengubah status SOP menjadi sedang dievaluasi
  end
  EvalCtrl --> UI : Mengirim hasil pengajuan berhasil
  UI --> Aktor : Menampilkan pemberitahuan pengajuan terkirim
end

@enduml
```

