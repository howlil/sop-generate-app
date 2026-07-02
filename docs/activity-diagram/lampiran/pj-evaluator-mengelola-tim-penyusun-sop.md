# Diagram Aktivitas: PJ Evaluator - Mengelola Tim Penyusun SOP

Sumber use case: `UC-08` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Nomor kebutuhan fungsional | 3 |
| Tujuan | Menjelaskan proses PJ Evaluator mengelola akun PJ Penyusun dan Penyusun, termasuk mutasi OPD dan riwayat penugasan. |

## PlantUML

```plantuml
@startuml
title Diagram Aktivitas - Mengelola Tim Penyusun SOP

|PJ Evaluator|
start
:Membuka halaman manajemen penyusun;

|Sistem|
:Memeriksa sesi dan peran PJ Evaluator;
:Menampilkan daftar PJ Penyusun dan Penyusun per OPD, status aktif, dan riwayat mutasi;

|PJ Evaluator|
:Memilih tambah, ubah profil, pindah OPD, aktifkan, nonaktifkan, atau hapus akun;

if (Tambah atau ubah profil?) then (Ya)
  :Mengisi identitas, peran, OPD, jabatan, pangkat, kontak, dan kredensial bila diperlukan;
elseif (Pindah OPD?) then (Ya)
  :Memilih OPD tujuan dan tanggal mulai penugasan;
elseif (Aktifkan atau nonaktifkan?) then (Ya)
  :Mengonfirmasi perubahan status akun;
else (Hapus)
  :Mengonfirmasi penghapusan akun;
endif

:Menyimpan perubahan tim penyusun;

|Sistem|
:Memvalidasi identitas akun, peran PJ Penyusun atau Penyusun, OPD aktif, email atau NIP unik, dan aturan satu PJ Penyusun aktif per OPD;

if (Data dapat disimpan?) then (Ya)
  :Menyimpan akun atau perubahan profil;
  :Memperbarui riwayat OPD sehingga hanya penugasan aktif yang berlaku;
  :Mengaktifkan, menonaktifkan, atau menghapus akun sesuai aksi;
  :Menampilkan daftar terbaru dan notifikasi berhasil;
else (Tidak)
  :Menampilkan pesan validasi, konflik PJ aktif, identitas duplikat, atau OPD tidak valid;
endif

stop
@enduml
```
