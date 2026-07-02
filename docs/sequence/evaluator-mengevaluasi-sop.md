# Sequence Diagram: Evaluator - Mengevaluasi SOP

Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengevaluasi SOP |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 15, 16 |
| Tujuan | Menggambarkan proses evaluator membuka ruang kerja, menilai SOP dengan pemeriksaan perubahan data, menyimpan catatan resmi, membuka tindak lanjut, dan menyelesaikan pengajuan evaluasi. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengevaluasi SOP
autonumber
autoactivate on

actor "Evaluator" as A
boundary "Ruang Kerja Evaluasi SOP" as B
control "Pengelola Evaluasi SOP" as C
control "Pemeriksa Penilaian" as D
entity "Pengajuan Evaluasi" as Pengajuan
entity "Detail SOP" as DetailSOP
entity "Nilai Evaluasi" as Nilai
entity "Riwayat Penilaian" as RiwayatNilai

A -> B : Membuka ruang kerja evaluasi
B -> C : Meminta daftar pengajuan yang dapat dinilai
C -> D : Memeriksa kewenangan evaluator
D --> C : Hasil pemeriksaan kewenangan
C -> Pengajuan : Mengambil pengajuan dan OPD terkait
Pengajuan --> C : Daftar pengajuan evaluasi
C -> Nilai : Mengambil progres penilaian
Nilai --> C : Progres penilaian
C --> B : Mengirim daftar pengajuan
B --> A : Menampilkan pengajuan yang dapat dinilai

A -> B : Memilih pengajuan evaluasi
B -> C : Meminta isi pengajuan
C -> Pengajuan : Mengambil ringkasan pengajuan
Pengajuan --> C : Ringkasan pengajuan
C -> DetailSOP : Mengambil daftar SOP dalam pengajuan
DetailSOP --> C : Daftar SOP dalam pengajuan
C -> Nilai : Mengambil penilaian terkini
Nilai --> C : Penilaian terkini
C --> B : Mengirim isi pengajuan
B --> A : Menampilkan daftar SOP dalam pengajuan

A -> B : Memilih SOP untuk diperiksa
B -> C : Meminta dokumen SOP untuk dinilai
C -> D : Memeriksa apakah SOP termasuk dalam pengajuan dan boleh dinilai
D --> C : Hasil pemeriksaan akses dokumen
alt Dokumen dapat dibuka
  C -> DetailSOP : Mengambil dokumen SOP dan diagram
  DetailSOP --> C : Dokumen SOP dan diagram
  C -> Nilai : Mengambil catatan dan nilai
  Nilai --> C : Catatan dan nilai
  C -> RiwayatNilai : Mengambil riwayat penilaian
  RiwayatNilai --> C : Riwayat penilaian
  C --> B : Mengirim dokumen dan formulir penilaian
  B --> A : Menampilkan dokumen SOP, catatan, riwayat nilai, dan pilihan hasil penilaian
else Dokumen tidak dapat dibuka
  C --> B : Mengirim alasan dokumen tidak dapat dinilai
  B --> A : Menampilkan informasi akses ditolak
end

A -> B : Memilih hasil sesuai atau perlu perbaikan dan mengisi catatan bila diperlukan
B --> A : Menampilkan ringkasan penilaian sebelum disimpan
B -> C : Meminta penyimpanan hasil penilaian
C -> D : Memeriksa kewenangan, keadaan pengajuan, kelengkapan catatan, dan perubahan data terakhir
D --> C : Hasil pemeriksaan penilaian
alt Catatan wajib belum diisi atau data berubah
  C --> B : Mengirim alasan penilaian belum dapat disimpan
  B --> A : Menampilkan catatan yang perlu diisi atau instruksi memuat ulang data
else Penilaian dapat disimpan
  C -> Nilai : Menyimpan hasil penilaian
  Nilai --> C : Penilaian tersimpan
  C -> RiwayatNilai : Mencatat riwayat penilaian
  RiwayatNilai --> C : Riwayat penilaian tercatat
  alt Hasil perlu perbaikan
    C -> DetailSOP : Menandai SOP perlu revisi
    DetailSOP --> C : Keadaan revisi tersimpan
    C -> Nilai : Membuka tindak lanjut penyusun
    Nilai --> C : Tindak lanjut terbuka
  else Hasil sesuai
    C -> Nilai : Menutup tindak lanjut yang sudah terpenuhi bila ada
    Nilai --> C : Keadaan penilaian tersimpan
  end
  C --> B : Mengirim hasil penilaian terbaru
  B --> A : Menampilkan hasil tersimpan dan keadaan SOP terbaru
end

opt Menyelesaikan pengajuan evaluasi
  A -> B : Mengisi nomor berita acara, nilai OPD bila diperlukan, lalu memilih selesai evaluasi
  B --> A : Menampilkan konfirmasi penyelesaian evaluasi
  B -> C : Meminta penyelesaian pengajuan evaluasi
  C -> Nilai : Mengambil seluruh hasil penilaian dalam pengajuan
  Nilai --> C : Rangkuman nilai per SOP
  C -> D : Memeriksa seluruh SOP sudah sesuai dan data berita acara sudah lengkap
  D --> C : Hasil pemeriksaan penyelesaian
  alt Semua syarat terpenuhi
    C -> Pengajuan : Menandai pengajuan selesai dievaluasi
    Pengajuan --> C : Keadaan pengajuan tersimpan
    C -> DetailSOP : Menandai SOP menunggu tanda tangan berita acara
    DetailSOP --> C : Keadaan SOP tersimpan
    C --> B : Mengirim hasil penyelesaian evaluasi
    B --> A : Menampilkan pengajuan siap ditandatangani PJ Evaluator
  else Masih ada syarat belum terpenuhi
    C --> B : Mengirim daftar penilaian atau data yang belum lengkap
    B --> A : Menampilkan bagian yang harus diperbaiki sebelum pengajuan selesai
  end
end

@enduml
```
