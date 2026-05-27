# Sequence Diagram: Pengunjung - Melihat Arsip Publik SOP

Sumber use case: `UC-19` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 22 |
| Tujuan | Menggambarkan proses pengunjung melihat daftar dan detail SOP yang sudah berlaku tanpa login. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Melihat Arsip Publik SOP
autonumber

actor "Pengunjung" as Aktor
boundary "Halaman Arsip Publik" as UI
control "Arsip Publik Controller" as ArsipCtrl
entity "Arsip Publik SOP" as Arsip
entity "Detail SOP" as Detail

Aktor -> UI : Membuka halaman arsip publik SOP
UI -> ArsipCtrl : Meminta daftar SOP berlaku
ArsipCtrl -> Arsip : Mengambil arsip SOP yang dapat diakses publik
ArsipCtrl --> UI : Menampilkan daftar SOP publik

Aktor -> UI : Mengisi kata kunci atau filter pencarian
UI -> ArsipCtrl : Mengirim parameter pencarian
ArsipCtrl -> Arsip : Mencari SOP sesuai parameter

alt SOP ditemukan
  ArsipCtrl --> UI : Mengirim daftar hasil pencarian
  UI --> Aktor : Menampilkan hasil pencarian
  Aktor -> UI : Memilih SOP
  UI -> ArsipCtrl : Meminta detail SOP publik
  ArsipCtrl -> Detail : Mengambil detail dokumen SOP
  ArsipCtrl --> UI : Mengirim detail atau pratinjau SOP
  UI --> Aktor : Menampilkan detail SOP
else SOP tidak ditemukan
  ArsipCtrl --> UI : Mengirim hasil kosong
  UI --> Aktor : Menampilkan informasi SOP tidak ditemukan
end

@enduml
```

