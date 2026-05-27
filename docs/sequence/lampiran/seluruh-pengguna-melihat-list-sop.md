# Sequence Diagram: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Tidak memiliki nomor tersendiri |
| Tujuan | Menggambarkan proses pengguna melihat daftar SOP sesuai peran dan ruang lingkup aksesnya. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Melihat List SOP
autonumber

actor "Pengguna" as Aktor
boundary "Halaman Daftar SOP" as UI
control "SOP Controller" as SOPCtrl
control "Validasi Akses" as Akses
entity "Data SOP" as SOP
entity "Detail SOP" as Detail

Aktor -> UI : Membuka halaman daftar SOP
UI -> SOPCtrl : Meminta daftar SOP
SOPCtrl -> Akses : Memeriksa peran dan OPD pengguna
Akses --> SOPCtrl : Ruang lingkup akses pengguna
SOPCtrl -> SOP : Mencari SOP sesuai akses
SOPCtrl -> Detail : Mengambil status dan versi SOP

alt SOP ditemukan
  SOPCtrl --> UI : Mengirim daftar SOP
  UI --> Aktor : Menampilkan daftar SOP
  Aktor -> UI : Memilih salah satu SOP
  UI -> SOPCtrl : Meminta detail SOP
  SOPCtrl -> Detail : Mengambil detail dokumen
  SOPCtrl --> UI : Mengirim detail SOP
  UI --> Aktor : Menampilkan detail SOP
else SOP tidak tersedia
  SOPCtrl --> UI : Mengirim daftar kosong
  UI --> Aktor : Menampilkan informasi belum ada SOP
end

@enduml
```

