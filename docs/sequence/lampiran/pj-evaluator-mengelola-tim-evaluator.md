# Sequence Diagram: PJ Evaluator - Mengelola Tim Evaluator

Sumber use case: `UC-06` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Evaluator |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 2 |
| Tujuan | Menggambarkan proses pengelolaan akun evaluator oleh PJ Evaluator. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Tim Evaluator
autonumber

actor "PJ Evaluator" as Aktor
boundary "Halaman Tim Evaluator" as UI
control "Evaluator Controller" as EvalUserCtrl
control "Validasi Akun Pengguna" as Validasi
entity "Data Pengguna" as Pengguna
entity "Riwayat Penugasan OPD" as RiwayatOPD

Aktor -> UI : Membuka halaman tim evaluator
UI -> EvalUserCtrl : Meminta daftar evaluator
EvalUserCtrl -> Pengguna : Mengambil akun evaluator
EvalUserCtrl --> UI : Menampilkan daftar evaluator

Aktor -> UI : Memilih tambah, ubah, atau nonaktifkan evaluator
Aktor -> UI : Mengisi data akun evaluator
UI -> EvalUserCtrl : Mengirim perubahan data evaluator
EvalUserCtrl -> Validasi : Memeriksa kelengkapan dan keunikan akun

alt Data evaluator valid
  Validasi --> EvalUserCtrl : Valid
  EvalUserCtrl -> Pengguna : Menyimpan data akun evaluator
  EvalUserCtrl -> RiwayatOPD : Mencatat penugasan pengguna
  EvalUserCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan pemberitahuan berhasil
else Data evaluator tidak valid
  Validasi --> EvalUserCtrl : Tidak valid
  EvalUserCtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan perbaikan data
end

@enduml
```

