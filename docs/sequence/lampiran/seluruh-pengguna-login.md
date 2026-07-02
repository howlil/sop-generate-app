# Sequence Diagram: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menggambarkan proses pengguna masuk ke sistem, pencatatan sesi pengguna, dan pengarahan halaman sesuai peran. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Login
autonumber
autoactivate on

actor "Pengguna" as A
boundary "Halaman Login" as B
control "Pengelola Autentikasi" as C
control "Pemeriksa Identitas dan Peran" as D
entity "Pengguna" as Pengguna
entity "Sesi Pengguna" as Sesi

A -> B : Membuka halaman login
B --> A : Menampilkan formulir identitas dan kata sandi
A -> B : Mengisi identitas dan kata sandi
B --> A : Menampilkan masukan yang siap dikirim
A -> B : Memilih masuk
B -> C : Meminta proses masuk pengguna
C -> Pengguna : Mencari akun aktif berdasarkan identitas
Pengguna --> C : Informasi akun pengguna
C -> D : Memeriksa kecocokan kata sandi, status akun, dan peran
D --> C : Hasil pemeriksaan identitas
alt Identitas tidak sesuai atau akun tidak aktif
  C --> B : Mengirim alasan login ditolak
  B --> A : Menampilkan pesan login gagal
else Identitas sesuai
  C -> Sesi : Mencatat sesi pengguna baru
  Sesi --> C : Sesi pengguna tercatat
  C --> B : Mengirim profil dan tujuan halaman sesuai peran
  B --> A : Mengarahkan pengguna ke halaman utama sesuai peran
end

@enduml
```
