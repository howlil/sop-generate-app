# Sequence Diagram: PJ Evaluator/PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun, Kepala OPD |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menggambarkan penyiapan dan pemeliharaan tanda tangan elektronik, termasuk kredensial, sertifikat, dan hasil validasi. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Membuat Tanda Tangan Elektronik
autonumber
autoactivate on

actor "Pengguna Berwenang" as A
boundary "Halaman Profil Tanda Tangan Elektronik" as B
control "Pengelola Profil Tanda Tangan Elektronik" as C
control "Pemeriksa Kredensial Tanda Tangan" as D
entity "Pengguna" as Pengguna
entity "Kredensial Tanda Tangan" as Kredensial
entity "Sertifikat Tanda Tangan" as Sertifikat

A -> B : Membuka halaman profil tanda tangan elektronik
B -> C : Meminta profil tanda tangan pengguna
C -> Kredensial : Mengambil status kredensial pengguna
Kredensial --> C : Status kredensial
C -> Sertifikat : Mengambil sertifikat pengguna
Sertifikat --> C : Status sertifikat
C --> B : Mengirim profil tanda tangan
B --> A : Menampilkan status tanda tangan elektronik dan aksi yang tersedia

A -> B : Memilih penyiapan awal, perubahan kredensial, atau pembaruan sertifikat
B --> A : Menampilkan formulir tanda tangan elektronik
A -> B : Mengisi kredensial dan melampirkan sertifikat bila diperlukan
B -> C : Meminta penyimpanan profil tanda tangan elektronik
C -> D : Memeriksa peran pengguna, kecocokan kredensial, konfirmasi, dan kelayakan sertifikat
D --> C : Hasil pemeriksaan tanda tangan elektronik
alt Profil tanda tangan dapat disimpan
  C -> Kredensial : Menyimpan kredensial tanda tangan
  Kredensial --> C : Kredensial tersimpan
  C -> Sertifikat : Menyimpan sertifikat tanda tangan
  Sertifikat --> C : Sertifikat tersimpan
  C --> B : Mengirim profil terbaru
  B --> A : Menampilkan tanda tangan elektronik siap digunakan atau berhasil diperbarui
else Profil tanda tangan belum sesuai
  C --> B : Mengirim alasan penyimpanan ditolak
  B --> A : Menampilkan kredensial, sertifikat, atau peran yang perlu diperbaiki
end

@enduml
```
