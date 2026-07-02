# Sequence Diagram: PJ Evaluator - Mengelola OPD

Sumber use case: `UC-05` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 1 |
| Tujuan | Menggambarkan proses PJ Evaluator melihat, menambah, mengubah, dan menonaktifkan OPD dengan respons balik eksplisit. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola OPD
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Manajemen OPD" as B
control "Pengelola Data OPD" as C
control "Pemeriksa Aturan OPD" as D
entity "OPD" as OPD

A -> B : Membuka halaman manajemen OPD
B -> C : Meminta daftar OPD
C -> OPD : Mengambil data OPD sesuai filter tampilan
OPD --> C : Daftar OPD
C --> B : Mengirim daftar OPD
B --> A : Menampilkan daftar OPD

A -> B : Memilih tambah atau ubah OPD
B --> A : Menampilkan formulir OPD
A -> B : Mengisi kode, nama, dan keterangan OPD
B -> C : Meminta penyimpanan OPD
C -> D : Memeriksa kelengkapan data, keunikan kode, dan hubungan dengan data lain
D --> C : Hasil pemeriksaan OPD
alt Data OPD dapat disimpan
  C -> OPD : Menyimpan data OPD
  OPD --> C : Data OPD tersimpan
  C --> B : Mengirim hasil penyimpanan
  B --> A : Menampilkan OPD berhasil disimpan
else Data OPD belum sesuai
  C --> B : Mengirim alasan data OPD ditolak
  B --> A : Menampilkan bagian OPD yang perlu diperbaiki
end

@enduml
```
