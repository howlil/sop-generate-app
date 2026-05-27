# Sequence Diagram: PJ Penyusun/Penyusun - Inisiasi Dokumen SOP

Sumber use case: `UC-16` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Inisiasi Dokumen SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan proses pembuatan wadah awal dokumen SOP sebelum penyusunan draft. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Inisiasi Dokumen SOP
autonumber

actor "PJ Penyusun / Penyusun" as Aktor
boundary "Halaman Buat SOP" as UI
control "SOP Controller" as SOPCtrl
control "Validasi Inisiasi SOP" as Validasi
entity "Data SOP" as SOP
entity "Detail SOP" as Detail

Aktor -> UI : Membuka halaman pembuatan SOP baru
UI -> SOPCtrl : Meminta formulir inisiasi SOP
SOPCtrl --> UI : Menampilkan formulir data awal SOP

Aktor -> UI : Mengisi judul, nomor, dan informasi awal SOP
UI -> SOPCtrl : Mengirim data awal SOP
SOPCtrl -> Validasi : Memeriksa kelengkapan dan keunikan nomor SOP

alt Data awal valid
  Validasi --> SOPCtrl : Valid
  SOPCtrl -> SOP : Membuat data utama SOP
  SOPCtrl -> Detail : Membuat detail SOP versi awal sebagai draft
  SOPCtrl --> UI : Mengirim hasil pembuatan berhasil
  UI --> Aktor : Membuka halaman penyusunan draft SOP
else Data awal tidak valid
  Validasi --> SOPCtrl : Tidak valid
  SOPCtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan perbaikan data
end

opt Membuat versi baru dari SOP berlaku
  Aktor -> UI : Memilih buat versi baru
  UI -> SOPCtrl : Mengirim permintaan versi baru
  SOPCtrl -> SOP : Mengambil SOP sumber
  SOPCtrl -> Detail : Menyalin detail SOP lama menjadi draft versi baru
  SOPCtrl --> UI : Mengirim draft versi baru
  UI --> Aktor : Menampilkan halaman penyusunan versi baru
end

@enduml
```

