# Sequence Diagram: PJ Evaluator - Mengelola Kepala OPD

Sumber use case: `UC-07` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Kepala OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 4 |
| Tujuan | Menggambarkan proses menetapkan, mengubah, menonaktifkan, dan melihat riwayat Kepala OPD. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengelola Kepala OPD
autonumber
autoactivate on

actor "PJ Evaluator" as A
boundary "Halaman Kepala OPD" as B
control "Pengelola Kepala OPD" as C
control "Pemeriksa Penugasan Kepala OPD" as D
entity "Pengguna" as Pengguna
entity "OPD" as OPD
entity "Riwayat Penugasan" as RiwayatPenugasan

A -> B : Membuka halaman Kepala OPD
B -> C : Meminta daftar Kepala OPD
C -> Pengguna : Mengambil akun Kepala OPD
Pengguna --> C : Daftar Kepala OPD
C -> OPD : Mengambil penugasan OPD
OPD --> C : Penugasan OPD
C --> B : Mengirim daftar Kepala OPD
B --> A : Menampilkan daftar Kepala OPD

A -> B : Memilih salah satu Kepala OPD
B -> C : Meminta riwayat penugasan Kepala OPD
C -> RiwayatPenugasan : Mengambil riwayat OPD pengguna tersebut
RiwayatPenugasan --> C : Riwayat penugasan
C --> B : Mengirim riwayat penugasan
B --> A : Menampilkan riwayat OPD Kepala OPD

A -> B : Memilih tambah atau ubah Kepala OPD
B --> A : Menampilkan formulir Kepala OPD
A -> B : Mengisi identitas, jabatan, pangkat, kontak, dan OPD
B -> C : Meminta penyimpanan Kepala OPD
C -> D : Memeriksa identitas, peran, keunikan akun, OPD aktif, dan periode penugasan
D --> C : Hasil pemeriksaan Kepala OPD
alt Data Kepala OPD dapat disimpan
  C -> Pengguna : Menyimpan akun Kepala OPD
  Pengguna --> C : Akun Kepala OPD tersimpan
  C -> RiwayatPenugasan : Menyimpan riwayat penugasan Kepala OPD
  RiwayatPenugasan --> C : Riwayat penugasan tersimpan
  C --> B : Mengirim hasil penyimpanan
  B --> A : Menampilkan Kepala OPD berhasil disimpan
else Data Kepala OPD belum sesuai
  C --> B : Mengirim alasan data Kepala OPD ditolak
  B --> A : Menampilkan bagian yang perlu diperbaiki
end

@enduml
```
