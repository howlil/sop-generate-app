# Sequence Diagram: PJ Penyusun - Mengajukan Evaluasi SOP

Sumber use case: `UC-14` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengajukan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Nomor kebutuhan fungsional | 12 |
| Tujuan | Menggambarkan interaksi PJ Penyusun dan sistem saat mengajukan SOP yang telah siap kepada evaluator. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengajukan Evaluasi SOP
autonumber
autoactivate on

actor "PJ Penyusun" as A
boundary "Halaman Pengajuan Evaluasi" as B
control "Pengelola Pengajuan Evaluasi" as C
entity "Dokumen SOP" as D
entity "Pengajuan Evaluasi" as E

A -> B : Membuka menu pengajuan evaluasi
B -> C : Meminta SOP yang siap diajukan
C -> D : Mengambil SOP OPD yang memenuhi syarat
D --> C : Daftar SOP siap diajukan
C --> B : Mengirim daftar SOP
B --> A : Menampilkan SOP yang dapat dipilih

A -> B : Memilih SOP dan mengirim pengajuan
B -> C : Meminta pembuatan pengajuan
C -> E : Memeriksa pengajuan aktif OPD
E --> C : Status pengajuan OPD
C -> D : Memeriksa SOP terpilih
D --> C : Hasil pemeriksaan SOP

alt Pengajuan memenuhi syarat
  C -> E : Membuat pengajuan evaluasi
  E --> C : Pengajuan tercatat
  C -> D : Memindahkan SOP ke proses evaluasi
  D --> C : Status SOP diperbarui
  C --> B : Mengirim hasil pengajuan
  B --> A : Menampilkan pengajuan berhasil dibuat
else Pengajuan belum memenuhi syarat
  C --> B : Mengirim alasan pengajuan ditolak
  B --> A : Menampilkan informasi yang perlu diselesaikan
end

@enduml
```
