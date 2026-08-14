# Diagram Aktivitas: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menggambarkan proses pengguna masuk ke sistem menggunakan akun yang valid dan memperoleh akses sesuai perannya. |

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
:Memvalidasi kredensial pengguna;

if (Kredensial valid?) then (Ya)
  :Membuka sesi pengguna;
  :Mengarahkan pengguna ke halaman sesuai perannya;
else (Tidak)
  :Menampilkan informasi bahwa login gagal;
endif

stop

@enduml
```
