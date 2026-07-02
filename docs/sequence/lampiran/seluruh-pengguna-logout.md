# Sequence Diagram: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Pendukung login |
| Tujuan | Menggambarkan proses keluar dari sistem, pengakhiran sesi aktif, dan pembersihan tampilan pengguna. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Logout
autonumber
autoactivate on

actor "Pengguna" as A
boundary "Menu Profil / Header" as B
control "Pengelola Autentikasi" as C
control "Pengelola Sesi" as D
entity "Pengguna" as Pengguna
entity "Sesi Pengguna" as Sesi

A -> B : Memilih keluar
B --> A : Menampilkan proses keluar
B -> C : Meminta pengakhiran akses pengguna
C -> D : Memeriksa sesi yang sedang aktif
D -> Sesi : Mencari catatan sesi pengguna
Sesi --> D : Informasi sesi
alt Sesi aktif ditemukan
  D -> Sesi : Menandai sesi sebagai berakhir
  Sesi --> D : Sesi berhasil diakhiri
  D --> C : Pengakhiran sesi berhasil
else Sesi tidak ditemukan
  D --> C : Tidak ada sesi yang perlu diakhiri
end
C --> B : Mengirim hasil keluar dari sistem
B --> A : Menampilkan halaman publik atau halaman login

@enduml
```
