# Sequence Diagram: PJ Penyusun/Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menggambarkan pengelolaan master pelaksana OPD dan pemakaiannya dalam langkah/swimlane SOP. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Pelaksana SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Pelaksana SOP" as B
control "Pengelola Pelaksana SOP" as C
control "Pemeriksa Pemakaian Pelaksana" as D
entity "Pelaksana" as Pelaksana
entity "Langkah SOP" as LangkahSOP

A -> B : Membuka halaman pelaksana SOP
B -> C : Meminta daftar pelaksana OPD
C -> Pelaksana : Mengambil pelaksana milik OPD pengguna
Pelaksana --> C : Daftar pelaksana
C --> B : Mengirim daftar pelaksana
B --> A : Menampilkan daftar pelaksana

A -> B : Memilih tambah, ubah, atau hapus pelaksana
B --> A : Menampilkan formulir atau konfirmasi pelaksana
A -> B : Mengisi nama pelaksana atau menyetujui penghapusan
B -> C : Meminta perubahan data pelaksana
C -> D : Memeriksa OPD, keunikan nama, dan apakah pelaksana sedang dipakai pada langkah SOP
D --> C : Hasil pemeriksaan pelaksana
alt Perubahan dapat disimpan
  C -> Pelaksana : Menyimpan, memperbarui, atau menghapus pelaksana
  Pelaksana --> C : Data pelaksana terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan pelaksana berhasil diproses
else Perubahan ditolak
  C --> B : Mengirim alasan pelaksana tidak dapat diproses
  B --> A : Menampilkan penyebab pelaksana tidak dapat disimpan atau dihapus
end

opt Memakai pelaksana pada prosedur SOP
  A -> B : Memilih pelaksana untuk langkah SOP
  B --> A : Menampilkan rancangan prosedur dengan pelaksana terpilih
  B -> C : Meminta penyimpanan relasi pelaksana pada prosedur
  C -> D : Memeriksa pelaksana berasal dari OPD SOP dan langkah dapat diubah
  D --> C : Hasil pemeriksaan relasi pelaksana
  alt Relasi dapat disimpan
    C -> LangkahSOP : Menyimpan pelaksana pada langkah SOP
    LangkahSOP --> C : Relasi pelaksana tersimpan
    C --> B : Mengirim prosedur terbaru
    B --> A : Menampilkan pelaksana pada SOP
  else Relasi ditolak
    C --> B : Mengirim alasan pelaksana tidak dapat dipakai
    B --> A : Menampilkan pelaksana atau langkah yang perlu diperbaiki
  end
end

@enduml
```
