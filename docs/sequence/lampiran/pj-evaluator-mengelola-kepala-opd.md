# Sequence Diagram: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menggambarkan proses menetapkan dan memperbarui Kepala OPD aktif. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Kepala OPD
autonumber

actor "PJ Evaluator" as Aktor
boundary "Halaman Kepala OPD" as UI
control "Kepala OPD Controller" as KepalaCtrl
control "Validasi Kepala OPD" as Validasi
entity "Data Pengguna" as Pengguna
entity "Data OPD" as OPD
entity "Riwayat Penugasan OPD" as RiwayatOPD

Aktor -> UI : Membuka halaman Kepala OPD
UI -> KepalaCtrl : Meminta daftar Kepala OPD
KepalaCtrl -> Pengguna : Mengambil akun Kepala OPD
KepalaCtrl -> OPD : Mengambil daftar OPD
KepalaCtrl --> UI : Menampilkan daftar Kepala OPD dan OPD

Aktor -> UI : Memilih OPD dan mengisi data Kepala OPD
UI -> KepalaCtrl : Mengirim data Kepala OPD
KepalaCtrl -> Validasi : Memeriksa data akun dan aturan satu Kepala OPD aktif

alt Kepala OPD dapat disimpan
  Validasi --> KepalaCtrl : Valid
  KepalaCtrl -> Pengguna : Menyimpan akun Kepala OPD
  KepalaCtrl -> RiwayatOPD : Mencatat penugasan Kepala OPD
  KepalaCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan pemberitahuan berhasil
else OPD sudah memiliki Kepala OPD aktif atau data tidak valid
  Validasi --> KepalaCtrl : Tidak valid
  KepalaCtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan penolakan
end

@enduml
```

