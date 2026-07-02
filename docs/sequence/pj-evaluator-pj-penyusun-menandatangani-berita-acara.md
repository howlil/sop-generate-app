# Sequence Diagram: PJ Evaluator/PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menggambarkan penandatanganan Berita Acara secara berurutan oleh PJ Evaluator dan PJ Penyusun, termasuk pemeriksaan kewenangan penandatangan dan umpan balik ke masing-masing aktor. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Menandatangani Berita Acara
autonumber
autoactivate on

actor "PJ Evaluator" as PJE
actor "PJ Penyusun" as PJP
boundary "Halaman Berita Acara" as B
control "Pengelola Berita Acara Evaluasi" as C
control "Pengelola Tanda Tangan Elektronik" as D
control "Pemeriksa Kewenangan Penandatangan" as E
entity "Pengajuan Evaluasi" as Pengajuan
entity "Berita Acara" as BeritaAcara
entity "Riwayat Tanda Tangan" as RiwayatTandaTangan

PJE -> B : Membuka daftar pengajuan selesai evaluasi
B -> C : Meminta pengajuan yang siap ditandatangani PJ Evaluator
C -> Pengajuan : Mengambil pengajuan selesai evaluasi
Pengajuan --> C : Daftar pengajuan selesai evaluasi
C -> BeritaAcara : Mengambil berita acara terkait
BeritaAcara --> C : Berita acara siap tanda tangan
C --> B : Mengirim daftar pengajuan
B --> PJE : Menampilkan pengajuan yang siap ditandatangani

PJE -> B : Memilih pengajuan dan membuka berita acara
B -> C : Meminta pratinjau berita acara
C -> Pengajuan : Mengambil data pengajuan dan hasil evaluasi
Pengajuan --> C : Data pengajuan dan hasil evaluasi
C -> BeritaAcara : Mengambil berita acara
BeritaAcara --> C : Data berita acara
C --> B : Mengirim pratinjau berita acara
B --> PJE : Menampilkan berita acara untuk diperiksa

PJE -> B : Mengisi kredensial tanda tangan dan memilih tandatangani
B --> PJE : Menampilkan konfirmasi tanda tangan PJ Evaluator
B -> D : Meminta penandatanganan berita acara oleh PJ Evaluator
D -> E : Memeriksa peran, kewenangan, kredensial, urutan, dan keadaan pengajuan
E --> D : Hasil pemeriksaan penandatangan PJ Evaluator
alt Pemeriksaan berhasil
  D -> RiwayatTandaTangan : Mencatat tanda tangan PJ Evaluator
  RiwayatTandaTangan --> D : Tanda tangan tercatat
  D -> BeritaAcara : Menandai berita acara sudah ditandatangani PJ Evaluator
  BeritaAcara --> D : Keadaan berita acara diperbarui
  D -> Pengajuan : Menandai pengajuan menunggu tanda tangan PJ Penyusun
  Pengajuan --> D : Keadaan pengajuan diperbarui
  D --> B : Mengirim hasil tanda tangan berhasil
  B --> PJE : Menampilkan berita acara sudah ditandatangani PJ Evaluator
else Pemeriksaan gagal
  D --> B : Mengirim alasan tanda tangan ditolak
  B --> PJE : Menampilkan alasan PJ Evaluator belum dapat menandatangani
end

PJP -> B : Membuka daftar berita acara yang menunggu tanda tangan PJ Penyusun
B -> C : Meminta berita acara yang siap ditandatangani PJ Penyusun
C -> BeritaAcara : Mengambil berita acara yang sudah ditandatangani PJ Evaluator
BeritaAcara --> C : Daftar berita acara siap ditandatangani PJ Penyusun
C --> B : Mengirim daftar berita acara
B --> PJP : Menampilkan berita acara yang menunggu tanda tangan PJ Penyusun

PJP -> B : Memeriksa berita acara dan memilih tandatangani
B --> PJP : Menampilkan konfirmasi tanda tangan PJ Penyusun
B -> D : Meminta penandatanganan berita acara oleh PJ Penyusun
D -> E : Memeriksa peran, OPD, kredensial, urutan tanda tangan, dan keadaan pengajuan
E --> D : Hasil pemeriksaan penandatangan PJ Penyusun
alt Pemeriksaan berhasil
  D -> RiwayatTandaTangan : Mencatat tanda tangan PJ Penyusun
  RiwayatTandaTangan --> D : Tanda tangan tercatat
  D -> BeritaAcara : Menandai berita acara lengkap
  BeritaAcara --> D : Keadaan berita acara diperbarui
  D -> Pengajuan : Menandai pengajuan siap disahkan Kepala OPD
  Pengajuan --> D : Keadaan pengajuan diperbarui
  D --> B : Mengirim hasil tanda tangan berhasil
  B --> PJP : Menampilkan berita acara sudah lengkap dan menunggu pengesahan SOP
else Pemeriksaan gagal
  D --> B : Mengirim alasan tanda tangan ditolak
  B --> PJP : Menampilkan alasan PJ Penyusun belum dapat menandatangani
end

@enduml
```
