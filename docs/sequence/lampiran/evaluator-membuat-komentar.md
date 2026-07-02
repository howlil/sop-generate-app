# Sequence Diagram: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menggambarkan proses evaluator memberi catatan perbaikan resmi saat SOP belum sesuai dan menerima umpan balik dari sistem. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Membuat Komentar
autonumber
autoactivate on

actor "Evaluator" as A
boundary "Form Penilaian SOP" as B
control "Pengelola Catatan Evaluasi" as C
control "Pemeriksa Catatan Perbaikan" as D
entity "Nilai Evaluasi" as Nilai
entity "Detail SOP" as DetailSOP

A -> B : Memilih hasil perlu perbaikan pada SOP
B --> A : Menampilkan kolom catatan perbaikan
A -> B : Mengisi komentar atau arahan perbaikan
B --> A : Menampilkan ringkasan komentar sebelum disimpan
B -> C : Meminta penyimpanan komentar evaluasi
C -> D : Memeriksa kewenangan evaluator, isi catatan, keadaan pengajuan, dan perubahan data terakhir
D --> C : Hasil pemeriksaan komentar
alt Catatan kosong
  C --> B : Mengirim alasan komentar belum lengkap
  B --> A : Menampilkan pesan catatan wajib diisi
else Data penilaian sudah berubah
  C --> B : Mengirim alasan data perlu dimuat ulang
  B --> A : Menampilkan instruksi memuat ulang sebelum menyimpan komentar
else Komentar dapat disimpan
  C -> Nilai : Menyimpan komentar sebagai bagian dari penilaian perlu perbaikan
  Nilai --> C : Komentar tersimpan
  C -> Nilai : Menandai tindak lanjut penyusun sebagai terbuka
  Nilai --> C : Tindak lanjut terbuka
  C --> B : Mengirim komentar dan keadaan tindak lanjut terbaru
  B --> A : Menampilkan komentar tersimpan dan SOP menunggu perbaikan
end

@enduml
```
