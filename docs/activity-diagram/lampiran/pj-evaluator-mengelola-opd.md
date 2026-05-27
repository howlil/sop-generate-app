# Diagram Aktivitas: PJ Evaluator - Mengelola OPD

Sumber use case: `UC-05` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola OPD |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 1 |
| Tujuan | Menjelaskan proses PJ Evaluator menambah, mengubah, atau menonaktifkan data OPD. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola OPD

|PJ Evaluator|
start
:Membuka halaman pengelolaan OPD;

|Sistem|
:Memeriksa hak akses PJ Evaluator;
:Menampilkan daftar OPD;

|PJ Evaluator|
:Memilih tambah, ubah, atau nonaktifkan OPD;
:Mengisi atau memperbarui data OPD;
:Menyimpan perubahan;

|Sistem|
:Memeriksa kelengkapan dan kesesuaian data OPD;
if (Data OPD valid?) then (Ya)
  :Menyimpan perubahan data OPD;
  :Menampilkan pemberitahuan berhasil;
else (Tidak)
  :Menolak penyimpanan;
  :Menampilkan alasan data belum sesuai;
endif

stop
@enduml
```

