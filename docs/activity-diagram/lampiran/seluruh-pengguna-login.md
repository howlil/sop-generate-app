# Diagram Aktivitas: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menggambarkan proses pengguna masuk ke sistem dan memperoleh akses sesuai perannya. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Login

|Pengguna|
start
:Membuka halaman login;

|Sistem|
:Menampilkan formulir login;

|Pengguna|
:Mengisi email dan kata sandi;
:Memilih masuk;

|Sistem|
:Memeriksa informasi login;

if (Informasi login sesuai?) then (Ya)
  :Memberikan akses sesuai peran pengguna;
  :Menampilkan halaman utama;
else (Tidak)
  :Menampilkan informasi login gagal;
endif

stop

@enduml
```
