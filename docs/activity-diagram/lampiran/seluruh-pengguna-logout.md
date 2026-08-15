# Diagram Aktivitas: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Pendukung login |
| Tujuan | Menggambarkan proses pengguna keluar dari sistem setelah selesai menggunakan aplikasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Logout

|Pengguna|
start
:Memilih menu keluar;

|Sistem|
:Mengakhiri akses pengguna;
:Mengarahkan pengguna ke halaman login atau halaman publik;

|Pengguna|
:Keluar dari area pengguna;

stop

@enduml
```
