# Sequence Diagram: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menggambarkan proses PJ Evaluator mengelola akun PJ Penyusun dan Penyusun pada OPD. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Tim Penyusun SOP
autonumber

actor "PJ Evaluator" as Aktor
boundary "Halaman Tim Penyusun SOP" as UI
control "Penyusun Controller" as PenyusunCtrl
control "Validasi Tim Penyusun" as Validasi
entity "Data Pengguna" as Pengguna
entity "Data OPD" as OPD
entity "Riwayat Penugasan OPD" as RiwayatOPD

Aktor -> UI : Membuka halaman tim penyusun SOP
UI -> PenyusunCtrl : Meminta daftar tim penyusun
PenyusunCtrl -> Pengguna : Mengambil akun PJ Penyusun dan Penyusun
PenyusunCtrl -> OPD : Mengambil daftar OPD
PenyusunCtrl --> UI : Menampilkan data tim penyusun

Aktor -> UI : Memilih tambah, ubah, mutasi, atau nonaktifkan anggota
Aktor -> UI : Mengisi data akun dan OPD penugasan
UI -> PenyusunCtrl : Mengirim perubahan data tim penyusun
PenyusunCtrl -> Validasi : Memeriksa akun, OPD, dan aturan PJ Penyusun aktif

alt Data tim penyusun valid
  Validasi --> PenyusunCtrl : Valid
  PenyusunCtrl -> Pengguna : Menyimpan data akun penyusun
  PenyusunCtrl -> RiwayatOPD : Mencatat riwayat penugasan
  PenyusunCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan pemberitahuan berhasil
else Data tidak valid
  Validasi --> PenyusunCtrl : Tidak valid
  PenyusunCtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan perbaikan data
end

@enduml
```

