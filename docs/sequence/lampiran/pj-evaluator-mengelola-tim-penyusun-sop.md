# Sequence Diagram: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menggambarkan pengelolaan akun PJ Penyusun/Penyusun, aktivasi, nonaktivasi, mutasi OPD, dan riwayat penugasan. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Tim Penyusun SOP
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Tim Penyusun" as B
control "Pengelola Tim Penyusun" as C
control "Pemeriksa Penugasan Penyusun" as D
entity "Pengguna" as Pengguna
entity "OPD" as OPD
entity "Riwayat Penugasan" as RiwayatPenugasan

A -> B : Membuka halaman tim penyusun
B -> C : Meminta daftar penyusun
C -> Pengguna : Mengambil akun penyusun
Pengguna --> C : Daftar penyusun
C -> OPD : Mengambil OPD terkait
OPD --> C : Daftar OPD terkait
C --> B : Mengirim daftar penyusun
B --> A : Menampilkan daftar penyusun dan PJ Penyusun

A -> B : Memilih salah satu penyusun
B -> C : Meminta riwayat penugasan penyusun
C -> RiwayatPenugasan : Mengambil riwayat OPD penyusun
RiwayatPenugasan --> C : Riwayat penugasan penyusun
C --> B : Mengirim riwayat penugasan
B --> A : Menampilkan riwayat penugasan penyusun

A -> B : Memilih tambah, ubah, atau pindah penugasan penyusun
B --> A : Menampilkan formulir penyusun dan penugasan
A -> B : Mengisi identitas, peran penyusun, dan OPD tujuan
B -> C : Meminta penyimpanan penyusun atau penugasan
C -> D : Memeriksa identitas, peran, keunikan akun, OPD tujuan, dan aturan penugasan
D --> C : Hasil pemeriksaan penyusun
alt Data penyusun dapat disimpan
  C -> Pengguna : Menyimpan akun dan peran penyusun
  Pengguna --> C : Data penyusun tersimpan
  C -> RiwayatPenugasan : Menyimpan riwayat penugasan
  RiwayatPenugasan --> C : Riwayat penugasan tersimpan
  C --> B : Mengirim hasil penyimpanan
  B --> A : Menampilkan penyusun berhasil disimpan
else Data penyusun belum sesuai
  C --> B : Mengirim alasan penyimpanan ditolak
  B --> A : Menampilkan bagian penyusun yang perlu diperbaiki
end

@enduml
```
