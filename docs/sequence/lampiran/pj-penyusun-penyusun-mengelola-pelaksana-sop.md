# Sequence Diagram: PJ Penyusun/Penyusun - Mengelola Pelaksana SOP

Sumber use case: `UC-17` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 6 |
| Tujuan | Menggambarkan proses pengelolaan pelaksana SOP dan penggunaannya pada dokumen SOP. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Pelaksana SOP
autonumber

actor "PJ Penyusun / Penyusun" as Aktor
boundary "Halaman Pelaksana SOP" as UI
control "Pelaksana Controller" as PelaksanaCtrl
control "Validasi Pelaksana" as Validasi
entity "Data Pelaksana" as Pelaksana
entity "Detail SOP Pelaksana" as RelasiPelaksana

Aktor -> UI : Membuka halaman pelaksana SOP
UI -> PelaksanaCtrl : Meminta daftar pelaksana OPD
PelaksanaCtrl -> Pelaksana : Mengambil data pelaksana
PelaksanaCtrl --> UI : Menampilkan daftar pelaksana

Aktor -> UI : Memilih tambah, ubah, atau hapus pelaksana
Aktor -> UI : Mengisi data pelaksana
UI -> PelaksanaCtrl : Mengirim perubahan pelaksana
PelaksanaCtrl -> Validasi : Memeriksa data dan penggunaan pelaksana

alt Data pelaksana valid
  Validasi --> PelaksanaCtrl : Valid
  PelaksanaCtrl -> Pelaksana : Menyimpan data pelaksana
  opt Pelaksana ditautkan ke SOP
    PelaksanaCtrl -> RelasiPelaksana : Menyimpan relasi pelaksana dengan SOP
  end
  PelaksanaCtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan pemberitahuan berhasil
else Data pelaksana tidak valid
  Validasi --> PelaksanaCtrl : Tidak valid
  PelaksanaCtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan perbaikan data
end

@enduml
```

