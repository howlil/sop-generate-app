# Sequence Diagram: PJ Evaluator - Mengelola OPD

Sumber use case: `UC-05` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 1 |
| Tujuan | Menggambarkan proses PJ Evaluator menambah, mengubah, atau menonaktifkan data OPD. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola OPD
autonumber

actor "PJ Evaluator" as Aktor
boundary "Halaman Manajemen OPD" as UI
control "OPD Controller" as OPDCtrl
control "Validasi Data OPD" as Validasi
entity "Data OPD" as OPD

Aktor -> UI : Membuka halaman manajemen OPD
UI -> OPDCtrl : Meminta daftar OPD
OPDCtrl -> OPD : Mengambil data OPD
OPDCtrl --> UI : Menampilkan daftar OPD

Aktor -> UI : Memilih tambah, ubah, atau nonaktifkan OPD
Aktor -> UI : Mengisi data OPD
UI -> OPDCtrl : Mengirim perubahan data OPD
OPDCtrl -> Validasi : Memeriksa kelengkapan dan duplikasi data

alt Data OPD valid
  Validasi --> OPDCtrl : Valid
  OPDCtrl -> OPD : Menyimpan perubahan data OPD
  OPDCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan pemberitahuan berhasil
else Data OPD tidak valid
  Validasi --> OPDCtrl : Tidak valid
  OPDCtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan perbaikan data
end

@enduml
```

