# Sequence Diagram: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22 |
| Tujuan | Menggambarkan interaksi pengunjung dan sistem saat mencari serta melihat SOP yang tersedia pada arsip publik. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Melihat Arsip Publik SOP
autonumber
autoactivate on

actor "Pengunjung" as A
boundary "Arsip Publik SOP" as B
control "Pengelola Arsip Publik" as C
entity "Dokumen SOP Berlaku" as D

A -> B : Membuka arsip publik
B -> C : Meminta daftar SOP publik
C -> D : Mengambil SOP yang berstatus berlaku
D --> C : Daftar SOP publik
C --> B : Mengirim daftar SOP
B --> A : Menampilkan arsip publik

opt Pengunjung melakukan pencarian atau memilih OPD
  A -> B : Menentukan kriteria pencarian
  B -> C : Meminta SOP sesuai kriteria
  C -> D : Mengambil SOP yang sesuai
  D --> C : Hasil pencarian
  C --> B : Mengirim hasil pencarian
  B --> A : Memperbarui daftar SOP
end

A -> B : Memilih SOP
B -> C : Meminta dokumen SOP
C -> D : Mengambil dokumen yang dapat dipublikasikan
alt Dokumen tersedia
  D --> C : Dokumen SOP
  C --> B : Mengirim dokumen SOP
  B --> A : Menampilkan dokumen SOP
else Dokumen tidak tersedia
  D --> C : Dokumen tidak ditemukan
  C --> B : Mengirim informasi ketidaktersediaan
  B --> A : Menampilkan informasi SOP tidak tersedia
end

@enduml
```
