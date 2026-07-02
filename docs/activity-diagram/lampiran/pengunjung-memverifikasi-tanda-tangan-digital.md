# Diagram Aktivitas: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menjelaskan proses publik mengunggah PDF dan memverifikasi tanda tangan PKCS#7 terhadap CA internal aplikasi. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Memverifikasi Tanda Tangan Digital

|Pengunjung|
start
:Membuka halaman validasi PDF;

|Sistem|
:Menampilkan status layanan verifikasi tanda tangan digital dan informasi CA internal;

|Pengunjung|
:Memilih file PDF untuk diperiksa;
:Mengirim file untuk diverifikasi;

|Sistem|
:Memvalidasi tipe file dan struktur PDF;

if (File bukan PDF atau rusak?) then (Ya)
  :Menampilkan alasan file tidak dapat diverifikasi;
  stop
else (Tidak)
endif

:Mencari tanda tangan digital yang tertanam pada PDF;

if (PDF memiliki tanda tangan digital?) then (Ya)
  :Memverifikasi tanda tangan terhadap CA internal yang dikonfigurasi;
  :Membaca subjek, penerbit, fingerprint, masa berlaku, dan status validitas;
else (Tidak)
  :Menandai PDF tidak memiliki tanda tangan digital;
endif

if (Semua tanda tangan valid?) then (Ya)
  :Menampilkan hasil semua tanda tangan valid;
elseif (Ada tanda tangan tetapi tidak valid?) then (Ya)
  :Menampilkan daftar tanda tangan yang tidak valid beserta alasannya;
else (Tidak ada tanda tangan)
  :Menampilkan PDF tidak memiliki tanda tangan digital;
endif

stop
@enduml
```
