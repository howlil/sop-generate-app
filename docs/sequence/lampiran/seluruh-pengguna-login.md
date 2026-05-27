# Sequence Diagram: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menggambarkan proses pengguna masuk ke sistem dan memperoleh sesi sesuai peran. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Login
autonumber

actor "Pengguna" as Aktor
boundary "Halaman Login" as UI
control "Auth Controller" as AuthCtrl
control "Layanan Autentikasi" as AuthService
entity "Data Pengguna" as Pengguna
entity "Sesi Pengguna" as Sesi

Aktor -> UI : Mengisi identitas akun dan kata sandi
UI -> AuthCtrl : Mengirim data login
AuthCtrl -> AuthService : Memvalidasi data login
AuthService -> Pengguna : Mencari akun aktif berdasarkan identitas

alt Akun ditemukan
  Pengguna --> AuthService : Data akun dan hash kata sandi
  AuthService -> AuthService : Memeriksa kecocokan kata sandi
  alt Kata sandi sesuai
    AuthService -> Sesi : Membuat sesi pengguna
    AuthService --> AuthCtrl : Login berhasil dan data peran
    AuthCtrl --> UI : Mengirim sesi dan tujuan halaman
    UI --> Aktor : Menampilkan halaman utama sesuai peran
  else Kata sandi salah
    AuthService --> AuthCtrl : Login ditolak
    AuthCtrl --> UI : Mengirim pesan kredensial tidak sesuai
    UI --> Aktor : Menampilkan pesan login gagal
  end
else Akun tidak ditemukan atau tidak aktif
  Pengguna --> AuthService : Tidak ada akun aktif
  AuthService --> AuthCtrl : Login ditolak
  AuthCtrl --> UI : Mengirim pesan login gagal
  UI --> Aktor : Menampilkan pesan login gagal
end

@enduml
```

