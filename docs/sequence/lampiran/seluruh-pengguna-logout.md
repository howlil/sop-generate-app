# Sequence Diagram: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Pendukung login |
| Tujuan | Menggambarkan proses pengguna keluar dari sistem dan mengakhiri sesi akses. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Logout
autonumber

actor "Pengguna" as Aktor
boundary "Menu Profil" as UI
control "Auth Controller" as AuthCtrl
entity "Sesi Pengguna" as Sesi

Aktor -> UI : Memilih menu keluar
UI -> AuthCtrl : Mengirim permintaan logout
AuthCtrl -> Sesi : Menghapus atau membatalkan sesi aktif
Sesi --> AuthCtrl : Sesi berhasil diakhiri
AuthCtrl --> UI : Mengirim konfirmasi logout
UI --> Aktor : Menampilkan halaman publik atau login

@enduml
```

