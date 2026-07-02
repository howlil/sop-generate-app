# Diagram Aktivitas: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menjelaskan proses pengguna masuk ke sistem, validasi kredensial, pembentukan sesi, pemuatan profil, dan pengarahan halaman berdasarkan peran. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Login

|Pengguna|
start
:Membuka halaman login;

|Sistem|
:Menampilkan formulir login;

|Pengguna|
:Mengisi email dan kata sandi;
:Mengirim formulir login;

|Sistem|
:Memeriksa kelengkapan format email dan kata sandi;

if (Input lengkap?) then (Ya)
  :Mencari akun aktif berdasarkan email;
else (Tidak)
  :Menampilkan pesan bahwa email dan kata sandi wajib diisi dengan benar;
  stop
endif

if (Akun aktif ditemukan?) then (Ya)
  :Membandingkan kata sandi dengan data autentikasi pengguna;
else (Tidak)
  :Menampilkan pesan login gagal tanpa membuka detail alasan keamanan;
  stop
endif

if (Kata sandi sesuai?) then (Ya)
  :Membentuk sesi login pengguna;
  :Memuat profil, peran, OPD, dan status kesiapan TTE;
  :Membersihkan data sesi lama yang tidak relevan;
  :Menentukan halaman tujuan berdasarkan peran atau halaman asal;
  :Mengarahkan pengguna ke dashboard yang sesuai;
else (Tidak)
  :Menampilkan pesan login gagal tanpa membuka detail alasan keamanan;
  stop
endif

stop
@enduml
```
