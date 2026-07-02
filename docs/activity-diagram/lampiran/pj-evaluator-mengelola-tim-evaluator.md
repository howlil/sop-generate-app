# Diagram Aktivitas: PJ Evaluator - Mengelola Tim Evaluator

Sumber use case: `UC-06` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Evaluator |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 2 |
| Tujuan | Menjelaskan proses PJ Evaluator mengelola akun evaluator beserta validasi identitas dan status aktif. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Tim Evaluator

|PJ Evaluator|
start
:Membuka halaman tim evaluator;

|Sistem|
:Memeriksa sesi dan peran PJ Evaluator;
:Menampilkan daftar evaluator, status akun, identitas, OPD terkait, dan aksi pengelolaan;

|PJ Evaluator|
:Memilih tambah, ubah, atau nonaktifkan evaluator;

if (Tambah atau ubah evaluator?) then (Ya)
  :Mengisi email, nama, NIP, jabatan, pangkat, nomor HP, password awal, dan OPD bila diperlukan;
else (Nonaktifkan)
  :Mengonfirmasi penonaktifan akun evaluator;
endif

:Menyimpan perubahan evaluator;

|Sistem|
:Memvalidasi peran target evaluator, field wajib, email unik, NIP unik, dan status akun;

if (Data evaluator valid?) then (Ya)
  :Membuat akun evaluator, memperbarui profil, atau menonaktifkan akun;
  :Menampilkan daftar evaluator terbaru dan notifikasi berhasil;
else (Tidak)
  :Menampilkan pesan validasi, konflik identitas, atau akun tidak ditemukan;
endif

stop
@enduml
```
