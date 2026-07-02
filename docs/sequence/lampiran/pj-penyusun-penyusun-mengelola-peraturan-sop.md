# Sequence Diagram: PJ Penyusun/Penyusun - Mengelola Peraturan SOP

Sumber use case: `UC-18` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Peraturan SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 5 |
| Tujuan | Menggambarkan pengelolaan master peraturan dan penautannya sebagai dasar hukum pada SOP. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Peraturan SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Peraturan / Dasar Hukum" as B
control "Pengelola Peraturan SOP" as C
control "Pemeriksa Pemakaian Peraturan" as D
entity "Peraturan" as Peraturan
entity "OPD" as OPD
entity "Dasar Hukum" as DasarHukum

A -> B : Membuka halaman peraturan atau tab dasar hukum SOP
B --> A : Menampilkan proses pemuatan daftar peraturan
B -> C : Meminta daftar peraturan
C -> Peraturan : Mengambil peraturan
Peraturan --> C : Daftar peraturan
C -> OPD : Mengambil OPD pemakai peraturan
OPD --> C : OPD pemakai peraturan
C --> B : Mengirim daftar peraturan
B --> A : Menampilkan daftar peraturan

A -> B : Memilih tambah, ubah, atau hapus peraturan
B --> A : Menampilkan formulir atau konfirmasi peraturan
A -> B : Mengisi nama, nomor, tahun, dan tentang peraturan
B -> C : Meminta perubahan data peraturan
C -> D : Memeriksa kelengkapan, keunikan nomor dan tahun, serta pemakaian pada SOP
D --> C : Hasil pemeriksaan peraturan
alt Peraturan dapat diproses
  C -> Peraturan : Menyimpan, memperbarui, atau menghapus peraturan
  Peraturan --> C : Data peraturan terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan peraturan berhasil diproses
else Peraturan tidak dapat diproses
  C --> B : Mengirim alasan perubahan ditolak
  B --> A : Menampilkan duplikasi atau relasi pemakaian yang menghalangi
end

opt Menautkan peraturan sebagai dasar hukum SOP
  A -> B : Memilih peraturan sebagai dasar hukum SOP
  B --> A : Menampilkan daftar dasar hukum terpilih
  B -> C : Meminta penyimpanan dasar hukum SOP
  C -> D : Memeriksa dokumen SOP dapat diubah dan peraturan tersedia
  D --> C : Hasil pemeriksaan dasar hukum
  alt Dasar hukum dapat disimpan
    C -> DasarHukum : Menyimpan relasi dasar hukum
    DasarHukum --> C : Dasar hukum tersimpan
    C -> OPD : Mencatat pemakaian peraturan oleh OPD
    OPD --> C : Pemakaian peraturan tercatat
    C --> B : Mengirim dasar hukum terbaru
    B --> A : Menampilkan dasar hukum pada pratinjau SOP
  else Dasar hukum ditolak
    C --> B : Mengirim alasan peraturan tidak dapat dipakai
    B --> A : Menampilkan peraturan yang harus diganti
  end
end

@enduml
```
