# Sequence Diagram: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Tidak memiliki nomor tersendiri |
| Tujuan | Menggambarkan proses pengguna melihat daftar SOP sesuai peran, filter, OPD, dan akses detail. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Melihat List SOP
autonumber
autoactivate on

actor "Pengguna" as A
boundary "Halaman Daftar SOP" as B
control "Pengelola Daftar SOP" as C
control "Pemeriksa Akses Peran dan OPD" as D
entity "SOP" as SOP
entity "Detail SOP" as DetailSOP
entity "Langkah SOP" as LangkahSOP
entity "Diagram SOP" as DiagramSOP
entity "Riwayat Perubahan" as Riwayat

A -> B : Membuka halaman daftar SOP
B --> A : Menampilkan pilihan filter dan proses pemuatan daftar
B -> C : Meminta daftar SOP sesuai filter
C -> D : Memeriksa cakupan akses pengguna
D --> C : Cakupan akses berdasarkan peran dan OPD
alt Pengguna berwenang melihat lintas OPD
  C -> SOP : Mengambil daftar SOP sesuai filter seluruh OPD
  SOP --> C : Daftar SOP lintas OPD
else Pengguna hanya berwenang pada OPD sendiri
  C -> SOP : Mengambil daftar SOP milik OPD pengguna
  SOP --> C : Daftar SOP OPD pengguna
end
C --> B : Mengirim daftar SOP dan hak aksi
alt Daftar tersedia
  B --> A : Menampilkan daftar SOP, status, versi, OPD, dan aksi yang boleh dilakukan
  A -> B : Memilih salah satu SOP
  B --> A : Menampilkan proses pemuatan detail
  B -> C : Meminta detail SOP yang dipilih
  C -> D : Memastikan pengguna boleh membuka detail tersebut
  D --> C : Hasil pemeriksaan akses detail
  alt Akses detail diizinkan
    C -> SOP : Mengambil identitas SOP
    SOP --> C : Identitas SOP
    C -> DetailSOP : Mengambil versi dokumen yang boleh dilihat
    DetailSOP --> C : Detail dokumen SOP
    C -> LangkahSOP : Mengambil langkah SOP
    LangkahSOP --> C : Daftar langkah SOP
    C -> DiagramSOP : Mengambil diagram SOP
    DiagramSOP --> C : Diagram SOP
    C -> Riwayat : Mengambil riwayat perubahan yang boleh dilihat
    Riwayat --> C : Riwayat perubahan
    C --> B : Mengirim detail SOP
    B --> A : Menampilkan detail atau pratinjau SOP
  else Akses detail tidak diizinkan
    C --> B : Mengirim alasan detail tidak dapat dibuka
    B --> A : Menampilkan informasi akses ditolak
  end
else Daftar kosong
  B --> A : Menampilkan informasi belum ada SOP sesuai filter
end

@enduml
```
