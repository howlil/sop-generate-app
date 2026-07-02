# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun, Kepala OPD |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menjelaskan setup TTE berupa PIN dan sertifikat P12 untuk aktor yang berwenang menandatangani BA atau SOP. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Membuat Tanda Tangan Elektronik

|Pengguna Berwenang|
start
:Membuka halaman profil atau pengaturan TTE;

|Sistem|
:Memeriksa sesi dan peran yang berwenang menandatangani;
:Menampilkan status TTE, status PIN, status sertifikat, dan pilihan pengelolaan;

|Pengguna Berwenang|
if (Setup awal dengan sertifikat otomatis?) then (Ya)
  :Mengisi PIN dan konfirmasi PIN;
elseif (Setup awal dengan unggah sertifikat?) then (Ya)
  :Memilih file P12, mengisi passphrase, PIN, dan konfirmasi PIN;
elseif (Ubah PIN?) then (Ya)
  :Mengisi PIN lama dan PIN baru;
elseif (Membuat ulang sertifikat?) then (Ya)
  :Mengisi PIN aktif;
else (Mengunggah sertifikat baru)
  :Memilih file P12 dan mengisi PIN aktif serta passphrase;
endif

:Menyimpan pengaturan TTE;

|Sistem|
:Memvalidasi kewenangan, format PIN, konfirmasi PIN, PIN lama atau aktif, file P12, dan passphrase;

if (Data TTE valid?) then (Ya)
  :Menyimpan PIN TTE secara aman;
  :Menyimpan atau memperbarui sertifikat pengguna;
  :Menampilkan profil TTE terbaru dan notifikasi berhasil;
else (Tidak)
  :Menampilkan error PIN, sertifikat, passphrase, atau kewenangan pengguna;
endif

stop
@enduml
```
