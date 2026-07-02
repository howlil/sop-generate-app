# Diagram Aktivitas: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Pendukung login |
| Tujuan | Menjelaskan proses pengguna keluar, pencabutan sesi aktif, pembersihan data login, dan pengalihan ke halaman publik atau login. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Logout

|Pengguna|
start
:Memilih menu keluar;

|Sistem|
:Menerima permintaan keluar dari akun aktif;
:Memeriksa sesi pengguna yang sedang berjalan;

if (Sesi aktif ditemukan?) then (Ya)
  :Mencabut sesi agar tidak dapat digunakan kembali;
else (Tidak)
  :Melanjutkan proses keluar tanpa menampilkan error;
endif

:Menghapus informasi autentikasi dari perangkat pengguna;
:Membersihkan data halaman yang terkait akun sebelumnya;
:Menampilkan status logout berhasil;
:Mengalihkan pengguna ke halaman publik atau login;

stop
@enduml
```
