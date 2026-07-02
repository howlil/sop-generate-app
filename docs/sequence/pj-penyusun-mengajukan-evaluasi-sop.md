# Sequence Diagram: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menggambarkan proses PJ Penyusun memilih SOP siap diajukan, membentuk pengajuan evaluasi, menyiapkan ruang penilaian, dan menerima hasil proses dari sistem. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengajukan Evaluasi SOP
autonumber
autoactivate on

actor "PJ Penyusun" as A
boundary "Halaman Pengajuan Evaluasi" as B
control "Pengelola Pengajuan Evaluasi" as C
control "Pemeriksa Kesiapan Pengajuan" as D
entity "SOP" as SOP
entity "Detail SOP" as DetailSOP
entity "Pengajuan Evaluasi" as Pengajuan
entity "Nilai Evaluasi" as Nilai

A -> B : Membuka halaman pengajuan evaluasi
B --> A : Menampilkan proses pemuatan SOP yang siap diajukan
B -> C : Meminta daftar SOP milik OPD yang dapat diajukan
C -> D : Memeriksa kewenangan PJ Penyusun terhadap OPD
D --> C : Hasil pemeriksaan kewenangan
C -> DetailSOP : Mengambil SOP yang siap diajukan
DetailSOP --> C : Daftar SOP siap diajukan
C -> Pengajuan : Mengambil riwayat pengajuan aktif
Pengajuan --> C : Kondisi pengajuan aktif
C --> B : Mengirim daftar pilihan pengajuan
B --> A : Menampilkan SOP siap evaluasi dan peringatan bila ada pengajuan aktif

A -> B : Memilih SOP dan mengisi keterangan pengajuan
B --> A : Menampilkan ringkasan SOP yang akan diajukan
A -> B : Mengirim pengajuan evaluasi
B -> C : Meminta pembuatan pengajuan evaluasi
C -> D : Memeriksa pengajuan aktif, pilihan SOP, kelengkapan dokumen, dan kepemilikan OPD
D --> C : Hasil pemeriksaan pengajuan
alt Masih ada pengajuan aktif
  C --> B : Mengirim alasan pengajuan baru belum dapat dibuat
  B --> A : Menampilkan pengajuan aktif yang harus diselesaikan lebih dahulu
else Ada SOP yang belum siap
  C --> B : Mengirim daftar SOP yang belum memenuhi syarat
  B --> A : Menampilkan SOP yang perlu dilengkapi atau diperbaiki
else Pengajuan memenuhi syarat
  C -> Pengajuan : Membuat pengajuan evaluasi
  Pengajuan --> C : Pengajuan evaluasi terbentuk
  C -> Nilai : Membuat catatan penilaian awal untuk setiap SOP
  Nilai --> C : Catatan penilaian awal terbentuk
  C -> DetailSOP : Mengubah keadaan SOP menjadi sedang dievaluasi
  DetailSOP --> C : Keadaan SOP tersimpan
  C --> B : Mengirim hasil pengajuan berhasil
  B --> A : Menampilkan pengajuan evaluasi berhasil dibuat dan SOP masuk proses evaluasi
end

@enduml
```
