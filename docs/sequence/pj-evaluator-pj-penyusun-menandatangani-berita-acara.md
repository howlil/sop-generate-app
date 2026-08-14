# Sequence Diagram: PJ Evaluator/PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menggambarkan interaksi PJ Evaluator, PJ Penyusun, dan sistem dalam penandatanganan Berita Acara secara berurutan. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Menandatangani Berita Acara
autonumber
autoactivate on

actor "PJ Evaluator" as A
actor "PJ Penyusun" as B
boundary "Halaman Berita Acara" as C
control "Pengelola Penandatanganan" as D
entity "Berita Acara Evaluasi" as E
entity "Pengajuan Evaluasi" as F

A -> C : Membuka pengajuan selesai dievaluasi
C -> D : Meminta Berita Acara
D -> E : Mengambil Berita Acara
E --> D : Berita Acara
D --> C : Mengirim Berita Acara
C --> A : Menampilkan Berita Acara

A -> C : Memilih tanda tangani dan memasukkan PIN TTE
C -> D : Meminta tanda tangan PJ Evaluator
D -> F : Memeriksa tahap pengajuan
F --> D : Tahap pengajuan
alt Tanda tangan PJ Evaluator dapat dilakukan
  D -> E : Mencatat tanda tangan PJ Evaluator
  E --> D : Tanda tangan tercatat
  D -> F : Menandai tahap berikutnya
  F --> D : Pengajuan diperbarui
  D --> C : Mengirim hasil penandatanganan
  C --> A : Menampilkan tanda tangan berhasil
else Tanda tangan tidak dapat dilakukan
  D --> C : Mengirim alasan penolakan
  C --> A : Menampilkan informasi penandatanganan gagal
end

B -> C : Membuka Berita Acara yang menunggu tanda tangan
C -> D : Meminta status Berita Acara
D -> E : Mengambil Berita Acara terkini
E --> D : Berita Acara dan tanda tangan PJ Evaluator
D --> C : Mengirim Berita Acara
C --> B : Menampilkan Berita Acara

B -> C : Memilih tanda tangani dan memasukkan PIN TTE
C -> D : Meminta tanda tangan PJ Penyusun
D -> F : Memeriksa kewenangan dan urutan
F --> D : Hasil pemeriksaan
alt Tanda tangan PJ Penyusun dapat dilakukan
  D -> E : Mencatat tanda tangan PJ Penyusun
  E --> D : Tanda tangan tercatat
  D -> F : Menandai pengajuan siap disahkan
  F --> D : Pengajuan diperbarui
  D --> C : Mengirim hasil penandatanganan
  C --> B : Menampilkan SOP siap untuk pengesahan Kepala OPD
else Tanda tangan tidak dapat dilakukan
  D --> C : Mengirim alasan penolakan
  C --> B : Menampilkan informasi penandatanganan gagal
end

@enduml
```
