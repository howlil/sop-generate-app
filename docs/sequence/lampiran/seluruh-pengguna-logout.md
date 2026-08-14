# Sequence Diagram: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Pendukung login |
| Tujuan | Menggambarkan interaksi pengguna dan sistem saat mengakhiri sesi penggunaan aplikasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Logout
autonumber
autoactivate on

actor "Pengguna" as A
boundary "Antarmuka Sistem" as B
control "Pengelola Autentikasi" as C
entity "Sesi Pengguna" as D

A -> B : Memilih menu keluar
B -> C : Meminta pengakhiran sesi
C -> D : Mengakhiri sesi pengguna
D --> C : Sesi berakhir
C --> B : Mengonfirmasi proses keluar
B --> A : Mengarahkan ke halaman login atau halaman publik

@enduml
```
