# Sequence Diagram: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22, 21 |
| Tujuan | Menggambarkan proses pengunjung tanpa login melihat OPD, mencari SOP berlaku, membuka detail, dan mengakses dokumen digital arsip. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Melihat Arsip Publik SOP
autonumber
autoactivate on

actor "Pengunjung" as A
boundary "Halaman Arsip Publik" as B
control "Pengelola Arsip Publik SOP" as C
control "Pemeriksa Ketersediaan Arsip" as D
entity "OPD" as OPD
entity "SOP Publik" as SOPPublik
entity "Pengesahan Publik" as PengesahanPublik
entity "Dokumen Arsip" as DokumenArsip

A -> B : Membuka halaman arsip publik SOP
B --> A : Menampilkan pilihan OPD dan pencarian arsip
B -> C : Meminta daftar OPD yang memiliki arsip SOP berlaku
C -> OPD : Mengambil OPD yang memiliki SOP berlaku
OPD --> C : Daftar OPD arsip
C --> B : Mengirim daftar OPD
B --> A : Menampilkan pilihan OPD arsip

A -> B : Memilih OPD atau mengisi kata kunci pencarian
B --> A : Menampilkan proses pencarian arsip
B -> C : Meminta daftar SOP publik sesuai pilihan
C -> SOPPublik : Mengambil SOP berlaku yang dapat ditampilkan ke publik
SOPPublik --> C : Hasil pencarian arsip SOP
C --> B : Mengirim daftar arsip SOP
alt Arsip ditemukan
  B --> A : Menampilkan daftar SOP publik
  A -> B : Memilih salah satu arsip SOP
  B -> C : Meminta detail arsip SOP
  C -> SOPPublik : Mengambil identitas SOP, dasar hukum, dan ringkasan prosedur
  SOPPublik --> C : Detail arsip SOP
  C -> PengesahanPublik : Mengambil informasi pengesahan publik
  PengesahanPublik --> C : Informasi pengesahan publik
  C --> B : Mengirim detail arsip SOP
  B --> A : Menampilkan detail dan pratinjau arsip SOP
  opt Mengunduh dokumen arsip
    A -> B : Memilih unduh dokumen SOP
    B -> C : Meminta dokumen arsip resmi
    C -> D : Memeriksa ketersediaan dokumen arsip
    D --> C : Hasil pemeriksaan dokumen
    alt Dokumen tersedia
      C -> DokumenArsip : Mengambil dokumen arsip
      DokumenArsip --> C : Dokumen arsip
      C --> B : Mengirim dokumen arsip
      B --> A : Menyajikan dokumen untuk dibaca atau diunduh
    else Dokumen belum tersedia
      C --> B : Mengirim alasan dokumen belum tersedia
      B --> A : Menampilkan informasi dokumen belum dapat diakses
    end
  end
else Arsip tidak ditemukan
  B --> A : Menampilkan informasi belum ada SOP publik sesuai pencarian
end

@enduml
```
