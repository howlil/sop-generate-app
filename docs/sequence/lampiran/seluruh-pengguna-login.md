# Sequence Diagram: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menggambarkan interaksi pengguna dan sistem saat melakukan autentikasi dan memperoleh akses sesuai peran. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Login
autonumber
autoactivate on

actor "Pengguna" as A
boundary "Halaman Login" as B
control "Pengelola Autentikasi" as C
entity "Akun Pengguna" as D

A -> B : Membuka halaman login
B --> A : Menampilkan formulir login
A -> B : Mengirim email dan kata sandi
B -> C : Meminta autentikasi pengguna
C -> D : Memeriksa akun dan kredensial
D --> C : Hasil pemeriksaan akun

alt Kredensial valid
  C --> B : Mengirim hasil login dan profil pengguna
  B --> A : Mengarahkan ke halaman sesuai peran
else Kredensial tidak valid
  C --> B : Mengirim informasi login gagal
  B --> A : Menampilkan pesan kegagalan login
end

@enduml
```
