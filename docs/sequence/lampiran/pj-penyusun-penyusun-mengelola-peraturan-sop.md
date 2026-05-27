# Sequence Diagram: PJ Penyusun/Penyusun - Mengelola Peraturan SOP

Sumber use case: `UC-18` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Peraturan SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 5 |
| Tujuan | Menggambarkan proses pengelolaan peraturan sebagai dasar hukum SOP. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Peraturan SOP
autonumber

actor "PJ Penyusun / Penyusun" as Aktor
boundary "Halaman Peraturan SOP" as UI
control "Peraturan Controller" as PeraturanCtrl
control "Validasi Peraturan" as Validasi
entity "Data Peraturan" as Peraturan
entity "Relasi OPD Peraturan" as OPDPeraturan
entity "Dasar Hukum SOP" as DasarHukum

Aktor -> UI : Membuka halaman peraturan SOP
UI -> PeraturanCtrl : Meminta daftar peraturan
PeraturanCtrl -> Peraturan : Mengambil data peraturan
PeraturanCtrl -> OPDPeraturan : Mengambil peraturan yang terhubung dengan OPD
PeraturanCtrl --> UI : Menampilkan daftar peraturan

Aktor -> UI : Mengisi atau memilih peraturan yang digunakan
UI -> PeraturanCtrl : Mengirim data peraturan
PeraturanCtrl -> Validasi : Memeriksa kelengkapan dan kemungkinan duplikasi

alt Peraturan baru valid
  Validasi --> PeraturanCtrl : Valid
  PeraturanCtrl -> Peraturan : Menyimpan data peraturan
  PeraturanCtrl -> OPDPeraturan : Menghubungkan peraturan dengan OPD
  opt Digunakan pada SOP tertentu
    PeraturanCtrl -> DasarHukum : Menghubungkan peraturan sebagai dasar hukum SOP
  end
  PeraturanCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan pemberitahuan berhasil
else Peraturan sudah ada
  Validasi --> PeraturanCtrl : Gunakan data yang sudah tersedia
  PeraturanCtrl -> OPDPeraturan : Menghubungkan peraturan yang sudah ada dengan OPD
  PeraturanCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan peraturan berhasil digunakan
else Data tidak valid
  Validasi --> PeraturanCtrl : Tidak valid
  PeraturanCtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan perbaikan data
end

@enduml
```

