# Diagram Aktivitas: Seluruh Pengguna - Login

Sumber use case: `UC-01` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 7 |
| Tujuan | Menjelaskan proses pengguna masuk ke dalam sistem menggunakan akun yang telah terdaftar. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Login

|Pengguna|
start
:Membuka halaman login;
:Mengisi identitas akun dan kata sandi;
:Mengirim permintaan login;

|Sistem|
:Memeriksa kelengkapan data login;
if (Data login lengkap?) then (Ya)
  :Mencari akun pengguna;
else (Tidak)
  :Menampilkan pesan bahwa data belum lengkap;
  stop
endif

if (Akun ditemukan dan masih aktif?) then (Ya)
  :Memeriksa kecocokan kata sandi;
else (Tidak)
  :Menampilkan pesan login gagal;
  stop
endif

if (Kata sandi sesuai?) then (Ya)
  :Membuat sesi pengguna;
  :Menampilkan halaman utama sesuai peran pengguna;
else (Tidak)
  :Menampilkan pesan login gagal;
endif

stop
@enduml
```

