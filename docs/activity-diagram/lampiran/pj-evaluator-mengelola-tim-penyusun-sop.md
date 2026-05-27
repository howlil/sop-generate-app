# Diagram Aktivitas: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menjelaskan proses PJ Evaluator mengelola akun PJ Penyusun dan Penyusun pada OPD. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Tim Penyusun SOP

|PJ Evaluator|
start
:Membuka halaman tim penyusun SOP;

|Sistem|
:Memeriksa hak akses PJ Evaluator;
:Menampilkan daftar tim penyusun per OPD;

|PJ Evaluator|
:Memilih tambah, ubah, atau nonaktifkan anggota tim;
:Mengisi data akun dan OPD penugasan;
:Menyimpan perubahan;

|Sistem|
:Memeriksa kelengkapan data akun;
:Memeriksa aturan penugasan pada OPD;
if (Data tim penyusun valid?) then (Ya)
  :Menyimpan data tim penyusun;
  :Mencatat riwayat penugasan pengguna;
  :Menampilkan pemberitahuan berhasil;
else (Tidak)
  :Menolak penyimpanan;
  :Menampilkan alasan kegagalan;
endif

stop
@enduml
```

