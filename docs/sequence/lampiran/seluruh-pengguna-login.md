# Sequence Diagram: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menggambarkan interaksi pengguna dan sistem saat melakukan autentikasi untuk memperoleh akses sesuai peran. |

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
entity "Data Pengguna" as D

A -> B : Mengisi email dan kata sandi
B -> C : Meminta autentikasi
C -> D : Memeriksa data pengguna
D --> C : Data pengguna

alt Kredensial valid
  C --> B : Memberikan akses sesuai peran
  B --> A : Menampilkan halaman utama
else Kredensial tidak valid
  C --> B : Menolak autentikasi
  B --> A : Menampilkan pesan login gagal
end

@enduml
```
