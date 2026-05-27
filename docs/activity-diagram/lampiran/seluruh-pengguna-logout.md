# Diagram Aktivitas: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Pendukung login |
| Tujuan | Menjelaskan proses pengguna keluar dari sistem dan mengakhiri sesi akses. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Logout

|Pengguna|
start
:Memilih menu keluar dari sistem;

|Sistem|
:Menerima permintaan logout;
:Menghapus sesi pengguna yang aktif;
:Membersihkan informasi pengguna dari aplikasi;
:Menampilkan halaman publik atau halaman login;

stop
@enduml
```

