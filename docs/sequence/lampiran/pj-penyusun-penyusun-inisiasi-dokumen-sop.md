# Sequence Diagram: PJ Penyusun/Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan pembuatan SOP baru dan pembuatan versi baru dari SOP berlaku. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Inisiasi Dokumen SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Manajemen SOP" as B
control "Pengelola Inisiasi SOP" as C
control "Pemeriksa Kelayakan Dokumen" as D
entity "SOP" as SOP
entity "Detail SOP" as DetailSOP

A -> B : Membuka halaman manajemen SOP
B --> A : Menampilkan daftar SOP dan aksi inisiasi
A -> B : Memilih buat SOP baru
B --> A : Menampilkan formulir identitas awal SOP
A -> B : Mengisi nama SOP, nomor, unit kerja, dan keterangan awal
B -> C : Meminta pembuatan dokumen SOP baru
C -> D : Memeriksa kewenangan, kelengkapan awal, dan keunikan dokumen
D --> C : Hasil pemeriksaan dokumen baru
alt Dokumen baru dapat dibuat
  C -> SOP : Membuat identitas SOP
  SOP --> C : Identitas SOP terbentuk
  C -> DetailSOP : Membuat versi awal dokumen
  DetailSOP --> C : Versi awal dokumen terbentuk
  C --> B : Mengirim hasil pembuatan dokumen
  B --> A : Menampilkan dokumen baru pada ruang kerja penyusunan
else Dokumen baru belum dapat dibuat
  C --> B : Mengirim alasan pembuatan ditolak
  B --> A : Menampilkan bagian identitas yang perlu diperbaiki
end

opt Membuat versi baru dari SOP berlaku
  A -> B : Memilih buat versi baru dari SOP berlaku
  B --> A : Menampilkan ringkasan SOP asal dan konfirmasi versi baru
  B -> C : Meminta pembuatan versi lanjutan
  C -> D : Memeriksa SOP asal, kewenangan OPD, dan apakah revisi lain masih berjalan
  D --> C : Hasil pemeriksaan versi lanjutan
  alt Versi lanjutan dapat dibuat
    C -> SOP : Mengambil identitas SOP asal
    SOP --> C : Identitas SOP asal
    C -> DetailSOP : Menyalin struktur dokumen menjadi versi baru
    DetailSOP --> C : Versi baru terbentuk
    C --> B : Mengirim hasil pembuatan versi baru
    B --> A : Menampilkan versi baru pada ruang kerja penyusunan
  else Versi lanjutan belum dapat dibuat
    C --> B : Mengirim alasan versi baru ditolak
    B --> A : Menampilkan penyebab versi baru belum dapat dibuat
  end
end

@enduml
```
