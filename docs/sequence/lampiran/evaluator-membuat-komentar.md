# Sequence Diagram: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menggambarkan proses evaluator memberikan catatan perbaikan sebagai perluasan dari evaluasi SOP. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Membuat Komentar
autonumber

actor "Evaluator" as Aktor
boundary "Form Catatan Evaluasi" as UI
control "Evaluasi Controller" as EvalCtrl
control "Validasi Catatan" as Validasi
entity "Nilai Evaluasi" as Nilai
entity "Catatan Evaluasi" as Catatan
entity "Detail SOP" as Detail

Aktor -> UI : Memilih hasil evaluasi perlu perbaikan
UI -> EvalCtrl : Meminta form catatan evaluasi
EvalCtrl --> UI : Menampilkan kolom catatan

Aktor -> UI : Menulis catatan perbaikan
UI -> EvalCtrl : Mengirim catatan evaluasi
EvalCtrl -> Validasi : Memeriksa isi catatan

alt Catatan sudah diisi
  Validasi --> EvalCtrl : Valid
  EvalCtrl -> Catatan : Menyimpan catatan evaluasi
  EvalCtrl -> Nilai : Menyimpan hasil perlu perbaikan
  EvalCtrl -> Detail : Menandai SOP perlu revisi
  EvalCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan catatan berhasil disimpan
else Catatan kosong
  Validasi --> EvalCtrl : Tidak valid
  EvalCtrl --> UI : Mengirim pesan catatan wajib diisi
  UI --> Aktor : Menampilkan pesan perbaikan
end

@enduml
```

