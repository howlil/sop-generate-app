# Sequence Diagram: Seluruh Pengguna - Logout

Sumber use case: `UC-02` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Logout |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | — |
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
boundary "Antarmuka Aplikasi" as B
control "Pengelola Sesi" as C
entity "Sesi Pengguna" as D

A -> B : Memilih logout
B -> C : Meminta pengakhiran sesi
C -> D : Mengakhiri sesi pengguna
D --> C : Sesi berakhir
C --> B : Mengonfirmasi logout
B --> A : Menampilkan halaman login

@enduml
```
