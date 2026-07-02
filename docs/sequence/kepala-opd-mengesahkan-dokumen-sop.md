# Sequence Diagram: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18, 19, 21 |
| Tujuan | Menggambarkan proses Kepala OPD melihat pengajuan siap disahkan, menandatangani seluruh SOP dalam pengajuan, menerbitkan SOP berlaku, dan menerima hasil proses dari sistem. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengesahkan Dokumen SOP
autonumber
autoactivate on

actor "Kepala OPD" as A
boundary "Halaman Pengesahan SOP" as B
control "Pengelola Pengesahan SOP" as C
control "Pengelola Tanda Tangan Elektronik" as D
control "Pemeriksa Kelayakan Pengesahan" as E
entity "Pengajuan Evaluasi" as Pengajuan
entity "Detail SOP" as DetailSOP
entity "Dokumen TTE" as DokumenTTE
entity "Riwayat Tanda Tangan" as RiwayatTandaTangan
entity "Arsip Publik" as ArsipPublik
entity "Riwayat Perubahan" as RiwayatPerubahan

A -> B : Membuka daftar pengajuan yang siap disahkan
B -> C : Meminta pengajuan milik OPD yang sudah melewati tanda tangan berita acara
C -> Pengajuan : Mengambil pengajuan yang siap disahkan
Pengajuan --> C : Daftar pengajuan siap pengesahan
C -> DetailSOP : Mengambil SOP terkait
DetailSOP --> C : Daftar SOP terkait
C -> DokumenTTE : Mengambil kelengkapan berita acara
DokumenTTE --> C : Kelengkapan berita acara
C --> B : Mengirim daftar pengajuan
B --> A : Menampilkan pengajuan dan SOP yang siap disahkan

A -> B : Memilih pengajuan dan meninjau SOP
B -> C : Meminta detail dokumen untuk pengesahan
C -> E : Memeriksa kewenangan Kepala OPD terhadap pengajuan
E --> C : Hasil pemeriksaan kewenangan
alt Dokumen dapat ditinjau
  C -> DetailSOP : Mengambil SOP untuk pengesahan
  DetailSOP --> C : Dokumen SOP
  C -> Pengajuan : Mengambil hasil evaluasi
  Pengajuan --> C : Hasil evaluasi
  C -> DokumenTTE : Mengambil berita acara
  DokumenTTE --> C : Berita acara
  C -> RiwayatTandaTangan : Mengambil riwayat tanda tangan
  RiwayatTandaTangan --> C : Riwayat tanda tangan
  C --> B : Mengirim detail pengesahan
  B --> A : Menampilkan dokumen SOP, berita acara, dan status prapengesahan
else Dokumen tidak dapat ditinjau
  C --> B : Mengirim alasan dokumen tidak dapat dibuka
  B --> A : Menampilkan informasi akses ditolak
end

A -> B : Mengisi kredensial tanda tangan dan memilih sahkan seluruh SOP
B --> A : Menampilkan konfirmasi pengesahan seluruh SOP
B -> D : Meminta penandatanganan dan pengesahan SOP
D -> E : Memeriksa kewenangan, kredensial, urutan berita acara, kelengkapan SOP, dan keadaan pengajuan
E --> D : Hasil pemeriksaan pengesahan
alt Pengesahan dapat dilakukan
  D -> DokumenTTE : Mencatat dokumen pengesahan untuk setiap SOP
  DokumenTTE --> D : Dokumen pengesahan tersimpan
  D -> RiwayatTandaTangan : Mencatat riwayat tanda tangan Kepala OPD
  RiwayatTandaTangan --> D : Riwayat tanda tangan tersimpan
  D -> DetailSOP : Menandai SOP sebagai berlaku dan memperbarui tanggal efektif
  DetailSOP --> D : SOP berlaku tersimpan
  D -> RiwayatPerubahan : Menandai versi lama sesuai aturan pergantian versi
  RiwayatPerubahan --> D : Riwayat versi diperbarui
  D -> ArsipPublik : Menyiapkan arsip publik
  ArsipPublik --> D : Arsip publik siap
  D --> B : Mengirim hasil pengesahan berhasil
  B --> A : Menampilkan seluruh SOP sudah disahkan dan tersedia sebagai arsip berlaku
else Pengesahan belum dapat dilakukan
  D --> B : Mengirim alasan pengesahan ditolak
  B --> A : Menampilkan SOP atau persyaratan yang belum memenuhi syarat
end

opt Mencabut SOP berlaku
  A -> B : Memilih cabut SOP berlaku
  B --> A : Menampilkan konfirmasi pencabutan SOP
  B -> C : Meminta pencabutan SOP berlaku
  C -> E : Memeriksa kewenangan, kepemilikan OPD, keberadaan SOP berlaku, dan revisi yang masih berjalan
  E --> C : Hasil pemeriksaan pencabutan
  alt SOP dapat dicabut
    C -> DetailSOP : Menandai SOP sebagai dicabut
    DetailSOP --> C : Pencabutan tersimpan
    C -> RiwayatPerubahan : Mencatat riwayat pencabutan
    RiwayatPerubahan --> C : Riwayat pencabutan tercatat
    C --> B : Mengirim hasil pencabutan
    B --> A : Menampilkan SOP dicabut dan tidak lagi menjadi arsip berlaku
  else SOP belum dapat dicabut
    C --> B : Mengirim alasan pencabutan ditolak
    B --> A : Menampilkan penyebab pencabutan belum dapat dilakukan
  end
end

@enduml
```
