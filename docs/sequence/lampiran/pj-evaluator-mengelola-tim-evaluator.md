# Sequence Diagram: PJ Evaluator - Mengelola Tim Evaluator

Sumber use case: `UC-06` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Evaluator |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 2 |
| Tujuan | Menggambarkan pengelolaan akun evaluator, termasuk tambah, ubah, dan nonaktifkan dengan validasi identitas. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Tim Evaluator
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Tim Evaluator" as B
control "Pengelola Tim Evaluator" as C
control "Pemeriksa Akun Evaluator" as D
entity "Pengguna" as Pengguna
entity "OPD" as OPD

A -> B : Membuka halaman tim evaluator
B -> C : Meminta daftar evaluator
C -> Pengguna : Mengambil data evaluator
Pengguna --> C : Daftar evaluator
C -> OPD : Mengambil OPD terkait
OPD --> C : Daftar OPD terkait
C --> B : Mengirim daftar evaluator
B --> A : Menampilkan daftar evaluator

A -> B : Memilih tambah atau ubah evaluator
B --> A : Menampilkan formulir evaluator
A -> B : Mengisi identitas, kontak, jabatan, dan penugasan evaluator
B -> C : Meminta penyimpanan evaluator
C -> D : Memeriksa kelengkapan identitas, keunikan akun, peran, dan relasi OPD
D --> C : Hasil pemeriksaan evaluator
alt Data evaluator dapat disimpan
  C -> Pengguna : Menyimpan akun evaluator
  Pengguna --> C : Data evaluator tersimpan
  C -> OPD : Menyimpan relasi penugasan
  OPD --> C : Relasi penugasan tersimpan
  C --> B : Mengirim hasil penyimpanan
  B --> A : Menampilkan evaluator berhasil disimpan
else Data evaluator belum sesuai
  C --> B : Mengirim alasan data evaluator ditolak
  B --> A : Menampilkan bagian evaluator yang perlu diperbaiki
end

@enduml
```
