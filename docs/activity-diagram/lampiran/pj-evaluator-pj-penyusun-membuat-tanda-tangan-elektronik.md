# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menjelaskan proses pengguna yang berwenang membuat atau memperbarui PIN tanda tangan elektronik. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Membuat Tanda Tangan Elektronik

|PJ Evaluator / PJ Penyusun|
start
:Membuka halaman pengaturan tanda tangan elektronik;

|Sistem|
:Memeriksa hak akses pengguna;
:Menampilkan formulir pengaturan PIN;

|PJ Evaluator / PJ Penyusun|
:Mengisi PIN baru dan konfirmasi PIN;
:Mengirim data PIN;

|Sistem|
:Memeriksa format PIN;
:Memeriksa kesesuaian PIN dan konfirmasi PIN;
if (PIN dapat digunakan?) then (Ya)
  :Menyimpan PIN dalam bentuk aman;
  :Menampilkan pemberitahuan bahwa PIN berhasil dibuat atau diperbarui;
else (Tidak)
  :Menolak penyimpanan PIN;
  :Menampilkan alasan kegagalan;
endif

stop
@enduml
```

