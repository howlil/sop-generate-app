# Diagram Aktivitas: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Pendukung login |
| Tujuan | Menggambarkan proses pengguna mengakhiri sesi penggunaan sistem. |

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
:Mengakhiri sesi pengguna;
:Menghapus akses dari sesi yang sedang digunakan;
:Mengarahkan pengguna ke halaman login atau halaman publik;

stop

@enduml
```
