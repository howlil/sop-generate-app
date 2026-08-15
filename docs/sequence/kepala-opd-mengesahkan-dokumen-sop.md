# Sequence Diagram: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18 |
| Tujuan | Menggambarkan interaksi Kepala OPD dan sistem saat mengesahkan SOP yang telah menyelesaikan proses evaluasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengesahkan Dokumen SOP
autonumber
autoactivate on

actor "Kepala OPD" as A
boundary "Halaman Pengesahan SOP" as B
control "Pengelola Pengesahan" as C
entity "Pengajuan dan SOP" as D

A -> B : Membuka pengajuan siap disahkan
B -> C : Meminta dokumen pengesahan
C -> D : Mengambil pengajuan dan SOP
D --> C : Dokumen yang siap disahkan
C --> B : Mengirim dokumen pengesahan
B --> A : Menampilkan SOP yang akan disahkan

A -> B : Mengesahkan SOP
B -> C : Meminta pengesahan
C -> D : Mencatat pengesahan SOP
D --> C : Pengesahan tersimpan
C --> B : Mengirim hasil pengesahan
B --> A : Menampilkan SOP telah disahkan

@enduml
```
